import type { Metadata } from "next";
import type { ReactElement } from "react";
import HeroSection from "./components/HeroSection";

export const metadata: Metadata = {
  title: "ClipGenius - Turn YouTube Videos into Viral Shorts with AI",
  description: "Transform your YouTube videos into engaging shorts automatically with AI. Free online tool for content creators.",
  keywords: "YouTube shorts, video editing, AI video editor, content creation",
  openGraph: {
    title: "ClipGenius - AI-Powered YouTube Shorts Generator",
    description: "Transform your YouTube videos into engaging shorts automatically with AI",
    type: "website",
    locale: "en_US",
    siteName: "ClipGenius",
  },
};

export default function Home(): ReactElement {
  return (
    <main className="min-h-screen bg-gray-950">
      <HeroSection />
    </main>
  );
}
