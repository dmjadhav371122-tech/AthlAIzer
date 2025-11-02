# AthlAIzer - Hockey Video Analysis Platform

Where AI Meets Athletic Intelligence

## Overview

AthlAIzer is an advanced hockey video analysis platform that uses AI-powered computer vision to automatically detect players, track puck possession, and identify key game events like passes, saves, and goals.

## Features

- **Video Upload**: Upload hockey game videos from your local storage
- **Player Detection**: Automatic detection and tracking of players and goalies
- **Puck Tracking**: Real-time puck position tracking
- **Event Detection**: Automatic detection of passes, saves, and goals
- **Team Classification**: Classify players by team using jersey number recognition
- **Excel Export**: Download detailed event logs with timestamps
- **Manual Mapping**: Generate and use manual player ID to jersey number mappings

## Technology Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase Edge Functions
- **Processing**: Modal.com (GPU-accelerated video processing)
- **AI Models**: YOLOv8 (Ultralytics)

## Setup Instructions

### Prerequisites

1. Node.js 18+ and npm
2. Supabase account
3. Modal.com account

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Supabase

#### Create Storage Bucket

In your Supabase project dashboard:

1. Go to Storage
2. Create a new bucket called `videos`
3. Make it public
4. Create another bucket called `model` (already exists with your models)

#### Configure Edge Functions Environment

In your Supabase project settings:

1. Go to Edge Functions settings
2. Add environment variable: `MODAL_API_KEY` with your Modal API key

#### Deploy Edge Functions

Deploy the edge functions using the MCP tool:

```bash
# The edge functions are already created in:
# - supabase/functions/process-hockey-video/index.ts
# - supabase/functions/check-job-status/index.ts
```

Use the Supabase CLI or dashboard to deploy these functions.

### 4. Set Up Modal.com

#### Install Modal CLI

```bash
pip install modal
```

#### Authenticate

```bash
modal token new
```

#### Deploy Modal App

```bash
modal deploy modal_app.py
```

This will deploy the video processing function to Modal's serverless GPU infrastructure.

### 5. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to use the application.

## Usage

1. **Upload Video**: Click or drag-and-drop a hockey game video
2. **Configure Parameters**:
   - Set puck confidence threshold (0.0-1.0, default: 0.55)
   - Set duplicate player IoU threshold (0.0-1.0, default: 0.5)
   - Enter home team roster (comma-separated jersey numbers)
   - Enter away team roster (comma-separated jersey numbers)
3. **Advanced Settings** (Optional):
   - Upload manual mapping YAML file
   - Upload custom tracker configuration YAML
4. **Start Analysis**: Click "Start Analysis" button
5. **View Results**:
   - Watch the annotated video with player tracking
   - Download the Excel event log
   - Download manual mapping template (if needed)

## Configuration Parameters

### Puck Confidence Threshold
Controls how confident the model must be to detect a puck. Higher values = fewer false positives but may miss real pucks.

### Duplicate Player IoU Threshold
Controls removal of duplicate detections. Higher values = more aggressive duplicate removal.

### Manual Map YAML Format

```yaml
1: '10'   # Track ID 1 -> Jersey Number 10
2: '15'   # Track ID 2 -> Jersey Number 15
3: '22'   # Track ID 3 -> Jersey Number 22
```

## Model Information

The application uses three YOLOv8 models:

1. **Player Model** (`best (1).pt`): Detects players, goalies, referees, goals
2. **Jersey Model** (`best (2).pt`): Recognizes jersey numbers
3. **Puck Model** (`yolov8m_forzasys_hockey_Version_2.pt`): Detects the puck

All models are hosted in Supabase Storage and automatically downloaded by the Modal processing function.

## Architecture

```
User Browser
    ↓ (Upload Video)
Supabase Storage
    ↓ (Trigger Processing)
Supabase Edge Function
    ↓ (Forward Request)
Modal.com GPU Worker
    ↓ (Download Models & Video)
    ↓ (Process Video with YOLO)
    ↓ (Generate Annotations & Events)
    ↓ (Return Results)
Supabase Edge Function
    ↓ (Return to Browser)
User Browser (Display Results)
```

## Event Detection

The system automatically detects and logs:

- **Passes**: When the puck changes possession between players
- **Saves**: When a goaltender gains possession in the goal area
- **Goals**: When the puck enters the goal
- **Possession**: Tracks which player currently has the puck

All events are timestamped and logged to an Excel file for analysis.

## Troubleshooting

### Video not processing
- Check that all environment variables are set correctly
- Verify Modal.com deployment is active
- Check Supabase Edge Function logs

### Models not loading
- Verify model URLs are correct and accessible
- Check Modal.com function logs

### Poor detection accuracy
- Adjust confidence thresholds
- Ensure video quality is sufficient
- Consider using manual mapping for better player identification

## License

Private project - All rights reserved

## Support

For issues or questions, please contact the development team.
