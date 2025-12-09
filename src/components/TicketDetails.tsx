import React, { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Wrench, FileText, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { Ticket } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTickets } from '../hooks/useTickets';
import { ValidationAlert } from './ValidationAlert';
import { ConfirmDialog } from './ConfirmDialog';
import { ImageLightbox } from './ImageLightbox';
import { ProgressStepper } from './ProgressStepper';

interface TicketDetailsProps {
  ticket: Ticket;
  onBack: () => void;
}

export const TicketDetails: React.FC<TicketDetailsProps> = ({ ticket, onBack }) => {
  const { user } = useAuth();
  const { updateTicket, notifyAdmin, notifyClassReps } = useTickets();
  const [adminNote, setAdminNote] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [commentText, setCommentText] = useState('');
  const [validationError, setValidationError] = useState('');
  const [lightboxImage, setLightboxImage] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ 
    title: string; 
    message: string; 
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  } | null>(null);

  const handleAcceptTicket = () => {
    setConfirmDialog({
      title: 'Accept Ticket',
      message: 'Are you sure you want to accept this ticket? You will be responsible for managing it.',
      onConfirm: async () => {
        try {
          await updateTicket(ticket.id, {
            status: 'requested',
            acceptedBy: user?.id,
          });
          await notifyAdmin(`Ticket #${ticket.id.slice(0, 8)} accepted by ${user?.firstName} ${user?.lastName}`, ticket.id);
          setConfirmDialog(null);
          setTimeout(() => onBack(), 500);
        } catch (err) {
          console.error('Error accepting ticket:', err);
        }
      },
      type: 'info',
    });
  };

  const handleStartProgress = () => {
    if (!adminNote) {
      setValidationError('Please add a note before starting progress. This helps track what actions are being taken.');
      return;
    }
    setConfirmDialog({
      title: 'Start Progress',
      message: 'Are you sure you want to mark this ticket as in progress?',
      onConfirm: async () => {
        try {
          console.log('🟢 Admin starting progress on ticket:', ticket.id);
          console.log('   Ticket status:', ticket.status);
          console.log('   Admin notes:', adminNote);
          
          await updateTicket(ticket.id, {
            status: 'in_progress',
            adminNotes: adminNote,
          });
          
          console.log('✅ Ticket status changed to in_progress');
          setAdminNote('');
          setConfirmDialog(null);
          setTimeout(() => onBack(), 500);
        } catch (err) {
          console.error('🔴 Error starting progress:', err);
          setValidationError(`Failed to start progress: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      },
      type: 'info',
    });
  };

  const handleSubmitForResolution = () => {
    setConfirmDialog({
      title: 'Submit for Resolution',
      message: 'Are you sure the issue has been resolved? This will notify the class representative for confirmation.',
      onConfirm: async () => {
        try {
          await updateTicket(ticket.id, {
            status: 'pending_resolution',
          });
          setConfirmDialog(null);
          setTimeout(() => onBack(), 500);
        } catch (err) {
          console.error('Error submitting for resolution:', err);
        }
      },
      type: 'info',
    });
  };

  const handleStudentConfirmResolution = () => {
    setConfirmDialog({
      title: 'Confirm Resolution',
      message: 'Are you confirming that the issue has been resolved? The class representative will still need to verify before the ticket is closed.',
      onConfirm: async () => {
        try {
          console.log('🟢 Student confirming resolution for ticket:', ticket.id);
          console.log('   Ticket userId:', ticket.userId);
          console.log('   Current user id:', user?.id);
          console.log('   Updating with:', { studentConfirmedResolution: true, status: 'request_for_resolution' });
          
          await updateTicket(ticket.id, {
            studentConfirmedResolution: true,
            status: 'request_for_resolution',
          });
          
          console.log('🟢 Update ticket call completed');
          
          await notifyClassReps(`Student confirmed resolution for Ticket #${ticket.id.slice(0, 8)}. Awaiting class rep final confirmation.`, ticket.id);
          
          console.log('🟢 Notification sent, closing dialog');
          setConfirmDialog(null);
          setTimeout(() => onBack(), 500);
        } catch (err) {
          console.error('🔴 Error confirming resolution:', err);
          setValidationError(`Failed to confirm resolution: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      },
      type: 'info',
    });
  };

  const handleConfirmResolution = () => {
    if (!resolutionNote) {
      setValidationError('Please add a resolution note to confirm that the issue has been properly resolved.');
      return;
    }
    setConfirmDialog({
      title: 'Confirm Resolution',
      message: 'Are you sure the issue has been completely resolved? This ticket will be moved to the archive.',
      onConfirm: async () => {
        try {
          await updateTicket(ticket.id, {
            status: 'resolved',
            resolutionNote,
            resolvedAt: new Date().toISOString(),
          });
          setConfirmDialog(null);
          setTimeout(() => onBack(), 500);
        } catch (err) {
          console.error('Error confirming resolution:', err);
        }
      },
      type: 'info',
    });
  };

  const handleClassRepFinalize = () => {
    if (!resolutionNote) {
      setValidationError('Please add a resolution note to finalize the ticket.');
      return;
    }
    setConfirmDialog({
      title: 'Finalize Ticket',
      message: 'Are you sure the issue has been completely resolved? This ticket will be moved to the archive.',
      onConfirm: async () => {
        try {
          await updateTicket(ticket.id, {
            status: 'resolved',
            resolutionNote,
            resolvedAt: new Date().toISOString(),
          });
          setConfirmDialog(null);
          setTimeout(() => onBack(), 500);
        } catch (err) {
          console.error('Error finalizing ticket:', err);
        }
      },
      type: 'info',
    });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) {
      setValidationError('Please enter a comment.');
      return;
    }

    const newComment = {
      id: Date.now().toString() + Math.random(),
      userId: user!.id,
      userEmail: user!.email,
      userName: `${user!.firstName} ${user!.lastName}`,
      message: commentText,
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [...(ticket.comments || []), newComment];
    updateTicket(ticket.id, { comments: updatedComments });
    
    // Notify class rep and admin about the comment
    if (user?.role === 'student') {
      notifyClassReps(`New comment on Ticket #${ticket.id.slice(0, 8)} from ${user.firstName} ${user.lastName}`, ticket.id);
      notifyAdmin(`New comment on Ticket #${ticket.id.slice(0, 8)} from ${user.firstName} ${user.lastName}`, ticket.id);
    }
    
    setCommentText('');
  };

  const canAccept = user?.role === 'class_rep' && ticket.status === 'submitted';
  const canStartProgress = user?.role === 'admin' && ticket.status === 'requested';
  const canSubmitResolution = user?.role === 'admin' && ticket.status === 'in_progress';
  const canConfirmResolution = (user?.role === 'class_rep' || user?.role === 'admin') && ticket.status === 'pending_resolution' && ticket.studentConfirmedResolution;
  const canStudentConfirmResolution = user?.role === 'student' && ticket.status === 'pending_resolution' && ticket.userId === user?.id && !ticket.studentConfirmedResolution;
  const canClassRepFinalize = user?.role === 'class_rep' && ticket.status === 'request_for_resolution' && ticket.userId !== user?.id;
  const canComment = user?.role === 'student' && ticket.userId === user?.id && ticket.status !== 'resolved';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      case 'requested':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'in_progress':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'pending_resolution':
      case 'request_for_resolution':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400';
      case 'resolved':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getDisplayStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getWorkflowSteps = () => {
    const statusMap: Record<string, number> = {
      'submitted': 0,
      'requested': 1,
      'in_progress': 2,
      'pending_resolution': 3,
      'request_for_resolution': 3,
      'resolved': 4
    };

    const currentStep = statusMap[ticket.status] || 0;

    return [
      {
        label: 'Submitted',
        status: currentStep > 0 ? 'completed' : currentStep === 0 ? 'current' : 'upcoming',
        description: 'Issue reported'
      },
      {
        label: 'Accepted',
        status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'upcoming',
        description: 'Class rep accepted'
      },
      {
        label: 'In Progress',
        status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'upcoming',
        description: 'Admin working on fix'
      },
      {
        label: 'Pending Resolution',
        status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'upcoming',
        description: 'Awaiting confirmation'
      },
      {
        label: 'Resolved',
        status: currentStep >= 4 ? 'completed' : 'upcoming',
        description: 'Issue fixed'
      }
    ] as Array<{ label: string; status: 'completed' | 'current' | 'upcoming'; description: string }>;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4 sm:mb-6"
      >
        <ArrowLeft size={20} />
        Back to List
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
            <div>
              <h2 className="text-gray-800 dark:text-white mb-2">Ticket #{ticket.id.slice(0, 8)}</h2>
              <span className={`px-3 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                {getDisplayStatus(ticket.status)}
              </span>
            </div>
            <div className="text-left sm:text-right text-gray-600 dark:text-gray-400">
              <p className="flex items-center gap-2 sm:justify-end">
                <Calendar size={16} />
                <span className="text-sm sm:text-base">{new Date(ticket.createdAt).toLocaleString()}</span>
              </p>
              {ticket.resolvedAt && ticket.status === 'resolved' && (
                <p className="flex items-center gap-2 sm:justify-end mt-2">
                  <Calendar size={16} />
                  <span className="text-sm sm:text-base">Resolved: {new Date(ticket.resolvedAt).toLocaleString()}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Workflow Progress */}
          <div>
            <h3 className="text-gray-800 dark:text-white mb-4">Workflow Progress</h3>
            <ProgressStepper steps={getWorkflowSteps()} orientation="horizontal" />
          </div>

          {/* Location Info */}
          <div>
            <h3 className="text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <MapPin size={20} />
              Location Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded-lg">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Campus</p>
                <p className="text-gray-800 dark:text-white">{ticket.campus}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Building</p>
                <p className="text-gray-800 dark:text-white">{ticket.building}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Room</p>
                <p className="text-gray-800 dark:text-white">{ticket.room}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Unit ID</p>
                <p className="text-gray-800 dark:text-white">{ticket.unitId}</p>
              </div>
            </div>
          </div>

          {/* Issue Info */}
          <div>
            <h3 className="text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <Wrench size={20} />
              Issue Details
            </h3>
            <div className="space-y-3 bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded-lg">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Issue Type</p>
                <p className="text-gray-800 dark:text-white">{ticket.issueType}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Issue Subtype</p>
                <p className="text-gray-800 dark:text-white">{ticket.issueSubtype}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Description</p>
                <p className="text-gray-800 dark:text-white">{ticket.issueDescription}</p>
              </div>
            </div>
          </div>

          {/* Images */}
          {ticket.images && ticket.images.length > 0 && (
            <div>
              <h3 className="text-gray-800 dark:text-white mb-3">Attached Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {ticket.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Issue ${index + 1}`}
                    onClick={() => setLightboxImage(index)}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {ticket.adminNotes && (
            <div>
              <h3 className="text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <FileText size={20} />
                Admin Notes
              </h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <p className="text-gray-800 dark:text-white">{ticket.adminNotes}</p>
              </div>
            </div>
          )}

          {/* Resolution Note */}
          {ticket.resolutionNote && (
            <div>
              <h3 className="text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle size={20} />
                Resolution Note
              </h3>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                <p className="text-gray-800 dark:text-white">{ticket.resolutionNote}</p>
              </div>
            </div>
          )}

          {/* Comments Section */}
          {ticket.comments && ticket.comments.length > 0 && (
            <div>
              <h3 className="text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <MessageSquare size={20} />
                Comments
              </h3>
              <div className="space-y-3">
                {ticket.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-gray-800 dark:text-white">{comment.userName}</p>
                        <p className="text-gray-500 dark:text-gray-400">{comment.userEmail}</p>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{comment.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Comment (Student) */}
          {canComment && (
            <div>
              <h3 className="text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <MessageSquare size={20} />
                Add Follow-up Comment
              </h3>
              <div className="space-y-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Add a follow-up comment or question about this ticket..."
                />
                <button
                  onClick={handleAddComment}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                >
                  Add Comment
                </button>
              </div>
            </div>
          )}

          {/* Actions for Class Rep */}
          {canAccept && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleAcceptTicket}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
              >
                Accept Ticket
              </button>
            </div>
          )}

          {/* Debug Info - Admin Actions */}
          {user?.role === 'admin' && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
              <p>🔍 Debug: Admin Action Availability</p>
              <p>User role: {user?.role}</p>
              <p>Ticket status: {ticket.status}</p>
              <p>Can start progress: {canStartProgress ? 'YES' : 'NO'}</p>
              <p>Can submit resolution: {canSubmitResolution ? 'YES' : 'NO'}</p>
            </div>
          )}

          {/* Actions for Admin */}
          {canStartProgress && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Add Note *</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Add notes about the issue and what actions will be taken..."
                />
              </div>
              <button
                onClick={handleStartProgress}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
              >
                Start Progress
              </button>
            </div>
          )}

          {canSubmitResolution && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSubmitForResolution}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors"
              >
                Submit for Resolution
              </button>
            </div>
          )}

          {/* Actions for Student - Confirm Resolution */}
          {canStudentConfirmResolution && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg mb-4">
                <p className="text-yellow-800 dark:text-yellow-300">
                  The admin has marked this issue as resolved. Please confirm if the issue has been fixed.
                  The class representative will make the final confirmation.
                </p>
              </div>
              <button
                onClick={handleStudentConfirmResolution}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors"
              >
                Confirm Resolution
              </button>
            </div>
          )}

          {/* Actions for Class Rep - Confirm Resolution */}
          {canConfirmResolution && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                <p className="text-green-800 dark:text-green-300">
                  Please verify and add your final confirmation note.
                </p>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Resolution Note *</label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Confirm that the issue has been resolved..."
                />
              </div>
              <button
                onClick={handleConfirmResolution}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors"
              >
                Confirm Resolution
              </button>
            </div>
          )}

          {/* Actions for Class Rep - Finalize Resolution */}
          {canClassRepFinalize && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <p className="text-blue-800 dark:text-blue-300">
                  Student has confirmed resolution. Please verify and add your resolution note to finalize.
                </p>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Resolution Note *</label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Verify and document that the issue has been resolved..."
                />
              </div>
              <button
                onClick={handleClassRepFinalize}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors"
              >
                Finalize Ticket
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Validation Alert */}
      {validationError && (
        <ValidationAlert
          message={validationError}
          onClose={() => setValidationError('')}
        />
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
          type={confirmDialog.type}
        />
      )}

      {/* Image Lightbox */}
      {lightboxImage !== null && ticket.images && (
        <ImageLightbox
          images={ticket.images}
          currentIndex={lightboxImage}
          onClose={() => setLightboxImage(null)}
          onNext={() => setLightboxImage((lightboxImage + 1) % ticket.images!.length)}
          onPrevious={() => setLightboxImage((lightboxImage - 1 + ticket.images!.length) % ticket.images!.length)}
        />
      )}
    </div>
  );
};
