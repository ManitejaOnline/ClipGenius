"use client";

import React from "react";

const FREE_FEATURES = [
  "3 to 5 highlight clips per video, plus any you add from the graph",
  "15, 30 or 60 second clips",
  "Word-by-word captions in the video's own language",
  "Vertical framing that follows faces, or a blurred-background fit",
  "1080p MP4 downloads, one by one or as a zip",
  "No watermark, no sign-up",
];

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-20 bg-gray-900 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <div className="mb-12">
          <h3 className="text-3xl font-bold mb-4">Pricing</h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            ClipGenius is free to use. Everything below is included.
          </p>
        </div>
        <div className="max-w-md mx-auto border-2 border-blue-600 rounded-lg p-8 bg-gray-800 shadow-xl text-left">
          <h4 className="text-2xl font-semibold text-blue-400 mb-2">Free</h4>
          <p className="text-white font-bold text-3xl mb-6">$0</p>
          <ul className="space-y-3 text-gray-200 mb-8">
            {FREE_FEATURES.map(feature => (
              <li key={feature} className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          <a href="#start" className="block text-center w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors">
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
