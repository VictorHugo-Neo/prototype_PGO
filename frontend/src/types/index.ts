export type UserType = 'student' | 'advisor';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'late' | (string & {});

export type MeetingStatus = 'pending' | 'confirmed' | 'rejected';

export interface KanbanColumn {
  id: number;
  guidance_id: number;
  title: string;
  slug: string;
  color: string;
  order: number;
  created_at?: string;
}

export interface KanbanColumnCreatePayload {
  title: string;
  color?: string;
  order?: number;
}

export interface KanbanColumnUpdatePayload {
  title?: string;
  color?: string;
  order?: number;
}

export interface KanbanColumnReorderPayload {
  column_ids: number[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  type: UserType;
  avatar_path?: string;
  created_at?: string;
}

export interface TaskCreator {
  id: number;
  name: string;
  email: string;
  type?: UserType;
  avatar_path?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  order?: number;
  guidance_id: number;
  time_estimate?: string;
  creator_id?: number | null;
  creator?: TaskCreator | null;
}

export interface TaskCreatePayload {
  title: string;
  description?: string;
  guidance_id: number;
  time_estimate?: string;
  status?: TaskStatus;
  creator_id?: number;
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

export interface MeetingUpdatePayload {
  date?: string;
  topic?: string;
  status?: MeetingStatus;
}

export interface Notification {
  id: number;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
}

export interface AvailableStudent {
  id: number;
  name: string;
  email: string;
  avatar_path?: string;
  is_already_linked: boolean;
  active_theme?: string;
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
  slug?: string;
}

export interface StudentRanking {
  name: string;
  progress: number;
  id?: number;
  guidance_id?: number;
  full_name?: string;
  theme?: string;
  total_tasks?: number;
  completed_tasks?: number;
}

export interface GuidanceColumnSummary {
  title: string;
  slug: string;
  color: string;
  task_count: number;
}

export interface GuidanceKanbanSummary {
  guidance_id: number;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  progress: number;
  pending_meetings: number;
  confirmed_meetings: number;
  columns?: GuidanceColumnSummary[];
}

export interface DashboardStats {
  total_students: number;
  pending_meetings: number;
  confirmed_meetings?: number;
  total_tasks?: number;
  completed_tasks?: number;
  in_progress_tasks?: number;
  overall_progress?: number;
  task_stats: DashboardTaskStat[];
  student_ranking: StudentRanking[];
  guidances_summary?: Record<string, GuidanceKanbanSummary>;
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
