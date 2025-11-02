import { useState } from 'react';
import { VideoUpload } from './components/VideoUpload';
import { ConfigForm } from './components/ConfigForm';
import { ProcessingStatus } from './components/ProcessingStatus';
import { ResultsView } from './components/ResultsView';
import { uploadVideoToStorage, processVideo, checkJobStatus } from './lib/supabase';
import { Activity, ArrowRight } from 'lucide-react';
import type { ProcessingJob } from './types';

function App() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [puckConfThreshold, setPuckConfThreshold] = useState(0.55);
  const [duplicateIouThreshold, setDuplicateIouThreshold] = useState(0.5);
  const [homeRoster, setHomeRoster] = useState('');
  const [awayRoster, setAwayRoster] = useState('');
  const [manualMapYaml, setManualMapYaml] = useState('');
  const [trackerConfigYaml, setTrackerConfigYaml] = useState('');
  const [processing, setProcessing] = useState(false);
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    if (!homeRoster.trim() || !awayRoster.trim()) {
      setError('Please enter both home and away team rosters');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      setJob({
        jobId: '',
        status: 'pending',
        progress: 10,
      });

      const videoUrl = await uploadVideoToStorage(videoFile);

      const homeRosterArray = homeRoster.split(',').map(n => n.trim()).filter(n => n);
      const awayRosterArray = awayRoster.split(',').map(n => n.trim()).filter(n => n);

      const result = await processVideo({
        videoUrl,
        puckConfThreshold,
        duplicateIouThreshold,
        homeRoster: homeRosterArray,
        awayRoster: awayRosterArray,
        manualMapYaml: manualMapYaml || undefined,
        trackerConfigYaml: trackerConfigYaml || undefined,
      });

      setJob({
        jobId: result.jobId,
        status: 'processing',
        progress: 30,
      });

      const pollInterval = setInterval(async () => {
        try {
          const status = await checkJobStatus(result.jobId);

          if (status.status === 'completed') {
            clearInterval(pollInterval);

            const videoBlob = new Blob(
              [new Uint8Array(status.video_base64.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16)))],
              { type: 'video/mp4' }
            );
            const videoUrl = URL.createObjectURL(videoBlob);

            let excelUrl;
            if (status.excel_base64) {
              const excelBlob = new Blob(
                [new Uint8Array(status.excel_base64.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16)))],
                { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
              );
              excelUrl = URL.createObjectURL(excelBlob);
            }

            setJob({
              jobId: result.jobId,
              status: 'completed',
              progress: 100,
              videoUrl,
              excelUrl,
              manualMapTemplate: status.manual_map_template,
              eventCount: status.event_count,
              framesProcessed: status.frames_processed,
            });
            setProcessing(false);
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setJob({
              jobId: result.jobId,
              status: 'failed',
              error: status.error || 'Processing failed',
            });
            setProcessing(false);
          } else {
            setJob(prev => ({
              ...prev!,
              progress: Math.min((prev?.progress || 30) + 5, 90),
            }));
          }
        } catch (err) {
          console.error('Error polling job status:', err);
        }
      }, 5000);

    } catch (err) {
      console.error('Error processing video:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setProcessing(false);
      setJob(null);
    }
  };

  const handleReset = () => {
    setVideoFile(null);
    setJob(null);
    setError(null);
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Activity className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">AthlAIzer</h1>
          </div>
          <p className="text-xl text-gray-600">Where AI Meets Athletic Intelligence</p>
          <p className="text-sm text-gray-500 mt-2">
            Advanced hockey video analysis with AI-powered player tracking and event detection
          </p>
        </div>

        {!job ? (
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl mx-auto">
            <div className="space-y-8">
              <VideoUpload onVideoSelect={setVideoFile} selectedVideo={videoFile} />

              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>Configuration</span>
                </h2>
                <ConfigForm
                  puckConfThreshold={puckConfThreshold}
                  duplicateIouThreshold={duplicateIouThreshold}
                  homeRoster={homeRoster}
                  awayRoster={awayRoster}
                  manualMapYaml={manualMapYaml}
                  trackerConfigYaml={trackerConfigYaml}
                  onPuckConfThresholdChange={setPuckConfThreshold}
                  onDuplicateIouThresholdChange={setDuplicateIouThreshold}
                  onHomeRosterChange={setHomeRoster}
                  onAwayRosterChange={setAwayRoster}
                  onManualMapYamlChange={setManualMapYaml}
                  onTrackerConfigYamlChange={setTrackerConfigYaml}
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                onClick={handleProcess}
                disabled={processing || !videoFile}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-md"
              >
                <span>Start Analysis</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : job.status === 'completed' && job.videoUrl ? (
          <div className="max-w-6xl mx-auto">
            <ResultsView
              videoUrl={job.videoUrl}
              excelUrl={job.excelUrl}
              manualMapTemplate={job.manualMapTemplate}
            />
            <button
              onClick={handleReset}
              className="mt-8 w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              Analyze Another Video
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <ProcessingStatus
              status={job.status}
              progress={job.progress}
              eventCount={job.eventCount}
              framesProcessed={job.framesProcessed}
              error={job.error}
            />
            {job.status === 'failed' && (
              <button
                onClick={handleReset}
                className="mt-6 w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
