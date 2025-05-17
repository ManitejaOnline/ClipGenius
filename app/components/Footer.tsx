"use client";

import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-center py-8 border-t border-gray-800" role="contentinfo">
      <p className="text-sm text-gray-500">
        © {new Date().getFullYear()} ClipGenius. Built for creators. Free forever.
      </p>
    </footer>
  );
};

export default Footer; 