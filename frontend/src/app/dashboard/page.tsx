'use client';

import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { taskApi, Task, TaskFilters, TaskStatus, TaskPriority } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import FilterBar from '@/components/FilterBar';
import Pagination from '@/components/Pagination';
import SkeletonCard from '@/components/SkeletonCard';

export default function DashboardPage() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState({
    page: 1, limit: 9, total: 0, totalPages: 1, hasNext: false, hasPrev: false,
  });
  const [filters, setFilters] = useState<TaskFilters>({
    page: 1, limit: 9, status: '', priority: '', search: '', sortBy: 'createdAt', sortOrder: 'desc',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await taskApi.getAll(filters);
      setTasks(res.data);
      setPagination(res.pagination);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleFilterChange = (newFilters: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleToggle = async (task: Task) => {
    try {
      const res = await taskApi.toggle(task.id);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data : t)));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleSave = async (data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
  }) => {
    try {
      if (editingTask) {
        const res = await taskApi.update(editingTask.id, data);
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? res.data : t)));
        toast.success('Task updated');
      } else {
        await taskApi.create(data);
        toast.success('Task created');
        await fetchTasks();
      }
      setShowModal(false);
      setEditingTask(null);
    } catch {
      toast.error(editingTask ? 'Failed to update task' : 'Failed to create task');
    }
  };

  const handleDelete = async () => {
    if (!deletingTask) return;
    try {
      await taskApi.delete(deletingTask.id);
      setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
      toast.success('Task deleted');
      setDeletingTask(null);
      if (tasks.length === 1 && pagination.page > 1) {
        setFilters((prev) => ({ ...prev, page: prev.page! - 1 }));
      }
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const openCreate = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const statusCounts = {
    all: pagination.total,
    PENDING: tasks.filter((t) => t.status === 'PENDING').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    COMPLETED: tasks.filter((t) => t.status === 'COMPLETED').length,
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-cream/90 backdrop-blur border-b border-ink-100 px-6 lg:px-10 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-ink">
              Good day, <span className="italic text-clay">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="font-mono text-xs text-ink-400 mt-0.5 uppercase tracking-wider">
              {pagination.total} task{pagination.total !== 1 ? 's' : ''} in total
            </p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <span className="text-lg leading-none">+</span>
            New Task
          </button>
        </div>
      </header>

      <div className="px-6 lg:px-10 py-8">
        {/* Status summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'All Tasks', value: statusCounts.all, color: 'bg-ink text-cream' },
            { label: 'Pending', value: statusCounts.PENDING, color: 'bg-amber-task/20 text-ink border border-amber-task/30' },
            { label: 'In Progress', value: statusCounts.IN_PROGRESS, color: 'bg-sage/20 text-sage-dark border border-sage/30' },
            { label: 'Completed', value: statusCounts.COMPLETED, color: 'bg-ink-100 text-ink-500 border border-ink-200' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${color} px-4 py-3 flex items-center justify-between`}>
              <span className="font-mono text-xs uppercase tracking-widest">{label}</span>
              <span className="font-display text-xl">{isLoading ? '—' : value}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <FilterBar filters={filters} onChange={handleFilterChange} />

        {/* Task grid */}
        <div className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 border-2 border-dashed border-ink-200 flex items-center justify-center mb-6">
                <span className="text-2xl text-ink-300">✓</span>
              </div>
              <h3 className="font-display text-xl text-ink mb-2">
                {filters.search || filters.status ? 'No matching tasks' : 'No tasks yet'}
              </h3>
              <p className="font-body text-sm text-ink-400 mb-6 max-w-xs">
                {filters.search || filters.status
                  ? 'Try adjusting your filters'
                  : 'Create your first task to get started'}
              </p>
              {!filters.search && !filters.status && (
                <button onClick={openCreate} className="btn-secondary">
                  Create a task
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-stagger">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => openEdit(task)}
                  onDelete={() => setDeletingTask(task)}
                  onToggle={() => handleToggle(task)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              hasNext={pagination.hasNext}
              hasPrev={pagination.hasPrev}
              onChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <TaskModal
          task={editingTask}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
        />
      )}
      {deletingTask && (
        <DeleteConfirmModal
          task={deletingTask}
          onConfirm={handleDelete}
          onClose={() => setDeletingTask(null)}
        />
      )}
    </div>
  );
}
