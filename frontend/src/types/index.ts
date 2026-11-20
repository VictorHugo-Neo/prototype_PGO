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
  phone?: string;
  type: UserType;
  avatar_path?: string;
  created_at?: string;
}

export interface TaskCreator {
  id: number;
  name: string;
  email: string;
  phone?: string;
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
  creator_role?: 'advisor' | 'coadvisor' | 'student';
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
  user_role?: 'advisor' | 'coadvisor' | 'student';
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
  creator_id?: number | null;
  creator?: TaskCreator | null;
  creator_role?: 'advisor' | 'coadvisor' | 'student';
}

export interface MeetingUpdatePayload {
  date?: string;
  topic?: string;
  status?: MeetingStatus;
}

export type NotificationChannel = 'platform' | 'whatsapp' | 'both';

export type NotificationTargetType = 'individual' | 'all';

export interface NotificationSendPayload {
  target_type: NotificationTargetType;
  student_id?: number;
  channel: NotificationChannel;
  title?: string;
  message: string;
}

export interface RecipientDispatchResult {
  student_id: number;
  student_name: string;
  student_phone?: string | null;
  platform_success: boolean;
  whatsapp_success: boolean;
  whatsapp_skipped_no_phone: boolean;
  whatsapp_error?: string | null;
}

export interface NotificationSendSummary {
  total_targeted: number;
  platform_count: number;
  whatsapp_count: number;
  whatsapp_skipped_no_phone_count: number;
  whatsapp_failed_count: number;
  results: RecipientDispatchResult[];
}

export interface Notification {
  id: number;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
  sender_id?: number;
  sender_name?: string;
  title?: string;
  channel?: string;
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
  advisor_id?: number;
  coadvisor_id?: number | null;
  student_id?: number;
  user_role?: 'advisor' | 'coadvisor' | 'student';
  student: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar_path?: string;
  };
  advisor?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    avatar_path?: string;
  };
  coadvisor?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    avatar_path?: string;
  } | null;
}

export interface WhatsAppStatusResponse {
  online: boolean;
  service_url?: string;
  api_url?: string;
  instance_id?: string;
  provider?: string;
}

export interface NotifyDeadlinesResponse {
  tasks_analyzed: number;
  whatsapp_dispatched: number;
  skipped_no_phone: number;
  failed_dispatched?: number;
  service_online: boolean;
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
  phone?: string;
}
