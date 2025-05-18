import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import type { FfmpegCommand } from 'fluent-ffmpeg';

// Use dynamic import for fluent-ffmpeg
let ffmpeg: any;

// Types
interface ProcessRequestBody {
  url: string;
  startTime?: number; // in seconds
  duration?: number; // in seconds
}

interface ProcessResponse {
  success: boolean;
  message: string;
  data?: {
    outputPath?: string;
    duration?: number;
  };
  error?: string;
}

// Constants
const VIDEO_DIR = path.join(process.cwd(), 'public', 'temp');
const YTDLP_PATH = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';

// Preview configurations
const DEFAULT_PREVIEW_CONFIGS = [
  { startTime: 5, duration: 30 },
  { startTime: 35, duration: 30 },
  { startTime: 65, duration: 30 },
];

// Ensure temp directory exists
if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

// Helper function to initialize ffmpeg
async function initializeFfmpeg() {
  if (!ffmpeg) {
    const ffmpegModule = await import('fluent-ffmpeg');
    ffmpeg = ffmpegModule.default;
  }
  return ffmpeg;
}

// Helper function to find silence around a target time
async function findNearestSilence(
  ffmpegModule: any,
  inputPath: string,
  targetTime: number,
  searchWindow: number = 5
): Promise<number> {
  return new Promise((resolve, reject) => {
    const startSearch = Math.max(0, targetTime - searchWindow);
    
    ffmpegModule(inputPath)
      .setStartTime(startSearch)
      .setDuration(searchWindow * 2)
      .audioFilters([
        'silencedetect=noise=-30dB:d=0.2' // Detect silence below -30dB lasting at least 0.2 seconds
      ])
      .output('pipe:1')
      .format('null')
      .on('stderr', (stderrLine: string) => {
        // Parse silence detection output
        const silenceStart = stderrLine.match(/silence_start: ([\d.]+)/);
        if (silenceStart) {
          const time = parseFloat(silenceStart[1]) + startSearch;
          if (Math.abs(time - targetTime) <= searchWindow) {
            resolve(time);
          }
        }
      })
      .on('end', () => resolve(targetTime)) // If no silence found, use original time
      .on('error', (err: Error) => reject(err))
      .run();
  });
}

// Helper function to process a single preview
async function processPreview(
  ffmpegModule: any,
  inputPath: string,
  outputPath: string,
  startTime: number,
  duration: number,
  resolution: { width: number; height: number }
): Promise<void> {
  try {
    // Find the nearest silence point to our desired start time
    const adjustedStartTime = await findNearestSilence(ffmpegModule, inputPath, startTime);
    
    return new Promise<void>((resolve, reject) => {
      ffmpegModule(inputPath)
        .setStartTime(adjustedStartTime)
        .setDuration(duration)
        .size(`${resolution.width}x${resolution.height}`)
        .autopad(true, 'black')
        .audioFilters([
          'afade=t=in:st=0:d=0.5',  // Add 0.5s audio fade in
          `afade=t=out:st=${duration-0.5}:d=0.5` // Add 0.5s audio fade out
        ])
        .videoFilters([
          'fade=in:0:25',  // Add 25 frame video fade in (about 0.8s at 30fps)
          `fade=out:${duration*30-25}:25` // Add 25 frame video fade out
        ])
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          '-b:v 4M',
          '-b:a 192k',
          '-r 30',
          '-pix_fmt yuv420p',
          '-preset medium',
          '-movflags +faststart',
          '-profile:v high',
          '-level 4.0',
          '-maxrate 5M',
          '-bufsize 5M',
          '-filter:v crop=ih*9/16:ih,scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black'
        ])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(new Error(`FFmpeg error: ${err.message}`)))
        .run();
    });
  } catch (error) {
    console.error('Error finding silence point:', error);
    // Fallback to original start time if silence detection fails
    return new Promise<void>((resolve, reject) => {
      ffmpegModule(inputPath)
        .setStartTime(startTime)
        .setDuration(duration)
        .size(`${resolution.width}x${resolution.height}`)
        .autopad(true, 'black')
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          '-b:v 4M',
          '-b:a 192k',
          '-r 30',
          '-pix_fmt yuv420p',
          '-preset medium',
          '-movflags +faststart',
          '-profile:v high',
          '-level 4.0',
          '-maxrate 5M',
          '-bufsize 5M',
          '-filter:v crop=ih*9/16:ih,scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black'
        ])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(new Error(`FFmpeg error: ${err.message}`)))
        .run();
    });
  }
}

// GET endpoint to check FFmpeg availability
export async function GET() {
  try {
    const ffmpegModule = await initializeFfmpeg();
    
    // Test FFmpeg availability by getting version info
    const result = await new Promise<boolean>((resolve) => {
      ffmpegModule.getAvailableCodecs((err: Error | null) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });

    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'FFmpeg is not installed or not properly configured'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'FFmpeg is available'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check FFmpeg availability'
    }, { status: 500 });
  }
}

// POST endpoint to process video
export async function POST(request: Request) {
  try {
    const ffmpegModule = await initializeFfmpeg();
    const body = await request.json();
    const { url, startTimes } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Invalid YouTube URL provided'
      }, { status: 400 });
    }

    // Extract video ID
    const videoId = url.match(/[?&]v=([^&]+)/)?.[1];
    if (!videoId) {
      return NextResponse.json({
        success: false,
        error: 'Could not extract video ID'
      }, { status: 400 });
    }

    const inputPath = path.join(VIDEO_DIR, `${videoId}-input.mp4`);

    // Download video using yt-dlp
    await new Promise<void>((resolve, reject) => {
      const ytDlpArgs = [
        '-f', 'best',
        '-o', inputPath,
        url,
        '--no-progress',
        '--quiet'
      ];

      const ytDlpProcess = spawn(YTDLP_PATH, ytDlpArgs);

      ytDlpProcess.stderr.on('data', (data) => {
        console.error(`yt-dlp stderr: ${data}`);
      });

      ytDlpProcess.stdout.on('data', (data) => {
        console.log(`yt-dlp stdout: ${data}`);
      });

      ytDlpProcess.on('error', (error) => {
        if (error.message.includes('ENOENT')) {
          reject(new Error('yt-dlp is not installed. Please install yt-dlp first.'));
        } else {
          reject(new Error(`Failed to spawn yt-dlp: ${error.message}`));
        }
      });

      ytDlpProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`yt-dlp exited with code ${code}. Make sure yt-dlp is installed and in your PATH.`));
        }
      });
    });

    // Use provided start times or default configurations
    const previewConfigs = startTimes 
      ? startTimes.map(startTime => ({ startTime, duration: 30 }))
      : DEFAULT_PREVIEW_CONFIGS;

    // Process each preview
    const previews = await Promise.all(
      previewConfigs.map(async (config, index) => {
        const outputPath = path.join(VIDEO_DIR, `${videoId}-preview-${index + 1}.mp4`);
        const relativeOutputPath = `/temp/${videoId}-preview-${index + 1}.mp4`;

        await processPreview(
          ffmpegModule,
          inputPath,
          outputPath,
          config.startTime,
          config.duration,
          { width: 1080, height: 1920 }
        );

        return {
          outputPath: relativeOutputPath,
          startTime: config.startTime,
          duration: config.duration,
        };
      })
    );

    // Clean up input file
    try {
      fs.unlinkSync(inputPath);
    } catch (error) {
      console.error('Failed to clean up input file:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Video processed successfully',
      data: {
        previews
      }
    });

  } catch (error) {
    console.error('Video processing error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process video'
    }, { status: 500 });
  }
} 