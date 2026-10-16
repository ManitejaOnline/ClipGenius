"use client";

import React, { useState, useRef, useEffect, TouchEvent } from "react";
import HighlightGraph, { GraphPoint } from "./HighlightGraph";
import { formatTime } from "../utils/formatTime";

interface VideoPreview {
  outputPath: string;
  startTime: number;
  duration: number;
  hasCaptions: boolean;
}

interface VideoInfo {
  videoId: string;
  title: string;
  channel: string;
  duration: number;
  thumbnail: string;
  isLive: boolean;
  hasMostReplayed: boolean;
  hasCaptions: boolean;
}

type HighlightMethod = "most-replayed" | "loudest" | "evenly-spaced" | "whole-video";

interface Job {
  id: string;
  status: "running" | "done" | "error";
  step: string;
  progress: number;
  method: HighlightMethod | null;
  note: string | null;
  graph: GraphPoint[] | null;
  videoDuration: number | null;
  previews: VideoPreview[] | null;
  error: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

type InfoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: VideoInfo }
  | { status: "error"; error: string };

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const CLIP_DURATIONS = [15, 30, 60];
const CLIP_COUNTS = [3, 4, 5];
const JOB_POLL_INTERVAL_MS = 1500;

const METHOD_LABELS: Record<HighlightMethod, string> = {
  "most-replayed": "Picked from the moments viewers replay most on YouTube.",
  "loudest": "This video has no \"Most replayed\" data, so clips were picked from its loudest moments.",
  "evenly-spaced": "This video has no \"Most replayed\" data, so clips are spread evenly through it.",
  "whole-video": "The video is shorter than the clip length, so this is the whole video.",
};

const GRAPH_TITLES: Record<HighlightMethod, string> = {
  "most-replayed": "Most replayed",
  "loudest": "Loudness",
  "evenly-spaced": "Timeline",
  "whole-video": "Timeline",
};

const YOUTUBE_HOSTS = ["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "www.youtube-nocookie.com"];

// Accepts watch, youtu.be, Shorts, live and embed links
const extractVideoId = (url: string): string | null => {
  try {
    const urlObj = new URL(url.trim());
    let id: string | null | undefined = null;
    if (urlObj.hostname === "youtu.be") {
      id = urlObj.pathname.split("/")[1];
    } else if (YOUTUBE_HOSTS.includes(urlObj.hostname)) {
      id = urlObj.searchParams.get("v") || urlObj.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]{11})/)?.[1];
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface SegmentedControlProps<T extends string | number> {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled: boolean;
}

const SegmentedControl = <T extends string | number>({ label, options, value, onChange, disabled }: SegmentedControlProps<T>) => (
  <div className="flex items-center gap-3">
    <span className="text-sm font-medium text-gray-300">{label}</span>
    <div className="inline-flex rounded-lg border border-gray-700 overflow-hidden" role="group" aria-label={label}>
      {options.map(option => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          disabled={disabled}
          aria-pressed={value === option.id}
          className={`px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed ${
            value === option.id
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    disabled={disabled}
    className="flex items-center gap-2 text-sm text-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
  >
    <span
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-gray-700'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-4' : ''
        }`}
      />
    </span>
    {label}
  </button>
);

const HeroForm: React.FC = () => {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState<InfoState>({ status: "idle" });
  const [clipDuration, setClipDuration] = useState(30);
  const [captions, setCaptions] = useState(true);
  const [clipCount, setClipCount] = useState(3);
  const [blurBackground, setBlurBackground] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const activeJobId = useRef<string | null>(null);
  const jobClipDuration = useRef(clipDuration);

  const videoId = extractVideoId(url);
  const previews = job?.previews ?? null;
  const isBusy = isLoading || isEditing;
  const canEdit = !!job?.id && job.method !== "whole-video";
  const captionsAvailable = info.status !== "ready" || info.data.hasCaptions;

  useEffect(() => {
    if (!videoId) {
      setInfo({ status: "idle" });
      return;
    }

    setInfo({ status: "loading" });
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/video-info?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`,
          { signal: controller.signal }
        );
        const body: ApiResponse<VideoInfo> = await response.json();
        if (!body.success || !body.data) throw new Error(body.error || "Couldn't load this video");
        setInfo({ status: "ready", data: body.data });
      } catch (err) {
        if (controller.signal.aborted) return;
        setInfo({ status: "error", error: err instanceof Error ? err.message : "Couldn't load this video" });
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [videoId]);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchEndX.current - touchStartX.current;
    if (Math.abs(swipeDistance) > 50) { // minimum swipe distance
      if (swipeDistance > 0) {
        handlePrevPreview();
      } else {
        handleNextPreview();
      }
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError(null);
  };

  const handleNextPreview = () => {
    if (previews && previews.length > 0) {
      setCurrentPreviewIndex(prev => (prev + 1) % previews.length);
    }
  };

  const handlePrevPreview = () => {
    if (previews && previews.length > 0) {
      setCurrentPreviewIndex(prev => (prev - 1 + previews.length) % previews.length);
    }
  };

  const pollJob = async (jobId: string) => {
    while (activeJobId.current === jobId) {
      await sleep(JOB_POLL_INTERVAL_MS);
      const response = await fetch(`${BACKEND_URL}/api/jobs/${jobId}`);
      const body: ApiResponse<Job> = await response.json();
      if (!body.success || !body.data) throw new Error(body.error || "Lost track of this job");
      if (activeJobId.current !== jobId) return;
      setJob(body.data);
      if (body.data.status === "error") throw new Error(body.data.error || "Failed to process video");
      if (body.data.status === "done") return;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    if (!videoId) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentPreviewIndex(0);
    jobClipDuration.current = clipDuration;
    setJob({
      id: "",
      status: "running",
      step: "Starting",
      progress: 0,
      method: null,
      note: null,
      graph: null,
      videoDuration: null,
      previews: null,
      error: null,
    });

    try {
      const response = await fetch(`${BACKEND_URL}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: `https://www.youtube.com/watch?v=${videoId}`,
          clipDuration,
          clipCount,
          captions: captions && captionsAvailable,
          framing: blurBackground ? "blur" : "crop",
        }),
      });

      const body: ApiResponse<{ jobId: string }> = await response.json();
      if (!body.success || !body.data) {
        throw new Error(body.error || "Failed to process video");
      }

      activeJobId.current = body.data.jobId;
      await pollJob(body.data.jobId);
    } catch (err) {
      setJob(null);
      setError(err instanceof Error ? err.message : "Failed to process video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClip = async (startTime: number) => {
    if (!job?.id || !previews) return;
    const jobId = job.id;
    const newClipIndex = previews.length;

    setIsEditing(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/jobs/${jobId}/clips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startTime: Math.max(0, startTime) }),
      });
      const body: ApiResponse<{ jobId: string }> = await response.json();
      if (!body.success) throw new Error(body.error || "Couldn't add the clip");

      setJob(prev => prev && { ...prev, status: "running", step: "Cutting clip", progress: 0.1 });
      activeJobId.current = jobId;
      await pollJob(jobId);
      setCurrentPreviewIndex(newClipIndex);
    } catch (err) {
      setJob(prev => prev && { ...prev, status: "done" });
      setError(err instanceof Error ? err.message : "Couldn't add the clip");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto" aria-label="Video conversion form">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="Paste YouTube URL..."
              className={`w-full px-4 py-2 rounded bg-gray-800 text-white border ${
                error ? 'border-red-500' : 'border-gray-700'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              aria-label="YouTube video URL"
              aria-invalid={!!error}
              aria-describedby={error ? "url-error" : undefined}
              required
              disabled={isBusy}
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isBusy || (info.status === "ready" && info.data.isLive)}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                'Generate Shorts'
              )}
            </button>
          </div>

          {/* Video Preview Card */}
          {videoId && (
            <div className="flex gap-4 p-3 rounded-lg bg-gray-800/60 border border-gray-700 text-left" aria-live="polite">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                alt=""
                className="w-36 aspect-video object-cover rounded flex-shrink-0"
              />
              <div className="min-w-0 flex flex-col justify-center gap-1">
                {info.status === "loading" && (
                  <>
                    <div className="h-4 w-48 max-w-full bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 w-32 max-w-full bg-gray-700 rounded animate-pulse" />
                  </>
                )}
                {info.status === "error" && (
                  <p className="text-red-400 text-sm">{info.error}</p>
                )}
                {info.status === "ready" && (
                  <>
                    <p className="text-white font-medium line-clamp-2">{info.data.title}</p>
                    <p className="text-gray-400 text-sm">
                      {info.data.channel}
                      {!info.data.isLive && ` · ${formatTime(info.data.duration)}`}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {info.data.isLive
                        ? "Live streams can't be clipped until the stream ends."
                        : info.data.hasMostReplayed
                          ? "Clips will come from the most replayed moments."
                          : "No \"Most replayed\" data, so clips will come from the loudest moments."}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Clip Options */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <SegmentedControl<number>
              label="Clip length"
              options={CLIP_DURATIONS.map(duration => ({ id: duration, label: `${duration}s` }))}
              value={clipDuration}
              onChange={setClipDuration}
              disabled={isBusy}
            />
            <SegmentedControl<number>
              label="Clips"
              options={CLIP_COUNTS.map(count => ({ id: count, label: String(count) }))}
              value={clipCount}
              onChange={setClipCount}
              disabled={isBusy}
            />
            <div className="flex items-center gap-5">
              <Toggle
                label={captionsAvailable ? "Captions" : "No captions available"}
                checked={captions && captionsAvailable}
                onChange={setCaptions}
                disabled={isBusy || !captionsAvailable}
              />
              <Toggle
                label="Blurred background"
                checked={blurBackground}
                onChange={setBlurBackground}
                disabled={isBusy}
              />
            </div>
          </div>
          {blurBackground && (
            <p className="text-xs text-gray-500 -mt-2">
              Shows the whole frame over a blurred copy instead of cropping the sides off.
            </p>
          )}

          {error && (
            <p id="url-error" className="text-red-500 text-sm mt-2" role="alert">
              {error}
            </p>
          )}

          {job?.status === "running" && (
            <div className="mt-2" role="status">
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>{job.step}…</span>
                <span>{Math.round(job.progress * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${Math.max(job.progress, 0.02) * 100}%` }}
                />
              </div>
            </div>
          )}

          {job?.status === "done" && (
            <div className="text-sm mt-2 space-y-1">
              <p className="text-green-500">Your shorts are ready!</p>
              {job.method && <p className="text-gray-400">{METHOD_LABELS[job.method]}</p>}
              {job.note && <p className="text-gray-400">{job.note}</p>}
            </div>
          )}
        </div>
      </form>

      {previews && previews.length > 0 && (
        <div className="mt-8 flex flex-col items-center">
          <div
            className="relative w-full max-w-6xl flex items-center justify-center px-12 md:px-4"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Previous Button - Smaller and responsive */}
            <button
              onClick={handlePrevPreview}
              className="absolute left-0 md:left-4 z-20 p-2 md:p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors transform hover:scale-110"
              aria-label="Previous preview"
            >
              <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Preview Container */}
            <div className="flex items-center justify-center gap-2 md:gap-4 w-full">
              {/* Previous Preview (Blurred) */}
              {currentPreviewIndex > 0 && (
                <div className="relative w-[120px] md:w-[250px] h-[240px] md:h-[500px] opacity-50 blur-sm transition-all duration-300 hidden md:block">
                  <video
                    src={previews[currentPreviewIndex - 1].outputPath}
                    className="w-full h-full object-cover rounded-xl"
                    playsInline
                    muted
                  />
                </div>
              )}

              {/* Current Preview */}
              <div className="relative w-full max-w-[270px] md:max-w-[360px] aspect-[9/16] z-10">
                <div className="w-full h-full bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
                  <video
                    key={previews[currentPreviewIndex].outputPath}
                    src={previews[currentPreviewIndex].outputPath}
                    className="w-full h-full object-contain"
                    controls
                    playsInline
                  />
                </div>
              </div>

              {/* Next Preview (Blurred) */}
              {currentPreviewIndex < previews.length - 1 && (
                <div className="relative w-[120px] md:w-[250px] h-[240px] md:h-[500px] opacity-50 blur-sm transition-all duration-300 hidden md:block">
                  <video
                    src={previews[currentPreviewIndex + 1].outputPath}
                    className="w-full h-full object-cover rounded-xl"
                    playsInline
                    muted
                  />
                </div>
              )}
            </div>

            {/* Next Button - Smaller and responsive */}
            <button
              onClick={handleNextPreview}
              className="absolute right-0 md:right-4 z-20 p-2 md:p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors transform hover:scale-110"
              aria-label="Next preview"
            >
              <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            Clip {currentPreviewIndex + 1} of {previews.length}
          </p>

          {canEdit && job?.videoDuration && (
            <div className="mt-6 w-full flex justify-center px-3">
              <HighlightGraph
                title={GRAPH_TITLES[job.method ?? "evenly-spaced"]}
                points={job.graph}
                videoDuration={job.videoDuration}
                clips={previews}
                currentIndex={currentPreviewIndex}
                disabled={isBusy}
                onSelectClip={setCurrentPreviewIndex}
                onPickTime={time => handleAddClip(time - jobClipDuration.current / 2)}
              />
            </div>
          )}

          {/* Download Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row flex-wrap justify-center gap-3 px-3">
            <a
              href={`${previews[currentPreviewIndex].outputPath}?download`}
              download
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition-colors gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Clip
            </a>
            {previews.length > 1 && job?.id && (
              <a
                href={`${BACKEND_URL}/api/jobs/${job.id}/zip`}
                download
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-600 hover:bg-gray-800 rounded-lg font-semibold text-white transition-colors gap-2"
              >
                Download All (.zip)
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroForm;
