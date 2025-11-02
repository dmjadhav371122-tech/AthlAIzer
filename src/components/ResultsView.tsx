import { Download, FileSpreadsheet, Video } from 'lucide-react';

interface ResultsViewProps {
  videoUrl: string;
  excelUrl?: string;
  manualMapTemplate?: Record<number, string>;
}

export function ResultsView({ videoUrl, excelUrl, manualMapTemplate }: ResultsViewProps) {
  const downloadExcel = () => {
    if (excelUrl) {
      const a = document.createElement('a');
      a.href = excelUrl;
      a.download = 'hockey_events_log.xlsx';
      a.click();
    }
  };

  const downloadManualMap = () => {
    if (manualMapTemplate) {
      const yamlContent = Object.entries(manualMapTemplate)
        .map(([id, value]) => `${id}: '${value}' # Unmapped`)
        .join('\n');

      const blob = new Blob([yamlContent], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'manual_map_template.yaml';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Video className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Annotated Video</h3>
          </div>
        </div>
        <div className="p-6">
          <video
            controls
            className="w-full rounded-lg shadow-lg"
            src={videoUrl}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {excelUrl && (
          <button
            onClick={downloadExcel}
            className="flex items-center justify-center space-x-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-md"
          >
            <FileSpreadsheet className="h-5 w-5" />
            <span>Download Events Excel</span>
            <Download className="h-4 w-4" />
          </button>
        )}

        {manualMapTemplate && Object.keys(manualMapTemplate).length > 0 && (
          <button
            onClick={downloadManualMap}
            className="flex items-center justify-center space-x-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md"
          >
            <FileSpreadsheet className="h-5 w-5" />
            <span>Download Manual Map Template</span>
            <Download className="h-4 w-4" />
          </button>
        )}
      </div>

      {manualMapTemplate && Object.keys(manualMapTemplate).length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            Manual Mapping Required
          </h4>
          <p className="text-sm text-blue-800 mb-3">
            Some players were detected but could not be automatically mapped to jersey numbers.
            Download the manual map template, fill in the missing jersey numbers, and re-run the
            analysis for improved accuracy.
          </p>
          <p className="text-xs text-blue-700">
            Unmapped Track IDs: {Object.keys(manualMapTemplate).length}
          </p>
        </div>
      )}
    </div>
  );
}
