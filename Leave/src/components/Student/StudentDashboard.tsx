import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Calendar, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getLeaveRequests } from '../../lib/storage';
import { LeaveRequest } from '../../types/database';
import LeaveRequestForm from './LeaveRequestForm';

export default function StudentDashboard() {
  const { userProfile } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
  }, [userProfile]);

  const fetchLeaveRequests = () => {
    if (!userProfile) return;

    const allRequests = getLeaveRequests();
    const userRequests = allRequests.filter(req => req.student_id === userProfile.id);
    setLeaveRequests(userRequests);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'parent_approved': return 'bg-pink-100 text-pink-800';
      case 'mentor_approved': return 'bg-blue-100 text-blue-800';
      case 'hod_approved': return 'bg-indigo-100 text-indigo-800';
      case 'principal_approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'parent_approved': return 'Parent Approved';
      case 'mentor_approved': return 'Mentor Approved';
      case 'hod_approved': return 'HOD Approved';
      case 'principal_approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getLeaveTypeIcon = (type: string) => {
    switch (type) {
      case 'sick': return '🏥';
      case 'personal': return '👤';
      case 'emergency': return '🚨';
      case 'vacation': return '🏖️';
      default: return '📝';
    }
  };

  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter(req => req.status === 'pending').length,
    approved: leaveRequests.filter(req => req.status === 'principal_approved').length,
    rejected: leaveRequests.filter(req => req.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Leave Requests</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
        >
          <FileText className="h-4 w-4" />
          <span>{showForm ? 'Cancel' : 'New Request'}</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <LeaveRequestForm
          onSuccess={() => {
            setShowForm(false);
            fetchLeaveRequests();
          }}
        />
      )}

      {/* Leave Requests List */}
      <div className="space-y-4">
        {leaveRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Leave Requests</h3>
            <p className="text-gray-600 mb-4">You haven't submitted any leave requests yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Submit Your First Request
            </button>
          </div>
        ) : (
          leaveRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getLeaveTypeIcon(request.leave_type)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {request.leave_type.replace('_', ' ')} Leave
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {getStatusText(request.status)}
                </span>
              </div>

              <p className="text-gray-700 mb-4">{request.reason}</p>

              {/* Approval Progress */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    request.parent_status === 'approved' ? 'bg-pink-500' :
                    request.parent_status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm text-gray-600 flex items-center space-x-1">
                    <Heart className="h-3 w-3" />
                    <span>Parent</span>
                  </span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200" />
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    request.mentor_status === 'approved' ? 'bg-green-500' :
                    request.mentor_status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm text-gray-600">Mentor</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200" />
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    request.hod_status === 'approved' ? 'bg-green-500' :
                    request.hod_status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm text-gray-600">HOD</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200" />
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    request.principal_status === 'approved' ? 'bg-green-500' :
                    request.principal_status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm text-gray-600">Principal</span>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Submitted on {new Date(request.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}