import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, FileText, Users, Filter, Search, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getLeaveRequests, updateLeaveRequest, createNotification, getUserByEmail } from '../../lib/storage';
import { LeaveRequest } from '../../types/database';
import ApprovalCard from './ApprovalCard';

export default function ApproverDashboard() {
  const { userProfile } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeaveRequests();
  }, [userProfile]);

  useEffect(() => {
    filterRequests();
  }, [leaveRequests, filter, searchTerm]);

  const fetchLeaveRequests = () => {
    if (!userProfile) return;

    const allRequests = getLeaveRequests();
    let filteredByRole = allRequests;

    // Filter based on user role and current approval stage
    if (userProfile.role === 'parent') {
      // Parents see requests from their children
      filteredByRole = allRequests.filter(req => req.parent_email === userProfile.email);
    } else if (userProfile.role === 'mentor') {
      filteredByRole = allRequests.filter(req => 
        req.department === userProfile.department && 
        req.parent_status === 'approved'
      );
    } else if (userProfile.role === 'hod') {
      filteredByRole = allRequests.filter(req =>
        req.department === userProfile.department &&
        req.parent_status === 'approved' &&
        req.mentor_status === 'approved'
      );
    } else if (userProfile.role === 'principal') {
      filteredByRole = allRequests.filter(req =>
        req.parent_status === 'approved' &&
        req.mentor_status === 'approved' &&
        req.hod_status === 'approved'
      );
    }

    setLeaveRequests(filteredByRole);
    setLoading(false);
  };

  const filterRequests = () => {
    let filtered = leaveRequests;

    // Apply status filter
    if (filter === 'pending') {
      if (userProfile?.role === 'parent') {
        filtered = filtered.filter(req => req.parent_status === 'pending');
      } else if (userProfile?.role === 'mentor') {
        filtered = filtered.filter(req => req.mentor_status === 'pending');
      } else if (userProfile?.role === 'hod') {
        filtered = filtered.filter(req => req.hod_status === 'pending');
      } else if (userProfile?.role === 'principal') {
        filtered = filtered.filter(req => req.principal_status === 'pending');
      }
    } else if (filter === 'approved') {
      if (userProfile?.role === 'parent') {
        filtered = filtered.filter(req => req.parent_status === 'approved');
      } else if (userProfile?.role === 'mentor') {
        filtered = filtered.filter(req => req.mentor_status === 'approved');
      } else if (userProfile?.role === 'hod') {
        filtered = filtered.filter(req => req.hod_status === 'approved');
      } else if (userProfile?.role === 'principal') {
        filtered = filtered.filter(req => req.principal_status === 'approved');
      }
    } else if (filter === 'rejected') {
      if (userProfile?.role === 'parent') {
        filtered = filtered.filter(req => req.parent_status === 'rejected');
      } else if (userProfile?.role === 'mentor') {
        filtered = filtered.filter(req => req.mentor_status === 'rejected');
      } else if (userProfile?.role === 'hod') {
        filtered = filtered.filter(req => req.hod_status === 'rejected');
      } else if (userProfile?.role === 'principal') {
        filtered = filtered.filter(req => req.principal_status === 'rejected');
      }
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const handleApproval = (requestId: string, action: 'approve' | 'reject', comment?: string) => {
    if (!userProfile) return;

    const roleColumn = `${userProfile.role}_status`;
    const commentColumn = `${userProfile.role}_comment`;
    
    const updateData: any = {
      [roleColumn]: action === 'approve' ? 'approved' : 'rejected',
    };

    if (comment) {
      updateData[commentColumn] = comment;
    }

    // Update overall status based on role and action
    if (action === 'reject') {
      updateData.status = 'rejected';
    } else if (userProfile.role === 'principal') {
      updateData.status = 'principal_approved';
    } else if (userProfile.role === 'hod') {
      updateData.status = 'hod_approved';
    } else if (userProfile.role === 'mentor') {
      updateData.status = 'mentor_approved';
    } else if (userProfile.role === 'parent') {
      updateData.status = 'parent_approved';
    }

    const updatedRequest = updateLeaveRequest(requestId, updateData);
    
    if (updatedRequest) {
      // Create notifications for next approver or student
      if (action === 'approve' && userProfile.role !== 'principal') {
        let nextRole = '';
        if (userProfile.role === 'parent') nextRole = 'mentor';
        else if (userProfile.role === 'mentor') nextRole = 'hod';
        else if (userProfile.role === 'hod') nextRole = 'principal';

        if (nextRole) {
          // Find next approver in the same department
          const nextApprover = getUserByEmail(`${nextRole}@college.edu`);
          if (nextApprover) {
            createNotification({
              user_id: nextApprover.id,
              leave_request_id: requestId,
              message: `Leave request from ${updatedRequest.student_name} needs your approval`,
              type: 'approval_pending',
              read: false,
            });
          }
        }
      }

      // Notify student of final decision
      if (userProfile.role === 'principal' || action === 'reject') {
        createNotification({
          user_id: updatedRequest.student_id,
          leave_request_id: requestId,
          message: `Your leave request has been ${action === 'approve' ? 'approved' : 'rejected'} by ${userProfile.full_name}`,
          type: action === 'approve' ? 'approved' : 'rejected',
          read: false,
        });
      }

      fetchLeaveRequests();
    }
  };

  const getPendingCount = () => {
    if (userProfile?.role === 'parent') {
      return leaveRequests.filter(req => req.parent_status === 'pending').length;
    } else if (userProfile?.role === 'mentor') {
      return leaveRequests.filter(req => req.mentor_status === 'pending').length;
    } else if (userProfile?.role === 'hod') {
      return leaveRequests.filter(req => req.hod_status === 'pending').length;
    } else if (userProfile?.role === 'principal') {
      return leaveRequests.filter(req => req.principal_status === 'pending').length;
    }
    return 0;
  };

  const getApprovedCount = () => {
    if (userProfile?.role === 'parent') {
      return leaveRequests.filter(req => req.parent_status === 'approved').length;
    } else if (userProfile?.role === 'mentor') {
      return leaveRequests.filter(req => req.mentor_status === 'approved').length;
    } else if (userProfile?.role === 'hod') {
      return leaveRequests.filter(req => req.hod_status === 'approved').length;
    } else if (userProfile?.role === 'principal') {
      return leaveRequests.filter(req => req.principal_status === 'approved').length;
    }
    return 0;
  };

  const getRejectedCount = () => {
    if (userProfile?.role === 'parent') {
      return leaveRequests.filter(req => req.parent_status === 'rejected').length;
    } else if (userProfile?.role === 'mentor') {
      return leaveRequests.filter(req => req.mentor_status === 'rejected').length;
    } else if (userProfile?.role === 'hod') {
      return leaveRequests.filter(req => req.hod_status === 'rejected').length;
    } else if (userProfile?.role === 'principal') {
      return leaveRequests.filter(req => req.principal_status === 'rejected').length;
    }
    return 0;
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
              <p className="text-2xl font-bold text-gray-900">{leaveRequests.length}</p>
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
              <p className="text-2xl font-bold text-yellow-600">{getPendingCount()}</p>
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
              <p className="text-2xl font-bold text-green-600">{getApprovedCount()}</p>
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
              <p className="text-2xl font-bold text-red-600">{getRejectedCount()}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          {userProfile?.role === 'parent' && <Heart className="h-6 w-6 text-pink-500" />}
          <span>Leave Requests</span>
        </h1>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Leave Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Leave Requests</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "There are no leave requests to review at this time."
                : `No ${filter} leave requests found.`
              }
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <ApprovalCard
              key={request.id}
              request={request}
              userRole={userProfile?.role || 'student'}
              onApprove={(comment) => handleApproval(request.id, 'approve', comment)}
              onReject={(comment) => handleApproval(request.id, 'reject', comment)}
            />
          ))
        )}
      </div>
    </div>
  );
}