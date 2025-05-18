"use client";

import React, { useState, useRef, TouchEvent } from "react";

interface VideoPreview {
  outputPath: string;
  startTime: number;
  duration: number;
  thumbnail?: string;
}

interface FormState {
  url: string;
  isLoading: boolean;
  error: string | null;
  previews: VideoPreview[] | null;
  progress: string | null;
  currentPreviewIndex: number;
}

interface ProcessResponse {
  success: boolean;
  message: string;
  data?: {
    previews: VideoPreview[];
  };
  error?: string;
}

const isValidYouTubeUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return (
      (urlObj.hostname === "youtube.com" ||
        urlObj.hostname === "www.youtube.com" ||
        urlObj.hostname === "youtu.be") &&
      (url.includes("watch?v=") || urlObj.hostname === "youtu.be")
    );
  } catch {
    return false;
  }
};

const HeroForm: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    url: "",
    isLoading: false,
    error: null,
    previews: null,
    progress: null,
    currentPreviewIndex: 0
  });

  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

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
    setFormState(prev => ({
      ...prev,
      url: e.target.value,
      error: null,
      previews: null,
      progress: null,
    }));
  };

  const handleNextPreview = () => {
    if (formState.previews && formState.previews.length > 0) {
      setFormState(prev => ({
        ...prev,
        currentPreviewIndex: (prev.currentPreviewIndex + 1) % formState.previews!.length
      }));
    }
  };

  const handlePrevPreview = () => {
    if (formState.previews && formState.previews.length > 0) {
      setFormState(prev => ({
        ...prev,
        currentPreviewIndex: (prev.currentPreviewIndex - 1 + formState.previews!.length) % formState.previews!.length
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formState.url.trim()) {
      setFormState(prev => ({
        ...prev,
        error: "Please enter a YouTube URL",
      }));
      return;
    }

    if (!isValidYouTubeUrl(formState.url)) {
      setFormState(prev => ({
        ...prev,
        error: "Please enter a valid YouTube URL",
      }));
      return;
    }

    setFormState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      previews: null,
      progress: "Processing video...",
    }));

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: formState.url,
        }),
      });

      const data: ProcessResponse = await response.json();

      if (!data.success || !data.data?.previews) {
        throw new Error(data.error || 'Failed to process video');
      }

      setFormState(prev => ({
        ...prev,
        previews: data.data!.previews,
        progress: "Previews generated successfully!",
      }));
      
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to process video. Please try again.",
      }));
    } finally {
      setFormState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto" aria-label="Video conversion form">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="url"
              value={formState.url}
              onChange={handleUrlChange}
              placeholder="Paste YouTube URL..."
              className={`w-full px-4 py-2 rounded bg-gray-800 text-white border ${
                formState.error ? 'border-red-500' : 'border-gray-700'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              aria-label="YouTube video URL"
              aria-invalid={!!formState.error}
              aria-describedby={formState.error ? "url-error" : undefined}
              required
              disabled={formState.isLoading}
            />
            <button
              type="submit"
              className={`${
                formState.isLoading
                  ? 'bg-blue-700 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } px-6 py-2 rounded font-semibold transition-colors min-w-[160px] text-white`}
              disabled={formState.isLoading}
            >
              {formState.isLoading ? (
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
          
          {formState.error && (
            <p id="url-error" className="text-red-500 text-sm mt-2" role="alert">
              {formState.error}
            </p>
          )}
          
          {formState.progress && !formState.error && (
            <p className="text-green-500 text-sm mt-2">
              {formState.progress}
            </p>
          )}
        </div>
      </form>

      {formState.previews && (
        <div className="mt-8 flex flex-col items-center">
          <div className="relative w-full max-w-6xl flex items-center justify-center px-4">
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
              {formState.currentPreviewIndex > 0 && (
                <div className="relative w-[120px] md:w-[250px] h-[240px] md:h-[500px] opacity-50 blur-sm transition-all duration-300 hidden md:block">
                  <video
                    src={formState.previews[(formState.currentPreviewIndex - 1)].outputPath}
                    className="w-full h-full object-cover rounded-xl"
                    poster={formState.previews[(formState.currentPreviewIndex - 1)].thumbnail}
                    playsInline
                    muted
                  />
                </div>
              )}

              {/* Current Preview */}
              <div className="relative w-[270px] md:w-[360px] h-[540px] md:h-[720px] z-10">
                <div className="w-full h-full bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
                  <video
                    src={formState.previews[formState.currentPreviewIndex].outputPath}
                    className="w-full h-full object-cover"
                    controls
                    poster={formState.previews[formState.currentPreviewIndex].thumbnail}
                    playsInline
                  />
                </div>
              </div>

              {/* Next Preview (Blurred) */}
              {formState.currentPreviewIndex < formState.previews.length - 1 && (
                <div className="relative w-[120px] md:w-[250px] h-[240px] md:h-[500px] opacity-50 blur-sm transition-all duration-300 hidden md:block">
                  <video
                    src={formState.previews[(formState.currentPreviewIndex + 1)].outputPath}
                    className="w-full h-full object-cover rounded-xl"
                    poster={formState.previews[(formState.currentPreviewIndex + 1)].thumbnail}
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

          {/* Download Button */}
          <a
            href={formState.previews[formState.currentPreviewIndex].outputPath}
            download
            className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition-colors gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Preview
          </a>
        </div>
      )}
    </div>
  );
};

export default HeroForm; 