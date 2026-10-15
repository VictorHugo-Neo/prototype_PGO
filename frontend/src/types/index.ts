export type UserType = 'student' | 'advisor';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'late';

export type MeetingStatus = 'pending' | 'confirmed' | 'rejected';

export interface User {
  id: number;
  name: string;
  email: string;
  type: UserType;
  avatar_path?: string;
  created_at?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  order?: number;
  guidance_id: number;
  time_estimate?: string;
}

export interface TaskCreatePayload {
  title: string;
  description?: string;
  guidance_id: number;
  time_estimate?: string;
  status?: TaskStatus;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  time_estimate?: string | null;
  status?: TaskStatus;
  order?: number;
}

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_name: string;
  user_id: number;
}

export interface Attachment {
  id: number;
  filename: string;
  file_path: string;
  created_at: string;
  task_id: number;
}

export interface Meeting {
  id: number;
  date: string;
  topic: string;
  status: MeetingStatus;
  guidance_id: number;
  created_at?: string;
}

export interface Notification {
  id: number;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
}

export interface StudentGuidance {
  id: number;
  theme: string;
  defense_date?: string;
  created_at?: string;
  student: {
    id: number;
    name: string;
    email: string;
    avatar_path?: string;
  };
  advisor?: {
    id: number;
    name: string;
    email?: string;
    avatar_path?: string;
  };
}

export interface DashboardTaskStat {
  name: string;
  value: number;
  color: string;
}

export interface StudentRanking {
  name: string;
  progress: number;
}

export interface DashboardStats {
  total_students: number;
  pending_meetings: number;
  task_stats: DashboardTaskStat[];
  student_ranking: StudentRanking[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  type: UserType;
}
