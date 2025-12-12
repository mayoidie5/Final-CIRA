import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, Trash2, Filter, AlertCircle, ChevronDown } from 'lucide-react';
import { User } from '../types';
import { FormDialog } from './FormDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { SuccessToast } from './SuccessToast';
import * as userService from '../services/userService';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<{ userId: string; userName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    course: 'all',
    section: 'all',
  });

  const toggleExpandUser = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allUsers, pending] = await Promise.all([
        userService.fetchAllUsers(),
        userService.fetchPendingUsers(),
      ]);
      setUsers(allUsers);
      setPendingUsers(pending);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users from database');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await userService.approveUser(userId);
      setSuccessMessage('User approved successfully');
      await loadUsers();
    } catch (err) {
      console.error('Failed to approve user:', err);
      setError('Failed to approve user');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await userService.rejectUser(userId);
      setSuccessMessage('User request rejected');
      await loadUsers();
    } catch (err) {
      console.error('Failed to reject user:', err);
      setError('Failed to reject user');
    }
  };

  const handleDeleteUser = async (data: any) => {
    if (!showDeleteDialog) return;

    try {
      if (data.deletionType === 'instant') {
        await userService.deleteUserInstant(showDeleteDialog.userId);
        setSuccessMessage(`User ${showDeleteDialog.userName} has been permanently deleted.`);
      } else {
        await userService.scheduleUserDeletion(showDeleteDialog.userId, data.reason || 'No reason provided');
        setSuccessMessage(`User ${showDeleteDialog.userName} has been scheduled for deletion in 3 days.`);
      }
      await loadUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError('Failed to delete user');
    } finally {
      setShowDeleteDialog(null);
    }
  };

  const handleCancelDeletion = async (userId: string) => {
    try {
      await userService.cancelUserDeletion(userId);
      setSuccessMessage('Account deletion has been cancelled.');
      await loadUsers();
    } catch (err) {
      console.error('Failed to cancel deletion:', err);
      setError('Failed to cancel deletion');
    }
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Success Toast */}
      {successMessage && (
        <SuccessToast
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="text-red-900 dark:text-red-100 font-semibold">Error</h3>
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      <div>
        <h2 className="text-gray-800 dark:text-white mb-2">User Management</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage user accounts and pending requests</p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-blue-600 dark:text-blue-400" size={20} />
            <span className="text-gray-600 dark:text-gray-400 text-sm">Total Users</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
            <span className="text-gray-600 dark:text-gray-400 text-sm">Verified</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.verified}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-yellow-600 dark:text-yellow-400" size={20} />
            <span className="text-gray-600 dark:text-gray-400 text-sm">Unverified</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.unverified}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="text-red-600 dark:text-red-400" size={20} />
            <span className="text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap">Pending Delete</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.pendingDeletion}</p>
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
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-gray-800 dark:text-white flex items-center gap-2">
              <Clock size={20} />
              Pending Class Representative Requests
            </h3>
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">Name</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">Email</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">Student ID</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">Course/Year/Section</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">Role</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">Date Requested</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map(user => (
                  <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-gray-800 dark:text-white text-sm">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-white text-sm">{user.email}</td>
                    <td className="py-3 px-4 text-gray-800 dark:text-white text-sm">{user.studentId}</td>
                    <td className="py-3 px-4 text-gray-800 dark:text-white text-sm">
                      {user.course} / {user.yearLevel} / {user.section}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 text-xs">
                        Class Representative
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-white text-sm">
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

          {/* Mobile/Tablet Card View */}
          <div className="xl:hidden p-4 space-y-4">
            {pendingUsers.map(user => {
              const isExpanded = expandedUsers.has(user.id);
              return (
                <div key={user.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {/* Header: Name, Role Badge, and Expand Toggle */}
                  <div 
                    onClick={() => toggleExpandUser(user.id)}
                    className="p-4 bg-white dark:bg-gray-800 flex items-start justify-between gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 text-sm whitespace-nowrap">
                        Class Rep
                      </span>
                      <ChevronDown 
                        size={20} 
                        className={`text-gray-600 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {isExpanded && (
                    <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Student ID</p>
                          <p className="text-gray-800 dark:text-white">{user.studentId}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Date Requested</p>
                          <p className="text-gray-800 dark:text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600 dark:text-gray-400">Course/Year/Section</p>
                          <p className="text-gray-800 dark:text-white">
                            {user.course} / {user.yearLevel} / {user.section}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 py-2 px-4 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                        >
                          <CheckCircle size={18} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-2 px-4 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Users */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-gray-800 dark:text-white flex items-center gap-2">
              <Users size={20} />
              All Users
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto justify-center sm:justify-start"
            >
              <Filter size={20} />
              Filters
              {Object.values(filters).filter(f => f !== 'all').length > 0 && (
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {Object.values(filters).filter(f => f !== 'all').length}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-gray-800 dark:text-white text-sm sm:text-base">Filter Options</h4>
                {Object.values(filters).some(f => f !== 'all') && (
                  <button
                    onClick={() => setFilters({ role: 'all', status: 'all', course: 'all', section: 'all' })}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
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

        {/* Desktop Table View */}
        <div className="hidden xl:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">Name</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">Email</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">Student ID</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">Course/Year/Section</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">Role</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">Status</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">Joined</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-800 dark:text-white text-sm">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="py-3 px-4 text-gray-800 dark:text-white text-sm">{user.email}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-white text-sm">{user.studentId || '-'}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-white text-sm">
                    {user.course} / {user.yearLevel} / {user.section}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
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
                        <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-xs">
                          Pending Deletion
                        </span>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs">
                          Deletes: {new Date(user.deletionDate!).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                          Reason: {user.deletionReason}
                        </p>
                        <button
                          onClick={() => handleCancelDeletion(user.id)}
                          className="text-blue-600 dark:text-blue-400 hover:underline mt-1 text-xs"
                        >
                          Cancel Deletion
                        </button>
                      </div>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs ${
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
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="xl:hidden p-4 space-y-4">
          {filteredUsers.map(user => {
            const isExpanded = expandedUsers.has(user.id);
            return (
              <div key={user.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {/* Header: Name, Role Badge, and Expand Toggle */}
                <div 
                  onClick={() => toggleExpandUser(user.id)}
                  className="p-4 bg-white dark:bg-gray-800 flex items-start justify-between gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 break-all">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                      user.role === 'class_rep' 
                        ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400'
                        : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                    }`}>
                      {user.role === 'class_rep' ? 'Class Rep' : 'Student'}
                    </span>
                    <ChevronDown 
                      size={20} 
                      className={`text-gray-600 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>

                {/* Expandable Details */}
                {isExpanded && (
                  <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Student ID</p>
                        <p className="text-gray-800 dark:text-white">{user.studentId || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Joined</p>
                        <p className="text-gray-800 dark:text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-600 dark:text-gray-400">Course/Year/Section</p>
                        <p className="text-gray-800 dark:text-white">
                          {user.course} / {user.yearLevel} / {user.section}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-600 dark:text-gray-400 mb-1">Status</p>
                        {user.pendingDeletion ? (
                          <div className="space-y-2">
                            <span className="inline-block px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-xs">
                              Pending Deletion
                            </span>
                            <div className="text-xs space-y-1">
                              <p className="text-gray-600 dark:text-gray-400">
                                Deletes: {new Date(user.deletionDate!).toLocaleDateString()}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                Reason: {user.deletionReason}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCancelDeletion(user.id)}
                              className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                            >
                              Cancel Deletion
                            </button>
                          </div>
                        ) : (
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            user.isVerified
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                          }`}>
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {!user.pendingDeletion && (
                      <button
                        onClick={() => setShowDeleteDialog({ 
                          userId: user.id, 
                          userName: `${user.firstName} ${user.lastName}` 
                        })}
                        className="w-full flex items-center justify-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 px-4 rounded-lg transition-colors border border-red-200 dark:border-red-800"
                      >
                        <Trash2 size={18} />
                        Delete User
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">No users found</p>
          </div>
        )}
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
        </>
      )}
    </div>
  );
};
