export type UserRole = 'admin' | 'class_rep' | 'student';

export type TicketStatus = 
  | 'submitted' 
  | 'accepted' 
  | 'requested' 
  | 'in_progress' 
  | 'submit_for_resolution' 
  | 'pending_resolution' 
  | 'request_for_resolution'
  | 'resolved';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  studentId?: string;
  course?: string;
  section?: string;
  yearLevel?: string;
  department: string;
  isVerified: boolean;
  isPending?: boolean;
  requestedRole?: UserRole;
  pendingDeletion?: boolean;
  deletionDate?: string;
  deletionReason?: string;
  theme?: 'light' | 'dark' | 'system';
  createdAt: string;
}

export interface TicketComment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  message: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  campus: string;
  building: string;
  room: string;
  unitId: string;
  issueType: string;
  issueSubtype: string;
  issueDescription: string;
  images: string[];
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  acceptedBy?: string;
  adminNotes?: string;
  resolutionNote?: string;
  resolvedAt?: string;
  comments?: TicketComment[];
  studentConfirmedResolution?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  ticketId: string;
  message: string;
  isRead: boolean;
  targetPage?: string;
  createdAt: string;
}

export interface FormConfig {
  campuses: Campus[];
  issueTypes: IssueType[];
}

export interface Campus {
  name: string;
  buildings: Building[];
}

export interface Building {
  name: string;
  rooms: Room[];
}

export interface Room {
  name: string;
  unitIds: string[];
}

export interface IssueType {
  name: string;
  subtypes: string[];
}
