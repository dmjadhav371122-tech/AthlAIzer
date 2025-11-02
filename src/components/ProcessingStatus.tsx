import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface ProcessingStatusProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  eventCount?: number;
  framesProcessed?: number;
  error?: string;
}

export function ProcessingStatus({
  status,
  progress = 0,
  eventCount,
  framesProcessed,
  error,
}: ProcessingStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />,
          title: 'Initializing...',
          description: 'Setting up the processing environment',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      case 'processing':
        return {
          icon: <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />,
          title: 'Processing Video',
          description: 'Analyzing frames and detecting events',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      case 'completed':
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-600" />,
          title: 'Processing Complete',
          description: 'Your video has been analyzed successfully',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'failed':
        return {
          icon: <XCircle className="h-8 w-8 text-red-600" />,
          title: 'Processing Failed',
          description: error || 'An error occurred during processing',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      default:
        return {
          icon: <Loader2 className="h-8 w-8 text-gray-600 animate-spin" />,
          title: 'Processing',
          description: 'Please wait...',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`border-2 ${config.borderColor} ${config.bgColor} rounded-lg p-6`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">{config.icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{config.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{config.description}</p>

          {(status === 'processing' || status === 'pending') && (
            <div className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">{progress}% complete</p>
            </div>
          )}

          {status === 'completed' && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {framesProcessed && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Frames Processed</p>
                  <p className="text-2xl font-bold text-gray-900">{framesProcessed.toLocaleString()}</p>
                </div>
              )}
              {eventCount !== undefined && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Events Detected</p>
                  <p className="text-2xl font-bold text-gray-900">{eventCount}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
