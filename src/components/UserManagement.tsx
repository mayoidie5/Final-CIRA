import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, Trash2, Filter, X } from 'lucide-react';
import { User } from '../types';
import { FormDialog } from './FormDialog';
import { ConfirmDialog } from './ConfirmDialog';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<{ userId: string; userName: string } | null>(null);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    course: 'all',
    section: 'all',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers.filter((u: User) => u.role !== 'admin' && !u.isPending));
    setPendingUsers(storedUsers.filter((u: User) => u.isPending));
  };

  const handleApprove = (userId: string) => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = storedUsers.map((u: User) =>
      u.id === userId ? { ...u, isPending: false, isVerified: true } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    loadUsers();
  };

  const handleReject = (userId: string) => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = storedUsers.filter((u: User) => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    loadUsers();
  };

  const handleDeleteUser = (data: any) => {
    if (!showDeleteDialog) return;

    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const deletionType = data.deletionType;

    if (deletionType === 'instant') {
      // Instant deletion
      const updatedUsers = storedUsers.filter((u: User) => u.id !== showDeleteDialog.userId);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      alert(`User ${showDeleteDialog.userName} has been permanently deleted.`);
    } else {
      // 3-day warning
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + 3);
      
      const updatedUsers = storedUsers.map((u: User) =>
        u.id === showDeleteDialog.userId
          ? {
              ...u,
              pendingDeletion: true,
              deletionDate: deletionDate.toISOString(),
              deletionReason: data.reason || 'No reason provided',
            }
          : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      alert(`User ${showDeleteDialog.userName} has been scheduled for deletion in 3 days. They have been notified.`);
    }

    loadUsers();
    setShowDeleteDialog(null);
  };

  const handleCancelDeletion = (userId: string) => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = storedUsers.map((u: User) =>
      u.id === userId
        ? { ...u, pendingDeletion: false, deletionDate: undefined, deletionReason: undefined }
        : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    loadUsers();
    alert('Account deletion has been cancelled.');
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = filters.role === 'all' || user.role === filters.role;
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'verified' && user.isVerified) ||
      (filters.status === 'unverified' && !user.isVerified) ||
      (filters.status === 'pending_deletion' && user.pendingDeletion);
    const matchesCourse = filters.course === 'all' || user.course === filters.course;
    const matchesSection = filters.section === 'all' || user.section === filters.section;

    return matchesRole && matchesStatus && matchesCourse && matchesSection;
  });

  const uniqueCourses = Array.from(new Set(users.map(u => u.course).filter(Boolean)));
  const uniqueSections = Array.from(new Set(users.map(u => u.section).filter(Boolean)));

  const stats = {
    total: users.length,
    verified: users.filter(u => u.isVerified).length,
    unverified: users.filter(u => !u.isVerified).length,
    pendingDeletion: users.filter(u => u.pendingDeletion).length,
    students: users.filter(u => u.role === 'student').length,
    classReps: users.filter(u => u.role === 'class_rep').length,
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-gray-800 dark:text-white mb-2">User Management</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage user accounts and pending requests</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-blue-600 dark:text-blue-400" size={20} />
            <span className="text-gray-600 dark:text-gray-400">Total Users</span>
          </div>
          <p className="text-gray-800 dark:text-white">{stats.total}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
            <span className="text-gray-600 dark:text-gray-400">Verified</span>
          </div>
          <p className="text-gray-800 dark:text-white">{stats.verified}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-yellow-600 dark:text-yellow-400" size={20} />
            <span className="text-gray-600 dark:text-gray-400">Unverified</span>
          </div>
          <p className="text-gray-800 dark:text-white">{stats.unverified}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="text-red-600 dark:text-red-400" size={20} />
            <span className="text-gray-600 dark:text-gray-400">Pending Deletion</span>
          </div>
          <p className="text-gray-800 dark:text-white">{stats.pendingDeletion}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-purple-600 dark:text-purple-400" size={20} />
            <span className="text-gray-600 dark:text-gray-400">Students</span>
          </div>
          <p className="text-gray-800 dark:text-white">{stats.students}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-indigo-600 dark:text-indigo-400" size={20} />
            <span className="text-gray-600 dark:text-gray-400">Class Reps</span>
          </div>
          <p className="text-gray-800 dark:text-white">{stats.classReps}</p>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingUsers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-gray-800 dark:text-white flex items-center gap-2">
              <Clock size={20} />
              Pending Class Representative Requests
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Name</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Email</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Student ID</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Course/Year/Section</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Role</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Date Requested</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map(user => (
                  <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-gray-800 dark:text-white">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-white">{user.email}</td>
                    <td className="py-3 px-4 text-gray-800 dark:text-white">{user.studentId}</td>
                    <td className="py-3 px-4 text-gray-800 dark:text-white">
                      {user.course} / {user.yearLevel} / {user.section}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400">
                        Class Representative
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-white">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/30"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/30"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Users */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 dark:text-white flex items-center gap-2">
              <Users size={20} />
              All Users
            </h3>
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
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-gray-800 dark:text-white">Filter Options</h4>
                {Object.values(filters).some(f => f !== 'all') && (
                  <button
                    onClick={() => setFilters({ role: 'all', status: 'all', course: 'all', section: 'all' })}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({...filters, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Student</option>
                    <option value="class_rep">Class Representative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                    <option value="pending_deletion">Pending Deletion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Course</label>
                  <select
                    value={filters.course}
                    onChange={(e) => setFilters({...filters, course: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Courses</option>
                    {uniqueCourses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Section</label>
                  <select
                    value={filters.section}
                    onChange={(e) => setFilters({...filters, section: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Sections</option>
                    {uniqueSections.map(section => (
                      <option key={section} value={section}>{section}</option>
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
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Name</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Email</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Student ID</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Course/Year/Section</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Role</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Joined</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-800 dark:text-white">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="py-3 px-4 text-gray-800 dark:text-white">{user.email}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-white">{user.studentId || '-'}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-white">
                    {user.course} / {user.yearLevel} / {user.section}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full ${
                      user.role === 'class_rep' 
                        ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400'
                        : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                    }`}>
                      {user.role === 'class_rep' ? 'Class Representative' : 'Student'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {user.pendingDeletion ? (
                      <div>
                        <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">
                          Pending Deletion
                        </span>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                          Deletes: {new Date(user.deletionDate!).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          Reason: {user.deletionReason}
                        </p>
                        <button
                          onClick={() => handleCancelDeletion(user.id)}
                          className="text-blue-600 dark:text-blue-400 hover:underline mt-1"
                        >
                          Cancel Deletion
                        </button>
                      </div>
                    ) : (
                      <span className={`px-2 py-1 rounded-full ${
                        user.isVerified
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                      }`}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-800 dark:text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {!user.pendingDeletion && (
                      <button
                        onClick={() => setShowDeleteDialog({ 
                          userId: user.id, 
                          userName: `${user.firstName} ${user.lastName}` 
                        })}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete User Dialog */}
      {showDeleteDialog && (
        <FormDialog
          title={`Delete User: ${showDeleteDialog.userName}`}
          fields={[
            {
              name: 'deletionType',
              label: 'Deletion Type',
              type: 'select',
              required: true,
              options: ['3-day warning', 'instant'],
            },
            {
              name: 'reason',
              label: 'Reason for Deletion',
              type: 'textarea',
              required: true,
              placeholder: 'Enter the reason for account deletion...',
            },
          ]}
          onSubmit={handleDeleteUser}
          onCancel={() => setShowDeleteDialog(null)}
          submitLabel="Delete User"
        />
      )}
    </div>
  );
};
