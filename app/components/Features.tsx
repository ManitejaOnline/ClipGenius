"use client";

import React from "react";

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-gray-900 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h3 className="text-3xl font-bold mb-12">Key Features</h3>
        <div className="grid md:grid-cols-3 gap-10 text-left">
          <div className="p-6 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors">
            <div className="mb-4">
              <svg
                className="w-10 h-10 text-blue-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2 text-blue-400">
              Highlight Detection
            </h4>
            <p className="text-gray-300">
              Finds the moments viewers replay most using YouTube&apos;s &quot;Most replayed&quot; data, or the loudest moments when that isn&apos;t available.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors">
            <div className="mb-4">
              <svg
                className="w-10 h-10 text-blue-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="16" x2="15" y2="16" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2 text-blue-400">
              Clips with Captions
            </h4>
            <p className="text-gray-300">
              Cuts 15, 30 or 60 second clips, frames them for 9:16 vertical, and burns in word-by-word captions in the video&apos;s own language.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors">
            <div className="mb-4">
              <svg
                className="w-10 h-10 text-blue-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2 text-blue-400">
              Download Ready
            </h4>
            <p className="text-gray-300">
              Outputs downloadable MP4 files ready to upload directly to YouTube Shorts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features; 