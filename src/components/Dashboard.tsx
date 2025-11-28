import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTickets } from '../hooks/useTickets';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FileText, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { tickets } = useTickets();

  const getUserTickets = () => {
    if (user?.role === 'admin') {
      return tickets;
    } else if (user?.role === 'class_rep') {
      return tickets.filter(t => t.acceptedBy === user.id || t.status === 'submitted');
    } else {
      return tickets.filter(t => t.userId === user?.id);
    }
  };

  const userTickets = getUserTickets();
  const submittedCount = userTickets.filter(t => t.status === 'submitted').length;
  const inProgressCount = userTickets.filter(t => ['requested', 'in_progress'].includes(t.status)).length;
  const resolvedCount = userTickets.filter(t => t.status === 'resolved').length;
  const pendingCount = userTickets.filter(t => t.status === 'pending_resolution' || t.status === 'request_for_resolution').length;

  const issueTypeData = [
    { name: 'Hardware', value: tickets.filter(t => t.issueType === 'Hardware').length },
    { name: 'Software', value: tickets.filter(t => t.issueType === 'Software').length },
    { name: 'Network', value: tickets.filter(t => t.issueType === 'Network').length },
    { name: 'Others', value: tickets.filter(t => t.issueType === 'Others').length },
  ];

  const campusData = [
    { name: 'Maysan', value: tickets.filter(t => t.campus === 'Maysan Campus').length },
    { name: 'Annex', value: tickets.filter(t => t.campus === 'Annex Campus').length },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-gray-800 dark:text-white mb-2">
          Welcome back, {user?.firstName}!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {user?.role === 'admin' ? 'Admin Dashboard' : user?.role === 'class_rep' ? 'Class Representative Dashboard' : 'Student Dashboard'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Total Tickets</p>
              <p className="text-gray-800 dark:text-white mt-2">{userTickets.length}</p>
            </div>
            <FileText className="text-blue-600 dark:text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-gray-800 dark:text-white mt-2">{inProgressCount}</p>
            </div>
            <Clock className="text-yellow-600 dark:text-yellow-400" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Resolved</p>
              <p className="text-gray-800 dark:text-white mt-2">{resolvedCount}</p>
            </div>
            <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-gray-800 dark:text-white mt-2">{pendingCount}</p>
            </div>
            <AlertTriangle className="text-red-600 dark:text-red-400" size={32} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-800 dark:text-white mb-4">Issues by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={issueTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {issueTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-800 dark:text-white mb-4">Issues by Campus</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={campusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3B82F6" name="Tickets" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h3 className="text-gray-800 dark:text-white mb-4">Recent Tickets</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Ticket ID</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Issue Type</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Room</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {userTickets.slice(0, 5).map(ticket => (
                <tr key={ticket.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-800 dark:text-white">#{ticket.id.slice(0, 8)}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-white">{ticket.issueType}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-white">{ticket.room}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full ${
                      ticket.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                      ticket.status === 'in_progress' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' :
                      'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-800 dark:text-white">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {userTickets.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No tickets found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
