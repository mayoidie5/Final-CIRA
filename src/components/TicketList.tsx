import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, FileText, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTickets } from '../hooks/useTickets';
import { Ticket, FormConfig } from '../types';
import { TicketDetails } from './TicketDetails';

interface TicketListProps {
  view?: 'my-tickets' | 'review' | 'all';
}

export const TicketList: React.FC<TicketListProps> = ({ view = 'all' }) => {
  const { user } = useAuth();
  const { tickets } = useTickets();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    campus: 'all',
    room: 'all',
    unitId: 'all',
    issueType: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('formConfig');
    if (stored) {
      setFormConfig(JSON.parse(stored));
    }
  }, []);

  const getUserTickets = () => {
    let userTickets = tickets;
    
    if (user?.role === 'student') {
      userTickets = tickets.filter(t => t.userId === user.id && t.status !== 'resolved');
    } else if (user?.role === 'class_rep') {
      if (view === 'my-tickets') {
        // Only show tickets created by the class rep
        userTickets = tickets.filter(t => t.userId === user.id && t.status !== 'resolved');
      } else if (view === 'review') {
        // Only show tickets created by students (not by class rep themselves)
        userTickets = tickets.filter(t => 
          t.userId !== user.id && 
          (t.acceptedBy === user.id || t.status === 'submitted') && 
          t.status !== 'resolved'
        );
      }
    } else if (user?.role === 'admin') {
      userTickets = tickets.filter(t => t.status !== 'resolved');
    }

    return userTickets;
  };

  const filteredTickets = getUserTickets().filter(ticket => {
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.issueType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.unitId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filters.status === 'all' || ticket.status === filters.status;
    const matchesCampus = filters.campus === 'all' || ticket.campus === filters.campus;
    const matchesRoom = filters.room === 'all' || ticket.room === filters.room;
    const matchesUnitId = filters.unitId === 'all' || ticket.unitId === filters.unitId;
    const matchesIssueType = filters.issueType === 'all' || ticket.issueType === filters.issueType;

    return matchesSearch && matchesStatus && matchesCampus && matchesRoom && matchesUnitId && matchesIssueType;
  });

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

  const getTitle = () => {
    if (user?.role === 'admin') return 'All Tickets';
    if (user?.role === 'class_rep') {
      return view === 'my-tickets' ? 'My Tickets' : 'Review Student Tickets';
    }
    return 'My Tickets';
  };

  // Get unique values for filters
  const uniqueCampuses = Array.from(new Set(tickets.map(t => t.campus)));
  const uniqueRooms = Array.from(new Set(tickets.map(t => t.room)));
  const uniqueUnitIds = Array.from(new Set(tickets.map(t => t.unitId)));
  const uniqueIssueTypes = formConfig?.issueTypes.map(it => it.name) || [];

  if (selectedTicket) {
    return <TicketDetails ticket={selectedTicket} onBack={() => setSelectedTicket(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-gray-800 dark:text-white mb-4">{getTitle()}</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ticket ID, issue type, room..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter size={20} />
              Filters
              {Object.values(filters).filter(f => f !== 'all').length > 0 && (
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {Object.values(filters).filter(f => f !== 'all').length}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-800 dark:text-white">Filter Options</h3>
                {Object.values(filters).some(f => f !== 'all') && (
                  <button
                    onClick={() => setFilters({
                      status: 'all',
                      campus: 'all',
                      room: 'all',
                      unitId: 'all',
                      issueType: 'all',
                    })}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="requested">Requested</option>
                    <option value="in_progress">In Progress</option>
                    <option value="pending_resolution">Pending Resolution</option>
                    <option value="request_for_resolution">Request for Resolution</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Campus</label>
                  <select
                    value={filters.campus}
                    onChange={(e) => setFilters({...filters, campus: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Campuses</option>
                    {uniqueCampuses.map(campus => (
                      <option key={campus} value={campus}>{campus}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Room</label>
                  <select
                    value={filters.room}
                    onChange={(e) => setFilters({...filters, room: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Rooms</option>
                    {uniqueRooms.map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Unit ID</label>
                  <select
                    value={filters.unitId}
                    onChange={(e) => setFilters({...filters, unitId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Unit IDs</option>
                    {uniqueUnitIds.map(unitId => (
                      <option key={unitId} value={unitId}>{unitId}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Issue Type</label>
                  <select
                    value={filters.issueType}
                    onChange={(e) => setFilters({...filters, issueType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Issue Types</option>
                    {uniqueIssueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Ticket ID</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Campus</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Room</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Unit ID</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Issue Type</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Date</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-800 dark:text-white">
                    #{ticket.id.slice(0, 8)}
                  </td>
                  <td className="py-3 px-4 text-gray-800 dark:text-white">{ticket.campus}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-white">{ticket.room}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-white">{ticket.unitId}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-white">{ticket.issueType}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                      {getDisplayStatus(ticket.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-800 dark:text-white">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">No tickets found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
