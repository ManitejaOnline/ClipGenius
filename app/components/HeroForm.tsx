"use client";

import React, { useState } from "react";

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
  });

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({
      ...prev,
      url: e.target.value,
      error: null,
      previews: null,
      progress: null,
    }));
  };

  const checkFFmpegAvailability = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/process');
      const data = await response.json();
      return data.success;
    } catch {
      return false;
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
      progress: "Checking system requirements...",
    }));

    // Check if FFmpeg is available
    const isFFmpegAvailable = await checkFFmpegAvailability();
    if (!isFFmpegAvailable) {
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        error: "FFmpeg is not installed. Please install FFmpeg to process videos.",
      }));
      return;
    }

    try {
      setFormState(prev => ({ ...prev, progress: "Generating previews..." }));
      
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: formState.url,
          resolution: {
            width: 1080,
            height: 1920,
          },
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
      <form
        id="start"
        onSubmit={handleSubmit}
        className="w-full max-w-xl mx-auto"
        aria-label="Video conversion form"
      >
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
              aria-label="Generate shorts from video"
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
                'Generate Previews'
              )}
            </button>
          </div>
          
          {formState.error && (
            <p id="url-error" className="text-red-500 text-sm mt-2 text-left" role="alert">
              {formState.error}
            </p>
          )}
          
          {formState.progress && !formState.error && (
            <p className="text-green-500 text-sm mt-2 text-left">
              {formState.progress}
            </p>
          )}
        </div>
      </form>

      {formState.previews && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {formState.previews.map((preview, index) => (
            <div key={index} className="flex flex-col items-center gap-4 p-6 bg-gray-800 rounded-lg shadow-lg">
              <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden">
                <video
                  src={preview.outputPath}
                  className="absolute inset-0 w-full h-full object-cover"
                  controls
                  poster={preview.thumbnail}
                />
              </div>
              <div className="text-sm text-gray-300 font-medium">
                Preview {index + 1} - Start: {preview.startTime}s
              </div>
              <a
                href={preview.outputPath}
                download
                className="inline-flex items-center px-6 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition-colors gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Preview
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroForm; 