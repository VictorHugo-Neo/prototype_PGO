import type { NotificationChannel, NotificationTargetType, StudentGuidance, NotificationSendSummary } from '../../types';

export interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  guidances: StudentGuidance[];
  initialStudentId?: number;
  initialTargetType?: NotificationTargetType;
  onSuccess?: (summary: NotificationSendSummary) => void;
}

export interface RecipientOption {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar_path?: string | null;
  theme?: string;
  hasPhone: boolean;
}
