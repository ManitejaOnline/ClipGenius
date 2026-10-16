import type { Metadata } from "next";
import type { ReactElement } from "react";
import HeroSection from "./components/HeroSection";

export const metadata: Metadata = {
  title: "ClipGenius - Turn YouTube Videos into Viral Shorts",
  description: "Turn YouTube videos into captioned vertical shorts from their most replayed moments. Free online tool for content creators.",
  keywords: "YouTube shorts, video editing, highlight clips, auto captions, content creation",
  openGraph: {
    title: "ClipGenius - YouTube Shorts Generator",
    description: "Turn YouTube videos into captioned vertical shorts from their most replayed moments",
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
