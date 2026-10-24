import { useParams } from 'react-router-dom';
import type { TaskStatus } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StudentHeader } from '../features/guidance/components/StudentHeader';
import { KanbanBoard } from '../features/guidance/components/KanbanBoard';
import { GuidanceModals } from '../features/guidance/components/GuidanceModals';
import { useStudentGuidance } from '../features/guidance/hooks/useStudentGuidance';

export default function StudentDetails() {
  const { id } = useParams<{ id: string }>();

  const {
    guidance,
    tasks,
    columns,
    meetings,
    loading,
    myUserId,
    selectedTask,
    taskComments,
    taskAttachments,
    isCreateModalOpen,
    createTaskStatus,
    isMeetingModalOpen,
    imageSrc,
    isCropModalOpen,
    imgError,
    setSelectedTask,
    setIsCreateModalOpen,
    setIsMeetingModalOpen,
    setIsCropModalOpen,
    setImageSrc,
    setImgError,
    handleOpenCreateTask,
    handleTaskClick,
    handleStatusChange,
    handleDragEnd,
    handleAddComment,
    handleUploadAttachment,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleAddColumn,
    handleUpdateColumn,
    handleDeleteColumn,
    handleMoveColumn,
    handleRequestMeeting,
    handleUpdateMeeting,
    handleDeleteMeeting,
    handleUpdateMeetingStatus,
    handleUpdateDefenseDate,
    handleDownloadReport,
    handlePreviewReport,
    isGeneratingPdf,
    handleFileChange,
    handleSaveCrop,
  } = useStudentGuidance(id);

  if (loading) {
    return <LoadingSpinner fullScreen message="Carregando detalhes da orientação..." />;
  }

  if (!guidance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <p className="text-gray-500 font-medium">Orientação não encontrada.</p>
      </div>
    );
  }

  const isAdvisor = Boolean(guidance.advisor && myUserId === guidance.advisor.id);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <StudentHeader
        guidance={guidance}
        myUserId={myUserId}
        meetingsCount={meetings.length}
        imgError={imgError}
        isGeneratingPdf={isGeneratingPdf}
        onImgError={() => setImgError(true)}
        onFileChange={handleFileChange}
        onUpdateDefenseDate={handleUpdateDefenseDate}
        onOpenMeetingsModal={() => setIsMeetingModalOpen(true)}
        onDownloadReport={handleDownloadReport}
        onPreviewReport={handlePreviewReport}
        onOpenCreateTaskModal={() =>
          handleOpenCreateTask(columns && columns.length > 0 ? (columns[0].slug as TaskStatus) : 'pending')
        }
      />

      <KanbanBoard
        tasks={tasks}
        columns={columns}
        isAdvisor={isAdvisor}
        onDragEnd={handleDragEnd}
        onTaskClick={handleTaskClick}
        onOpenCreateTask={handleOpenCreateTask}
        onAddColumn={handleAddColumn}
        onDeleteColumn={handleDeleteColumn}
        onUpdateColumn={handleUpdateColumn}
        onMoveColumn={handleMoveColumn}
      />

      <GuidanceModals
        selectedTask={selectedTask}
        taskComments={taskComments}
        taskAttachments={taskAttachments}
        columns={columns}
        isCreateModalOpen={isCreateModalOpen}
        createTaskStatus={createTaskStatus}
        isMeetingModalOpen={isMeetingModalOpen}
        meetings={meetings}
        isAdvisor={isAdvisor}
        imageSrc={imageSrc}
        isCropModalOpen={isCropModalOpen}
        onCloseTaskDetails={() => setSelectedTask(null)}
        onUpdateTaskStatus={handleStatusChange}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onAddComment={handleAddComment}
        onUploadAttachment={handleUploadAttachment}
        onCloseCreateTask={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateTask}
        onCloseMeetings={() => setIsMeetingModalOpen(false)}
        onRequestMeeting={handleRequestMeeting}
        onUpdateMeetingStatus={handleUpdateMeetingStatus}
        onUpdateMeeting={handleUpdateMeeting}
        onDeleteMeeting={handleDeleteMeeting}
        onCloseCrop={() => {
          setIsCropModalOpen(false);
          setImageSrc(null);
        }}
        onSaveCrop={handleSaveCrop}
      />
    </div>
  );
}