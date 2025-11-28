import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ValidationAlertProps {
  message: string;
  onClose: () => void;
}

export const ValidationAlert: React.FC<ValidationAlertProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 dark:text-white">Validation Error</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="text-gray-600 dark:text-gray-400" size={20} />
            </button>
          </div>

          <div className="flex items-start gap-3 mb-6">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1" size={24} />
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
