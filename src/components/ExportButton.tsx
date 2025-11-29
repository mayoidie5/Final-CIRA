import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

interface ExportButtonProps {
  onExportCSV: () => void;
  onExportJSON?: () => void;
  label?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ 
  onExportCSV, 
  onExportJSON,
  label = 'Export' 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  if (!onExportJSON) {
    // Simple button if only CSV export is available
    return (
      <button
        onClick={onExportCSV}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
      >
        <Download size={20} />
        {label}
      </button>
    );
  }

  // Dropdown menu if multiple export options
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
      >
        <Download size={20} />
        {label}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <button
              onClick={() => {
                onExportCSV();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-white rounded-t-lg"
            >
              <FileSpreadsheet size={16} />
              Export as CSV
            </button>
            <button
              onClick={() => {
                onExportJSON?.();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-white rounded-b-lg"
            >
              <FileText size={16} />
              Export as JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
};
