export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'mentor' | 'hod' | 'principal' | 'parent';
  department: string;
  student_id?: string;
  parent_email?: string;
  parent_phone?: string;
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  department: string;
  parent_email?: string;
  parent_phone?: string;
  leave_type: 'sick' | 'personal' | 'emergency' | 'vacation' | 'other';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'parent_approved' | 'mentor_approved' | 'hod_approved' | 'principal_approved' | 'rejected';
  parent_status: 'pending' | 'approved' | 'rejected';
  mentor_status: 'pending' | 'approved' | 'rejected';
  hod_status: 'pending' | 'approved' | 'rejected';
  principal_status: 'pending' | 'approved' | 'rejected';
  parent_comment?: string;
  mentor_comment?: string;
  hod_comment?: string;
  principal_comment?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  leave_request_id: string;
  message: string;
  type: 'approval_pending' | 'approved' | 'rejected';
  read: boolean;
  created_at: string;
}