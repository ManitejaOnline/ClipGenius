"use client";

import React, { useRef, useState } from "react";
import { formatTime } from "../utils/formatTime";

export interface GraphPoint {
  start: number;
  end: number;
  value: number;
}

interface GraphClip {
  startTime: number;
  duration: number;
}

interface HighlightGraphProps {
  title: string;
  points: GraphPoint[] | null;
  videoDuration: number;
  clips: GraphClip[];
  currentIndex: number;
  disabled: boolean;
  onSelectClip: (index: number) => void;
  onPickTime: (time: number) => void;
}

const WIDTH = 1000;
const HEIGHT = 100;
const MIN_MARKER_WIDTH = 6;
// Matches the backend's intro skip; the replay spike at 0:00 would otherwise flatten the rest of the curve
const INTRO_SKIP_RATIO = 0.05;

const HighlightGraph: React.FC<HighlightGraphProps> = ({
  title,
  points,
  videoDuration,
  clips,
  currentIndex,
  disabled,
  onSelectClip,
  onPickTime,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const bodyValues = (points ?? []).filter(p => p.start >= videoDuration * INTRO_SKIP_RATIO).map(p => p.value);
  const maxValue = Math.max(...bodyValues, 0) || 1;

  const toX = (time: number) => (time / videoDuration) * WIDTH;
  const toY = (value: number) => HEIGHT - Math.min(value / maxValue, 1) * (HEIGHT - 10);

  const timeAt = (clientX: number) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1) * videoDuration;
  };

  const clipIndexAt = (time: number) =>
    clips.findIndex(c => time >= c.startTime && time <= c.startTime + c.duration);

  const areaPath = points && points.length > 0
    ? [
        `M0,${HEIGHT}`,
        `L0,${toY(points[0].value)}`,
        ...points.map(p => `L${toX((p.start + p.end) / 2)},${toY(p.value)}`),
        `L${WIDTH},${toY(points[points.length - 1].value)}`,
        `L${WIDTH},${HEIGHT}`,
        "Z",
      ].join(" ")
    : null;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const time = timeAt(e.clientX);
    const clipIndex = clipIndexAt(time);
    if (clipIndex >= 0) onSelectClip(clipIndex);
    else onPickTime(time);
  };

  const hoverClipIndex = hoverTime === null ? -1 : clipIndexAt(hoverTime);
  const hint = hoverTime === null
    ? "Click a marker to view a clip, or anywhere else to make a new one"
    : hoverClipIndex >= 0
      ? `Clip ${hoverClipIndex + 1}`
      : `Make a clip at ${formatTime(hoverTime)}`;

  return (
    <div className="w-full max-w-3xl">
      <div className="flex justify-between gap-4 text-xs text-gray-400 mb-1">
        <span className="font-medium">{title}</span>
        <span>{hint}</span>
      </div>
      <div
        ref={containerRef}
        className={`relative h-24 rounded-lg bg-gray-800/60 border border-gray-700 overflow-hidden ${
          disabled ? "cursor-wait opacity-60" : "cursor-pointer"
        }`}
        onMouseMove={e => setHoverTime(timeAt(e.clientX))}
        onMouseLeave={() => setHoverTime(null)}
        onClick={handleClick}
        role="img"
        aria-label={`${title} graph with clip markers`}
      >
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          {areaPath && (
            <path d={areaPath} className="fill-blue-500/30 stroke-blue-400" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          )}
          {clips.map((clip, index) => (
            <rect
              key={`${clip.startTime}-${index}`}
              x={toX(clip.startTime)}
              y={0}
              width={Math.max(toX(clip.duration), MIN_MARKER_WIDTH)}
              height={HEIGHT}
              className={index === currentIndex ? "fill-yellow-400/60" : "fill-white/25"}
            />
          ))}
          {hoverTime !== null && !disabled && (
            <line
              x1={toX(hoverTime)}
              x2={toX(hoverTime)}
              y1={0}
              y2={HEIGHT}
              className="stroke-white/80"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>0:00</span>
        <span>{formatTime(videoDuration)}</span>
      </div>
    </div>
  );
};

export default HighlightGraph;
