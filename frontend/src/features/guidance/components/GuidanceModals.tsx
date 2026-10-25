import type {
  Task,
  Comment,
  Attachment,
  Meeting,
  MeetingUpdatePayload,
  TaskStatus,
  TaskUpdatePayload,
  KanbanColumn,
} from '../../../types';
import { TaskDetailsModal } from './TaskDetailsModal';
import { CreateTaskModal } from './CreateTaskModal';
import { MeetingsModal } from './MeetingsModal';
import { CropPhotoModal } from './CropPhotoModal';
import { DefenseDateModal } from './DefenseDateModal';

interface GuidanceModalsProps {
  selectedTask: Task | null;
  taskComments: Comment[];
  taskAttachments: Attachment[];
  columns?: KanbanColumn[];
  isCreateModalOpen: boolean;
  createTaskStatus?: TaskStatus;
  isMeetingModalOpen: boolean;
  meetings: Meeting[];
  isAdvisor: boolean;
  imageSrc: string | null;
  isCropModalOpen: boolean;
  isDefenseModalOpen?: boolean;
  guidanceDefenseDate?: string | null;
  studentName?: string;
  guidanceTheme?: string;
  onCloseTaskDetails: () => void;
  onUpdateTaskStatus: (taskId: number, status: TaskStatus) => Promise<void>;
  onUpdateTask: (taskId: number, data: TaskUpdatePayload) => Promise<Task>;
  onDeleteTask: (taskId: number) => Promise<void>;
  onAddComment: (taskId: number, content: string) => Promise<void>;
  onUploadAttachment: (taskId: number, file: File) => Promise<void>;
  onCloseCreateTask: () => void;
  onCreateTask: (data: {
    title: string;
    description: string;
    time_estimate?: string;
    status?: TaskStatus;
  }) => Promise<void>;
  onCloseMeetings: () => void;
  onRequestMeeting: (date: string, topic: string) => Promise<void>;
  onUpdateMeetingStatus: (meetingId: number, status: 'confirmed' | 'rejected') => Promise<void>;
  onUpdateMeeting: (meetingId: number, data: MeetingUpdatePayload) => Promise<Meeting | void>;
  onDeleteMeeting: (meetingId: number) => Promise<void>;
  onCloseCrop: () => void;
  onSaveCrop: (croppedBlob: Blob) => Promise<void>;
  onCloseDefenseModal?: () => void;
  onSaveDefenseDate?: (dateIso: string) => Promise<void>;
  onDeleteDefenseDate?: () => Promise<void>;
}

export function GuidanceModals({
  selectedTask,
  taskComments,
  taskAttachments,
  columns,
  isCreateModalOpen,
  createTaskStatus,
  isMeetingModalOpen,
  meetings,
  isAdvisor,
  imageSrc,
  isCropModalOpen,
  onCloseTaskDetails,
  onUpdateTaskStatus,
  onUpdateTask,
  onDeleteTask,
  onAddComment,
  onUploadAttachment,
  onCloseCreateTask,
  onCreateTask,
  onCloseMeetings,
  onRequestMeeting,
  onUpdateMeetingStatus,
  onUpdateMeeting,
  onDeleteMeeting,
  onCloseCrop,
  onSaveCrop,
  isDefenseModalOpen,
  guidanceDefenseDate,
  studentName,
  guidanceTheme,
  onCloseDefenseModal,
  onSaveDefenseDate,
  onDeleteDefenseDate,
}: GuidanceModalsProps) {
  return (
    <>
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          comments={taskComments}
          attachments={taskAttachments}
          columns={columns}
          onClose={onCloseTaskDetails}
          onUpdateStatus={onUpdateTaskStatus}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onAddComment={onAddComment}
          onUploadAttachment={onUploadAttachment}
        />
      )}

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        initialStatus={createTaskStatus}
        columns={columns}
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
        onUpdateMeeting={onUpdateMeeting}
        onDeleteMeeting={onDeleteMeeting}
      />

      <CropPhotoModal
        imageSrc={imageSrc}
        isOpen={isCropModalOpen}
        onClose={onCloseCrop}
        onSaveCrop={onSaveCrop}
      />

      {isDefenseModalOpen && onCloseDefenseModal && onSaveDefenseDate && onDeleteDefenseDate && (
        <DefenseDateModal
          isOpen={isDefenseModalOpen}
          onClose={onCloseDefenseModal}
          currentDate={guidanceDefenseDate}
          studentName={studentName || ''}
          theme={guidanceTheme || ''}
          onSave={onSaveDefenseDate}
          onDelete={onDeleteDefenseDate}
        />
      )}
    </>
  );
}
