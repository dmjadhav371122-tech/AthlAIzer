import { useState } from 'react';
import { Settings } from 'lucide-react';

interface ConfigFormProps {
  puckConfThreshold: number;
  duplicateIouThreshold: number;
  homeRoster: string;
  awayRoster: string;
  manualMapYaml: string;
  trackerConfigYaml: string;
  onPuckConfThresholdChange: (value: number) => void;
  onDuplicateIouThresholdChange: (value: number) => void;
  onHomeRosterChange: (value: string) => void;
  onAwayRosterChange: (value: string) => void;
  onManualMapYamlChange: (value: string) => void;
  onTrackerConfigYamlChange: (value: string) => void;
}

export function ConfigForm({
  puckConfThreshold,
  duplicateIouThreshold,
  homeRoster,
  awayRoster,
  manualMapYaml,
  trackerConfigYaml,
  onPuckConfThresholdChange,
  onDuplicateIouThresholdChange,
  onHomeRosterChange,
  onAwayRosterChange,
  onManualMapYamlChange,
  onTrackerConfigYamlChange,
}: ConfigFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Puck Confidence Threshold
          </label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={puckConfThreshold}
            onChange={(e) => onPuckConfThresholdChange(parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Range: 0.0 - 1.0 (Default: 0.55)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duplicate Player IoU Threshold
          </label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={duplicateIouThreshold}
            onChange={(e) => onDuplicateIouThresholdChange(parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Range: 0.0 - 1.0 (Default: 0.5)</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Home Team Roster (comma-separated jersey numbers)
        </label>
        <input
          type="text"
          value={homeRoster}
          onChange={(e) => onHomeRosterChange(e.target.value)}
          placeholder="e.g., 10,15,22,99"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">Enter jersey numbers separated by commas</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Away Team Roster (comma-separated jersey numbers)
        </label>
        <input
          type="text"
          value={awayRoster}
          onChange={(e) => onAwayRosterChange(e.target.value)}
          placeholder="e.g., 7,11,23,88"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">Enter jersey numbers separated by commas</p>
      </div>

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        <Settings className="h-4 w-4" />
        <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Settings</span>
      </button>

      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Manual Map YAML (Optional)
            </label>
            <textarea
              value={manualMapYaml}
              onChange={(e) => onManualMapYamlChange(e.target.value)}
              placeholder="# Example:&#10;1: '10'&#10;2: '15'&#10;3: '22'"
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Map track IDs to jersey numbers in YAML format
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tracker Config YAML (Optional)
            </label>
            <textarea
              value={trackerConfigYaml}
              onChange={(e) => onTrackerConfigYamlChange(e.target.value)}
              placeholder="# ByteTrack configuration&#10;tracker_type: bytetrack&#10;track_high_thresh: 0.5"
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Custom tracker configuration in YAML format
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
