import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen, FileText, Users, CheckCircle, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TutorialProps {
  onClose: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const getTutorialSteps = () => {
    if (user?.role === 'admin') {
      return [
        {
          title: 'Welcome Admin!',
          content: 'This tutorial will guide you through the main features of the Comlab Issue Reporting system.',
          demo: (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
              <p className="text-blue-800 dark:text-blue-400 mb-2">Quick Overview:</p>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 ml-4 list-disc">
                <li>Manage all system tickets</li>
                <li>Approve class representative requests</li>
                <li>Configure form options</li>
                <li>Manage user accounts</li>
              </ul>
            </div>
          ),
        },
        {
          title: 'Dashboard Overview',
          content: 'The Dashboard shows real-time statistics including total tickets, pending requests, in-progress issues, and resolution rate. You can view charts showing ticket trends and issue distributions.',
          demo: (
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded">
                  <p className="text-blue-600 dark:text-blue-400">Total Tickets</p>
                  <p className="text-blue-800 dark:text-blue-200">125</p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded">
                  <p className="text-yellow-600 dark:text-yellow-400">In Progress</p>
                  <p className="text-yellow-800 dark:text-yellow-200">8</p>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: 'Managing Tickets',
          content: 'In the Ticket List, you can view all submitted tickets. Click on any ticket to see details, change status (Requested → In Progress → Pending Resolution), add notes, and submit for resolution.',
          demo: (
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span className="text-gray-700 dark:text-gray-300">Submitted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-gray-700 dark:text-gray-300">Requested</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <span className="text-gray-700 dark:text-gray-300">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  <span className="text-gray-700 dark:text-gray-300">Pending Resolution</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-gray-700 dark:text-gray-300">Resolved</span>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: 'User Management',
          content: 'Approve or reject Class Representative registration requests. View all users, filter by role, status, course, or section. You can also manage account deletions with a 3-day grace period.',
          demo: (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
                <Users size={20} />
                <p>Use filters to find specific users by role, course, or section</p>
              </div>
            </div>
          ),
        },
        {
          title: 'Form Editor',
          content: 'Configure the issue reporting form by adding/editing campuses, buildings, rooms, unit IDs, and issue types. You can drag to reorder items and use the edit/delete buttons for each entry.',
          demo: (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
              <div className="space-y-2 text-green-800 dark:text-green-300">
                <p>✓ Add/Edit/Delete locations</p>
                <p>✓ Reorder items by dragging</p>
                <p>✓ Configure issue types</p>
              </div>
            </div>
          ),
        },
        {
          title: 'Archive',
          content: 'View resolved tickets. Tickets are automatically deleted 30 days after resolution. You can search and filter archived tickets, or manually delete them if needed.',
          demo: (
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-4">
              <p className="text-gray-700 dark:text-gray-300">Auto-delete countdown: Days until deletion displayed for each ticket</p>
            </div>
          ),
        },
      ];
    } else if (user?.role === 'class_rep') {
      return [
        {
          title: 'Welcome Class Representative!',
          content: 'This tutorial will guide you through your responsibilities in the Comlab Issue Reporting system.',
          demo: (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mt-4">
              <p className="text-purple-800 dark:text-purple-400 mb-2">Your Responsibilities:</p>
              <ul className="space-y-1 text-purple-700 dark:text-purple-300 ml-4 list-disc">
                <li>Accept student tickets</li>
                <li>Submit your own tickets (auto-approved)</li>
                <li>Confirm issue resolutions</li>
                <li>Track ticket progress</li>
              </ul>
            </div>
          ),
        },
        {
          title: 'Dashboard Overview',
          content: 'Your Dashboard shows statistics for tickets you\'re managing, including submitted, in-progress, and resolved tickets. Track your team\'s performance.',
          demo: (
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-4">
              <div className="space-y-2">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                  <p className="text-blue-600 dark:text-blue-400">My Tickets: 5</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded">
                  <p className="text-purple-600 dark:text-purple-400">Student Tickets: 12</p>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: 'Reporting Issues',
          content: 'Click "Report Issue" to submit a new ticket. Your tickets are automatically approved. Fill in campus, building, room, unit ID, issue type, description, and optionally attach images.',
          demo: (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                <CheckCircle size={20} />
                <p>Your tickets are auto-approved and assigned to you!</p>
              </div>
            </div>
          ),
        },
        {
          title: 'My Tickets vs Review Tickets',
          content: 'Use "My Tickets" to view tickets you\'ve personally submitted. Use "Review Tickets" to see tickets submitted by students that need your acceptance.',
          demo: (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  <span className="text-blue-700 dark:text-blue-300">My Tickets: Your submissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-purple-600" />
                  <span className="text-purple-700 dark:text-purple-300">Review Tickets: Student submissions</span>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: 'Accepting Tickets',
          content: 'In Review Tickets, click "Accept" on any student ticket to take responsibility for it. Once accepted, you\'ll track it through completion.',
          demo: (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
              <p className="text-yellow-800 dark:text-yellow-300">💡 Tip: Only accept tickets you can actively monitor</p>
            </div>
          ),
        },
        {
          title: 'Confirming Resolutions',
          content: 'When an admin submits a ticket for resolution, you\'ll receive a notification. Review the work and add a resolution note to confirm if the issue is truly resolved.',
          demo: (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
              <p className="text-green-800 dark:text-green-300">Always verify the issue is fully resolved before confirming!</p>
            </div>
          ),
        },
      ];
    } else {
      return [
        {
          title: 'Welcome Student!',
          content: 'This tutorial will guide you through reporting and tracking computer lab issues.',
          demo: (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
              <p className="text-blue-800 dark:text-blue-400 mb-2">What You Can Do:</p>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 ml-4 list-disc">
                <li>Report computer lab issues</li>
                <li>Track your ticket status</li>
                <li>View resolved issues</li>
                <li>Attach photos to reports</li>
              </ul>
            </div>
          ),
        },
        {
          title: 'Dashboard Overview',
          content: 'Your Dashboard shows your ticket statistics including total submitted, in-progress, and resolved tickets. Stay updated on your reports.',
          demo: (
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                  <p className="text-blue-600 dark:text-blue-400">Submitted: 3</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                  <p className="text-green-600 dark:text-green-400">Resolved: 8</p>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: 'Reporting an Issue',
          content: 'Click "Report Issue" to create a new ticket. Select the campus, building, room, and unit ID where the issue occurred. Choose the issue type and provide a detailed description.',
          demo: (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
              <p className="text-yellow-800 dark:text-yellow-300">💡 Be specific! The more details you provide, the faster the issue can be resolved.</p>
            </div>
          ),
        },
        {
          title: 'Adding Images',
          content: 'You can attach up to 5 images to help explain the issue. Clear photos help technicians understand and resolve problems faster.',
          demo: (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mt-4">
              <p className="text-purple-800 dark:text-purple-300">📸 Take clear photos of: error messages, broken hardware, or affected areas</p>
            </div>
          ),
        },
        {
          title: 'My Tickets & Filters',
          content: 'View all your submitted tickets in "My Tickets". Use filters to find specific tickets by campus, room, unit ID, issue type, or status.',
          demo: (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
              <p className="text-blue-800 dark:text-blue-300">🔍 Use the search bar and filters to quickly find any ticket</p>
            </div>
          ),
        },
        {
          title: 'Tracking Progress',
          content: 'Tickets go through several stages: Submitted → Accepted by Class Rep → Requested by Admin → In Progress → Pending Resolution → Resolved. You\'ll receive notifications at each stage.',
          demo: (
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white">1</div>
                  <span className="text-gray-700 dark:text-gray-300">Submitted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center text-white">2</div>
                  <span className="text-gray-700 dark:text-gray-300">Accepted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-white">3</div>
                  <span className="text-gray-700 dark:text-gray-300">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white">4</div>
                  <span className="text-gray-700 dark:text-gray-300">Resolved</span>
                </div>
              </div>
            </div>
          ),
        },
      ];
    }
  };

  const steps = getTutorialSteps();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center gap-3">
            <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />
            <h2 className="text-gray-800 dark:text-white">System Tutorial</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="text-gray-600 dark:text-gray-400" size={20} />
          </button>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-blue-600 dark:text-blue-400">
                Step {currentStep + 1} of {steps.length}
              </span>
              <div className="flex gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-8 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-blue-600 dark:bg-blue-400'
                        : index < currentStep
                        ? 'bg-blue-300 dark:bg-blue-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            <h3 className="text-gray-800 dark:text-white mb-4">{steps[currentStep].title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {steps[currentStep].content}
            </p>

            {/* Demo Section */}
            {steps[currentStep].demo}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Get Started
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Next
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
