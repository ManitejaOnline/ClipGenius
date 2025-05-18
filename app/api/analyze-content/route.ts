import { NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Initialize Hugging Face client
// Note: Replace with your Hugging Face API token
const hf = new HfInference(process.env.HUGGING_FACE_API_TOKEN);

// Constants
const VIDEO_DIR = path.join(process.cwd(), 'public', 'temp');
const YTDLP_PATH = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';

// Helper function to extract frames from video
async function extractFrames(videoPath: string, timestamps: number[]): Promise<string[]> {
  const frameFiles: string[] = [];
  
  for (const [index, timestamp] of timestamps.entries()) {
    const outputPath = videoPath.replace('.mp4', `-frame-${index}.jpg`);
    frameFiles.push(outputPath);
    
    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-ss', timestamp.toString(),
        '-i', videoPath,
        '-vframes', '1',
        '-q:v', '2',
        outputPath
      ]);

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });
    });
  }
  
  return frameFiles;
}

// Helper function to analyze frame content
async function analyzeFrame(framePath: string) {
  const imageData = await fs.promises.readFile(framePath);
  
  // Use video classification model
  const classificationResult = await hf.imageClassification({
    data: imageData,
    model: 'facebook/timm-efficientnet-b0',
  });

  // Use engagement prediction model
  const engagementResult = await hf.imageClassification({
    data: imageData,
    model: 'microsoft/resnet-50',
  });

  return {
    content: classificationResult,
    engagement: engagementResult,
  };
}

// Helper function to find viral moments
function findViralMoments(analysisResults: any[]): number[] {
  const viralMoments: number[] = [];
  
  // Analyze results to find potentially viral moments
  // This is a simplified example - you can make this more sophisticated
  analysisResults.forEach((result, index) => {
    const timestamp = index * 30; // Assuming 30-second intervals
    
    // Check for interesting content and high engagement potential
    const hasInterestingContent = result.content.some((label: any) => 
      label.score > 0.8 && (
        label.label.includes('action') ||
        label.label.includes('emotion') ||
        label.label.includes('highlight')
      )
    );
    
    const hasHighEngagement = result.engagement.some((label: any) =>
      label.score > 0.7 && (
        label.label.includes('viral') ||
        label.label.includes('trending') ||
        label.label.includes('popular')
      )
    );
    
    if (hasInterestingContent && hasHighEngagement) {
      viralMoments.push(timestamp);
    }
  });
  
  return viralMoments;
}

// POST endpoint to analyze video content
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

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
      
      ytDlpProcess.on('error', (error) => {
        reject(new Error(`Failed to spawn yt-dlp: ${error.message}`));
      });

      ytDlpProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`yt-dlp exited with code ${code}`));
        }
      });
    });

    // Extract frames at regular intervals
    const timestamps = Array.from({ length: 10 }, (_, i) => i * 30); // Every 30 seconds
    const frameFiles = await extractFrames(inputPath, timestamps);

    // Analyze frames
    const analysisResults = await Promise.all(
      frameFiles.map(framePath => analyzeFrame(framePath))
    );

    // Find viral moments
    const viralMoments = findViralMoments(analysisResults);

    // Clean up temporary files
    await Promise.all([
      ...frameFiles.map(file => fs.promises.unlink(file)),
      fs.promises.unlink(inputPath)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        viralMoments,
        analysis: analysisResults
      }
    });

  } catch (error) {
    console.error('Content analysis error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze video content'
    }, { status: 500 });
  }
} 