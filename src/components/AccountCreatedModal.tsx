import { CheckCircle, Mail } from 'lucide-react';

interface AccountCreatedModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
}

export function AccountCreatedModal({ isOpen, email, onClose }: AccountCreatedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Account Created Successfully! 🎉
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your account has been created. A verification link has been sent to:
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-blue-500" />
            <p className="font-semibold text-blue-900 dark:text-blue-100">{email}</p>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>📧 Next Step:</strong> Check your Outlook inbox for the verification email. Click the "Verify Email Address" button to complete your registration.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            <strong>💡 Tip:</strong> The verification link will expire in 24 hours. If you don't receive the email:
          </p>
          <ul className="text-xs text-gray-600 dark:text-gray-400 text-left space-y-1">
            <li>• Check your spam or junk folder</li>
            <li>• You can sign in and request a new verification email</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
        >
          Got It! 👍
        </button>
      </div>
    </div>
  );
}
