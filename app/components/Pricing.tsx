"use client";

import React from "react";

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-20 bg-gray-900 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <div className="mb-12">
          <h3 className="text-3xl font-bold mb-4">Choose Your Plan</h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            ClipGenius is free while in early access. Paid plans are coming soon.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="border border-gray-700 rounded-lg p-8 min-h-[320px] flex flex-col justify-between hover:border-gray-600 transition-colors">
            <div>
              <h4 className="text-2xl font-semibold text-white mb-3">Free</h4>
              <p className="text-gray-300 mb-6 text-lg">Everything available today, no watermark.</p>
              <ul className="space-y-3 text-gray-400 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  3 highlight clips per video
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Auto captions
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  1080p vertical MP4
                </li>
              </ul>
            </div>
            <div>
              <p className="text-blue-400 font-bold text-3xl mb-4">$0<span className="text-lg">/month</span></p>
              <a href="#start" className="block text-center w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-md text-white font-semibold transition-colors">
                Get Started
              </a>
            </div>
          </div>
          
          <div className="border-2 border-blue-600 rounded-lg p-8 min-h-[320px] flex flex-col justify-between bg-gray-800 transform scale-105 shadow-xl relative">
            <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
              RECOMMENDED
            </div>
            <div>
              <h4 className="text-2xl font-semibold text-blue-400 mb-3">Pro</h4>
              <p className="text-gray-300 mb-6 text-lg">Unlimited shorts, no watermark, fast processing.</p>
              <ul className="space-y-3 text-gray-200 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited shorts
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Advanced editing tools
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  4K quality
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Priority processing
                </li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold text-3xl mb-4">$9<span className="text-lg">/month</span></p>
              <button disabled className="w-full py-3 px-4 bg-blue-600 rounded-md text-white font-semibold opacity-50 cursor-not-allowed">
                Coming Soon
              </button>
            </div>
          </div>

          <div className="border border-gray-700 rounded-lg p-8 min-h-[320px] flex flex-col justify-between hover:border-gray-600 transition-colors">
            <div>
              <h4 className="text-2xl font-semibold text-white mb-3">Yearly</h4>
              <p className="text-gray-300 mb-6 text-lg">Best value for long-term users.</p>
              <ul className="space-y-3 text-gray-400 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  All Pro features
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Save 17%
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Early access
                </li>
              </ul>
            </div>
            <div>
              <p className="text-blue-400 font-bold text-3xl mb-4">$89<span className="text-lg">/year</span></p>
              <button disabled className="w-full py-3 px-4 bg-gray-800 rounded-md text-white font-semibold opacity-50 cursor-not-allowed">
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing; 