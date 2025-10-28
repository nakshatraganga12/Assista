import React, { useState } from 'react';
import { Calendar, User, Building, MessageSquare, Check, X, ChevronDown, ChevronUp, Heart, Phone, Mail } from 'lucide-react';
import { LeaveRequest } from '../../types/database';

interface ApprovalCardProps {
  request: LeaveRequest;
  userRole: string;
  onApprove: (comment?: string) => void;
  onReject: (comment?: string) => void;
}

export default function ApprovalCard({ request, userRole, onApprove, onReject }: ApprovalCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');

  const getLeaveTypeIcon = (type: string) => {
    switch (type) {
      case 'sick': return '🏥';
      case 'personal': return '👤';
      case 'emergency': return '🚨';
      case 'vacation': return '🏖️';
      default: return '📝';
    }
  };

  const getStatusForRole = () => {
    switch (userRole) {
      case 'parent': return request.parent_status;
      case 'mentor': return request.mentor_status;
      case 'hod': return request.hod_status;
      case 'principal': return request.principal_status;
      default: return 'pending';
    }
  };

  const canApproveOrReject = () => {
    const status = getStatusForRole();
    return status === 'pending';
  };

  const handleActionClick = (actionType: 'approve' | 'reject') => {
    setAction(actionType);
    setShowCommentModal(true);
  };

  const handleConfirmAction = () => {
    if (action === 'approve') {
      onApprove(comment);
    } else if (action === 'reject') {
      onReject(comment);
    }
    setShowCommentModal(false);
    setComment('');
    setAction(null);
  };

  const getDaysCount = () => {
    const start = new Date(request.start_date);
    const end = new Date(request.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const status = getStatusForRole();

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">{getLeaveTypeIcon(request.leave_type)}</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{request.student_name}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{request.student_email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Building className="h-4 w-4" />
                  <span>{request.department}</span>
                </div>
              </div>
              {request.parent_email && (
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <Mail className="h-3 w-3" />
                    <span>{request.parent_email}</span>
                  </div>
                  {request.parent_phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>{request.parent_phone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              status === 'approved' ? 'bg-green-100 text-green-800' :
              status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending Review'}
            </span>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {showDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Leave Type</p>
            <p className="text-sm font-semibold text-gray-900 mt-1 capitalize">
              {request.leave_type.replace('_', ' ')}
            </p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Duration</p>
            <div className="flex items-center space-x-1 mt-1">
              <Calendar className="h-4 w-4 text-gray-600" />
              <p className="text-sm font-semibold text-gray-900">
                {getDaysCount()} day{getDaysCount() !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Dates</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-600 mb-2">Reason</p>
          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{request.reason}</p>
        </div>

        {showDetails && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 flex items-center space-x-1">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span>Parent Review</span>
                </h4>
                <div className={`p-3 rounded-lg ${
                  request.parent_status === 'approved' ? 'bg-green-50' :
                  request.parent_status === 'rejected' ? 'bg-red-50' : 'bg-yellow-50'
                }`}>
                  <p className={`text-sm font-medium ${
                    request.parent_status === 'approved' ? 'text-green-700' :
                    request.parent_status === 'rejected' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    {request.parent_status === 'approved' ? 'Approved' :
                     request.parent_status === 'rejected' ? 'Rejected' : 'Pending'}
                  </p>
                  {request.parent_comment && (
                    <p className="text-xs text-gray-600 mt-1">{request.parent_comment}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Mentor Review</h4>
                <div className={`p-3 rounded-lg ${
                  request.mentor_status === 'approved' ? 'bg-green-50' :
                  request.mentor_status === 'rejected' ? 'bg-red-50' : 'bg-yellow-50'
                }`}>
                  <p className={`text-sm font-medium ${
                    request.mentor_status === 'approved' ? 'text-green-700' :
                    request.mentor_status === 'rejected' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    {request.mentor_status === 'approved' ? 'Approved' :
                     request.mentor_status === 'rejected' ? 'Rejected' : 'Pending'}
                  </p>
                  {request.mentor_comment && (
                    <p className="text-xs text-gray-600 mt-1">{request.mentor_comment}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">HOD Review</h4>
                <div className={`p-3 rounded-lg ${
                  request.hod_status === 'approved' ? 'bg-green-50' :
                  request.hod_status === 'rejected' ? 'bg-red-50' : 'bg-yellow-50'
                }`}>
                  <p className={`text-sm font-medium ${
                    request.hod_status === 'approved' ? 'text-green-700' :
                    request.hod_status === 'rejected' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    {request.hod_status === 'approved' ? 'Approved' :
                     request.hod_status === 'rejected' ? 'Rejected' : 'Pending'}
                  </p>
                  {request.hod_comment && (
                    <p className="text-xs text-gray-600 mt-1">{request.hod_comment}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Principal Review</h4>
                <div className={`p-3 rounded-lg ${
                  request.principal_status === 'approved' ? 'bg-green-50' :
                  request.principal_status === 'rejected' ? 'bg-red-50' : 'bg-yellow-50'
                }`}>
                  <p className={`text-sm font-medium ${
                    request.principal_status === 'approved' ? 'text-green-700' :
                    request.principal_status === 'rejected' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    {request.principal_status === 'approved' ? 'Approved' :
                     request.principal_status === 'rejected' ? 'Rejected' : 'Pending'}
                  </p>
                  {request.principal_comment && (
                    <p className="text-xs text-gray-600 mt-1">{request.principal_comment}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Submitted on {new Date(request.created_at).toLocaleString()}
              {request.updated_at !== request.created_at && (
                <span> • Last updated {new Date(request.updated_at).toLocaleString()}</span>
              )}
            </div>
          </div>
        )}

        {canApproveOrReject() && (
          <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleActionClick('reject')}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <X className="h-4 w-4" />
              <span>Reject</span>
            </button>
            <button
              onClick={() => handleActionClick('approve')}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Check className="h-4 w-4" />
              <span>Approve</span>
            </button>
          </div>
        )}
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {action === 'approve' ? 'Approve' : 'Reject'} Leave Request
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder={`Add a comment about your ${action} decision...`}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setComment('');
                    setAction(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`px-4 py-2 rounded-lg font-medium text-white ${
                    action === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}