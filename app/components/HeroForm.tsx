"use client";

import React, { useState } from "react";

interface FormState {
  url: string;
  isLoading: boolean;
  error: string | null;
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
  });

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({
      ...prev,
      url: e.target.value,
      error: null,
    }));
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
    }));

    try {
      // TODO: Implement API call to process video
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      // Handle successful processing
      console.log("Processing video:", formState.url);
      
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        error: "Failed to process video. Please try again.",
      }));
    } finally {
      setFormState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  return (
    <form
      id="start"
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto flex flex-col gap-4"
      aria-label="Video conversion form"
    >
      <div className="w-full">
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
            } px-6 py-2 rounded font-semibold transition-colors min-w-[160px]`}
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
              'Generate Shorts'
            )}
          </button>
        </div>
        {formState.error && (
          <p id="url-error" className="text-red-500 text-sm mt-2 text-left" role="alert">
            {formState.error}
          </p>
        )}
      </div>
    </form>
  );
};

export default HeroForm; 