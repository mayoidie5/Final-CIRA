import React from 'react';
import { AlertTriangle, Mail } from 'lucide-react';

interface AccountDeletedProps {
  email: string;
}

export const AccountDeleted: React.FC<AccountDeletedProps> = ({ email }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4">
            <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Account Deleted</h1>
          <p className="text-gray-600 dark:text-gray-400">
            The account associated with <span className="font-semibold">{email}</span> has been deleted.
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-3">
          <p className="text-sm text-red-800 dark:text-red-300">
            <span className="font-semibold">Your account is no longer active.</span> All associated data has been permanently removed from the system.
          </p>
          <p className="text-sm text-red-700 dark:text-red-400">
            If you believe this is a mistake or would like to recover your account, please contact an administrator.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Contact Administrator</p>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Email: <a href="mailto:admin@plv.edu.ph" className="font-semibold hover:underline">admin@plv.edu.ph</a>
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500">
          Account Email: {email}
        </p>
      </div>
    </div>
  );
};
