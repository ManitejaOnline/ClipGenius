"use client";

import React from "react";
import Navbar from "./Navbar";
import HeroContent from "./HeroContent";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import Pricing from "./Pricing";
import Footer from "./Footer";

const HeroSection: React.FC = () => {
  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <Navbar />
      <HeroContent />
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
    </div>
  );
};

export default HeroSection;