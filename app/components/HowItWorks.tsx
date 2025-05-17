"use client";

import React from "react";

const HowItWorks: React.FC = () => {
  return (
    <section id="how" className="py-20 bg-gray-950 px-6">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-3xl font-bold mb-12 text-center">How It Works</h3>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-600 hidden md:block"></div>
          <div className="space-y-12">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mr-6 relative z-10">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 2H3v16h5l2 3v-3h11V2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">Paste Your Link</h4>
                <p className="text-gray-300">Simply paste your YouTube video URL into the input box to get started.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mr-6 relative z-10">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">AI Processing</h4>
                <p className="text-gray-300">Our system transcribes the video and analyzes it using advanced AI algorithms.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mr-6 relative z-10">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="14 2 18 6 7 17 3 17 3 13 14 2" />
                  <line x1="3" y1="22" x2="21" y2="22" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">Smart Editing</h4>
                <p className="text-gray-300">The AI identifies the best moments and creates perfectly timed clips.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mr-6 relative z-10">
                <svg
                  className="w-8 h-8 text-white"
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
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">Download & Share</h4>
                <p className="text-gray-300">Download your perfectly formatted Shorts, ready for YouTube upload.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 