import React, { useState } from 'react';
import { Search, Archive as ArchiveIcon, Eye, Trash2, Filter, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTickets } from '../hooks/useTickets';
import { Ticket } from '../types';
import { TicketDetails } from './TicketDetails';
import { ConfirmDialog } from './ConfirmDialog';

export const Archive: React.FC = () => {
  const { user } = useAuth();
  const { tickets, deleteTicket } = useTickets();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    campus: 'all',
    room: 'all',
    issueType: 'all',
  });
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

  const allArchivedTickets = getArchivedTickets();

  const filteredTickets = allArchivedTickets.filter(ticket => {
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.issueType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.unitId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCampus = filters.campus === 'all' || ticket.campus === filters.campus;
    const matchesRoom = filters.room === 'all' || ticket.room === filters.room;
    const matchesIssueType = filters.issueType === 'all' || ticket.issueType === filters.issueType;

    return matchesSearch && matchesCampus && matchesRoom && matchesIssueType;
  });

  // Get unique values for filter dropdowns
  const uniqueCampuses = Array.from(new Set(allArchivedTickets.map(t => t.campus)));
  const uniqueRooms = Array.from(new Set(allArchivedTickets.map(t => t.room)));
  const uniqueIssueTypes = Array.from(new Set(allArchivedTickets.map(t => t.issueType)));

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
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            <ArchiveIcon size={24} />
            Archived Tickets
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Resolved tickets are automatically deleted after 30 days
          </p>

          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search archived tickets..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <Filter size={20} />
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Campus</label>
                <select
                  value={filters.campus}
                  onChange={(e) => setFilters({ ...filters, campus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Campuses</option>
                  {uniqueCampuses.map(campus => (
                    <option key={campus} value={campus}>{campus}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Room</label>
                <select
                  value={filters.room}
                  onChange={(e) => setFilters({ ...filters, room: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Rooms</option>
                  {uniqueRooms.map(room => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Issue Type</label>
                <select
                  value={filters.issueType}
                  onChange={(e) => setFilters({ ...filters, issueType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Issue Types</option>
                  {uniqueIssueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
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
                      <span className={`px-2 py-1 rounded-full text-xs ${
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
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden p-4 space-y-4">
          {filteredTickets.map(ticket => {
            const daysOld = ticket.resolvedAt ? getTicketAge(ticket.resolvedAt) : 0;
            const daysUntilDeletion = Math.max(0, 30 - daysOld);
            
            return (
              <div key={ticket.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-gray-800 dark:text-white font-medium">#{ticket.id.slice(0, 8)}</span>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleDateString() : '-'}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    daysUntilDeletion <= 7
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                      : daysUntilDeletion <= 14
                      ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                      : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                  }`}>
                    {daysUntilDeletion} days left
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Campus:</span>
                    <div className="text-gray-800 dark:text-white">{ticket.campus}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Room:</span>
                    <div className="text-gray-800 dark:text-white">{ticket.room}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600 dark:text-gray-400">Issue Type:</span>
                    <div className="text-gray-800 dark:text-white">{ticket.issueType}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDeleteTicket(ticket.id, ticket.id.slice(0, 8))}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <ArchiveIcon className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">No archived tickets found</p>
          </div>
        )}
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
