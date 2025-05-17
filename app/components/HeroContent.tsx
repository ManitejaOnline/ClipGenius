"use client";

import React from "react";
import HeroForm from "./HeroForm";

const HeroContent: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 to-gray-950 text-center px-6" role="region" aria-labelledby="hero-heading">
      <h2 id="hero-heading" className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
        Turn YouTube Videos into Viral Shorts with AI
      </h2>
      <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
        Paste a YouTube link. Our AI transcribes, detects highlights, and auto-edits short videos for you — 100% free and online.
      </p>
      <HeroForm />
    </section>
  );
};

export default HeroContent; 