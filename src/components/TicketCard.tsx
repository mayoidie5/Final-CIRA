import React from 'react';
import { Calendar, MapPin, User, Eye } from 'lucide-react';
import { Ticket } from '../types';
import { StatusBadge } from './StatusBadge';

interface TicketCardProps {
  ticket: Ticket;
  onView: (ticket: Ticket) => void;
  showAssignee?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onView, showAssignee = false }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-gray-800 dark:text-white">
              Ticket #{ticket.id.slice(0, 8)}
            </h3>
            <StatusBadge status={ticket.status} size="sm" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
            {ticket.issueDescription}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
          <MapPin size={14} />
          <span>{ticket.room}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
          <Calendar size={14} />
          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
          {ticket.issueType}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Unit: {ticket.unitId}
        </span>
      </div>

      {showAssignee && ticket.assignedTo && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <User size={14} />
            <span>Assigned to: {ticket.assignedTo}</span>
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onView(ticket)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Eye size={16} />
          View Details
        </button>
      </div>
    </div>
  );
};
