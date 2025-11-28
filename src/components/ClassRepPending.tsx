import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface ClassRepPendingProps {
  email: string;
  onLogout: () => void;
}

export const ClassRepPending: React.FC<ClassRepPendingProps> = ({ email, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full">
              <Clock size={48} className="text-amber-600 dark:text-amber-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verification Pending
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your class representative account is pending admin verification.
          </p>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-1">
                  What happens next?
                </p>
                <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                  <li>• An administrator will review your request</li>
                  <li>• You'll receive an email once approved</li>
                  <li>• You can then sign in with full access</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Account email:
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white break-all">
              {email}
            </p>
          </div>

          <button
            onClick={onLogout}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Sign Out
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            If you have questions, please contact the administrator.
          </p>
        </div>
      </div>
    </div>
  );
};
