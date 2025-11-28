import React, { useState } from 'react';
import { Search, Archive as ArchiveIcon, Eye, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTickets } from '../hooks/useTickets';
import { Ticket } from '../types';
import { TicketDetails } from './TicketDetails';
import { ConfirmDialog } from './ConfirmDialog';

export const Archive: React.FC = () => {
  const { user } = useAuth();
  const { tickets, deleteTicket } = useTickets();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ ticketId: string; ticketNum: string } | null>(null);

  const getArchivedTickets = () => {
    let archivedTickets = tickets.filter(t => t.status === 'resolved');
    
    if (user?.role === 'student') {
      archivedTickets = archivedTickets.filter(t => t.userId === user.id);
    } else if (user?.role === 'class_rep') {
      archivedTickets = archivedTickets.filter(t => t.acceptedBy === user.id || t.userId === user.id);
    }

    return archivedTickets;
  };

  const filteredTickets = getArchivedTickets().filter(ticket => {
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.issueType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.unitId.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleDeleteTicket = (ticketId: string, ticketNum: string) => {
    setDeleteConfirm({ ticketId, ticketNum });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteTicket(deleteConfirm.ticketId);
      setDeleteConfirm(null);
    }
  };

  const getTicketAge = (resolvedAt: string) => {
    const resolved = new Date(resolvedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - resolved.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (selectedTicket) {
    return <TicketDetails ticket={selectedTicket} onBack={() => setSelectedTicket(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            <ArchiveIcon size={24} />
            Archived Tickets
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Resolved tickets are automatically deleted after 30 days
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search archived tickets..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Ticket ID</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Campus</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Room</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Issue Type</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Resolved Date</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Days Until Deletion</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => {
                const daysOld = ticket.resolvedAt ? getTicketAge(ticket.resolvedAt) : 0;
                const daysUntilDeletion = Math.max(0, 30 - daysOld);
                
                return (
                  <tr key={ticket.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-gray-800 dark:text-white">
                      #{ticket.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-white">{ticket.campus}</td>
                    <td className="py-3 px-4 text-gray-800 dark:text-white">{ticket.room}</td>
                    <td className="py-3 px-4 text-gray-800 dark:text-white">{ticket.issueType}</td>
                    <td className="py-3 px-4 text-gray-800 dark:text-white">
                      {ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full ${
                        daysUntilDeletion <= 7
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                          : daysUntilDeletion <= 14
                          ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                          : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                      }`}>
                        {daysUntilDeletion} days
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDeleteTicket(ticket.id, ticket.id.slice(0, 8))}
                            className="text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <ArchiveIcon className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">No archived tickets found</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Archived Ticket"
          message={`Are you sure you want to permanently delete ticket #${deleteConfirm.ticketNum}? This action cannot be undone.`}
          confirmText="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
          type="danger"
        />
      )}
    </div>
  );
};
