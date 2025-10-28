import { User, LeaveRequest, Notification } from '../types/database';

// Local storage keys
const USERS_KEY = 'college_leave_users';
const LEAVE_REQUESTS_KEY = 'college_leave_requests';
const NOTIFICATIONS_KEY = 'college_leave_notifications';
const CURRENT_USER_KEY = 'college_leave_current_user';

// Initialize with demo data if empty
const initializeData = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    const demoUsers: User[] = [
      {
        id: '1',
        email: 'student@college.edu',
        full_name: 'John Doe',
        role: 'student',
        department: 'Computer Science',
        student_id: 'CS2024001',
        parent_email: 'parent@example.com',
        parent_phone: '+1234567890',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        email: 'parent@example.com',
        full_name: 'Jane Doe',
        role: 'parent',
        department: 'Computer Science',
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        email: 'mentor@college.edu',
        full_name: 'Dr. Smith',
        role: 'mentor',
        department: 'Computer Science',
        created_at: new Date().toISOString(),
      },
      {
        id: '4',
        email: 'hod@college.edu',
        full_name: 'Prof. Johnson',
        role: 'hod',
        department: 'Computer Science',
        created_at: new Date().toISOString(),
      },
      {
        id: '5',
        email: 'principal@college.edu',
        full_name: 'Dr. Williams',
        role: 'principal',
        department: 'Administration',
        created_at: new Date().toISOString(),
      },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(demoUsers));
  }

  if (!localStorage.getItem(LEAVE_REQUESTS_KEY)) {
    localStorage.setItem(LEAVE_REQUESTS_KEY, JSON.stringify([]));
  }

  if (!localStorage.getItem(NOTIFICATIONS_KEY)) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
  }
};

// User management
export const getUsers = (): User[] => {
  initializeData();
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

export const getUserById = (id: string): User | null => {
  const users = getUsers();
  return users.find(user => user.id === id) || null;
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(user => user.email === email) || null;
};

export const createUser = (userData: Omit<User, 'id' | 'created_at'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return newUser;
};

// Authentication
export const getCurrentUser = (): User | null => {
  const userId = localStorage.getItem(CURRENT_USER_KEY);
  return userId ? getUserById(userId) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, user.id);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const signIn = (email: string, password: string): User | null => {
  // Simple authentication - in real app, you'd verify password
  const user = getUserByEmail(email);
  if (user) {
    setCurrentUser(user);
    return user;
  }
  return null;
};

export const signUp = (email: string, password: string, userData: Partial<User>): User => {
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  const newUser = createUser({
    email,
    full_name: userData.full_name || '',
    role: userData.role || 'student',
    department: userData.department || '',
    student_id: userData.student_id,
    parent_email: userData.parent_email,
    parent_phone: userData.parent_phone,
  });
  
  setCurrentUser(newUser);
  return newUser;
};

export const signOut = (): void => {
  setCurrentUser(null);
};

// Leave requests
export const getLeaveRequests = (): LeaveRequest[] => {
  return JSON.parse(localStorage.getItem(LEAVE_REQUESTS_KEY) || '[]');
};

export const getLeaveRequestById = (id: string): LeaveRequest | null => {
  const requests = getLeaveRequests();
  return requests.find(req => req.id === id) || null;
};

export const createLeaveRequest = (requestData: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>): LeaveRequest => {
  const requests = getLeaveRequests();
  const newRequest: LeaveRequest = {
    ...requestData,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  requests.push(newRequest);
  localStorage.setItem(LEAVE_REQUESTS_KEY, JSON.stringify(requests));
  
  // Create notification for parent first
  if (requestData.parent_email) {
    const parent = getUserByEmail(requestData.parent_email);
    if (parent) {
      createNotification({
        user_id: parent.id,
        leave_request_id: newRequest.id,
        message: `Leave request from ${requestData.student_name} needs your approval`,
        type: 'approval_pending',
        read: false,
      });
    }
  }
  
  return newRequest;
};

export const updateLeaveRequest = (id: string, updates: Partial<LeaveRequest>): LeaveRequest | null => {
  const requests = getLeaveRequests();
  const index = requests.findIndex(req => req.id === id);
  if (index === -1) return null;
  
  requests[index] = {
    ...requests[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  localStorage.setItem(LEAVE_REQUESTS_KEY, JSON.stringify(requests));
  return requests[index];
};

// Notifications
export const getNotifications = (): Notification[] => {
  return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
};

export const createNotification = (notificationData: Omit<Notification, 'id' | 'created_at'>): Notification => {
  const notifications = getNotifications();
  const newNotification: Notification = {
    ...notificationData,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
  };
  notifications.push(newNotification);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  return newNotification;
};

export const markNotificationAsRead = (id: string): void => {
  const notifications = getNotifications();
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications[index].read = true;
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }
};

export const getUserNotifications = (userId: string): Notification[] => {
  const notifications = getNotifications();
  return notifications.filter(n => n.user_id === userId).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};