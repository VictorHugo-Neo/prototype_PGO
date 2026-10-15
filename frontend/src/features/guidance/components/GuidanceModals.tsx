import type { Task, Comment, Attachment, Meeting, TaskStatus } from '../../../types';
import { TaskDetailsModal } from './TaskDetailsModal';
import { CreateTaskModal } from './CreateTaskModal';
import { MeetingsModal } from './MeetingsModal';
import { CropPhotoModal } from './CropPhotoModal';

interface GuidanceModalsProps {
  selectedTask: Task | null;
  taskComments: Comment[];
  taskAttachments: Attachment[];
  isCreateModalOpen: boolean;
  isMeetingModalOpen: boolean;
  meetings: Meeting[];
  isAdvisor: boolean;
  imageSrc: string | null;
  isCropModalOpen: boolean;
  onCloseTaskDetails: () => void;
  onUpdateTaskStatus: (taskId: number, status: TaskStatus) => Promise<void>;
  onAddComment: (taskId: number, content: string) => Promise<void>;
  onUploadAttachment: (taskId: number, file: File) => Promise<void>;
  onCloseCreateTask: () => void;
  onCreateTask: (data: { title: string; description: string; time_estimate?: string }) => Promise<void>;
  onCloseMeetings: () => void;
  onRequestMeeting: (date: string, topic: string) => Promise<void>;
  onUpdateMeetingStatus: (meetingId: number, status: 'confirmed' | 'rejected') => Promise<void>;
  onCloseCrop: () => void;
  onSaveCrop: (croppedBlob: Blob) => Promise<void>;
}

export function GuidanceModals({
  selectedTask,
  taskComments,
  taskAttachments,
  isCreateModalOpen,
  isMeetingModalOpen,
  meetings,
  isAdvisor,
  imageSrc,
  isCropModalOpen,
  onCloseTaskDetails,
  onUpdateTaskStatus,
  onAddComment,
  onUploadAttachment,
  onCloseCreateTask,
  onCreateTask,
  onCloseMeetings,
  onRequestMeeting,
  onUpdateMeetingStatus,
  onCloseCrop,
  onSaveCrop,
}: GuidanceModalsProps) {
  return (
    <>
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          comments={taskComments}
          attachments={taskAttachments}
          onClose={onCloseTaskDetails}
          onUpdateStatus={onUpdateTaskStatus}
          onAddComment={onAddComment}
          onUploadAttachment={onUploadAttachment}
        />
      )}

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={onCloseCreateTask}
        onCreate={onCreateTask}
      />

      <MeetingsModal
        isOpen={isMeetingModalOpen}
        onClose={onCloseMeetings}
        meetings={meetings}
        isAdvisor={isAdvisor}
        onRequestMeeting={onRequestMeeting}
        onUpdateStatus={onUpdateMeetingStatus}
      />

      <CropPhotoModal
        imageSrc={imageSrc}
        isOpen={isCropModalOpen}
        onClose={onCloseCrop}
        onSaveCrop={onSaveCrop}
      />
    </>
  );
}
