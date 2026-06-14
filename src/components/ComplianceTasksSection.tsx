import React from 'react';
import { CheckSquare } from 'lucide-react';
import { Task } from '../types';
import Heading from './Heading';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

interface Props { tasks: Task[]; taskPage: number; setTaskPage: (p: number) => void; onJoinMeeting: (task: Task) => void; }

export default function ComplianceTasksSection({ tasks, taskPage, setTaskPage, onJoinMeeting }: Props) {
  const pending = tasks.filter(t => !t.completed);
  if (tasks.length === 0) return (
    <div className="animate-content-enter">
      <Heading>Compliance Tasks</Heading>
      <EmptyState icon={CheckSquare} title="No compliance tasks" description="Tasks will appear here automatically when loans require review or verification." />
    </div>
  );
  if (pending.length === 0) return (
    <div className="animate-content-enter">
      <Heading>Compliance Tasks</Heading>
      <EmptyState icon={CheckSquare} title="All tasks completed" description="Nothing requires your attention right now." />
    </div>
  );
  const itemsPerPage = 5;
  const totalPages = Math.ceil(pending.length / itemsPerPage) || 1;
  const paginated = pending.slice((taskPage - 1) * itemsPerPage, taskPage * itemsPerPage);
  return (
    <div className="animate-content-enter">
      <Heading>Compliance Tasks</Heading>
      <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[var(--surface-secondary)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-bold sticky top-0">
              <th className="px-5 py-3.5">Task</th>
              <th className="px-5 py-3.5">Applicant</th>
              <th className="px-5 py-3.5">Regarding</th>
              <th className="px-5 py-3.5">Time</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-primary)]">
            {paginated.map((task) => (
              <tr key={task.id} className="text-[14px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]/70 transition-colors bg-[var(--surface-card)]">
                <td className="px-5 py-3.5">{task.title}</td>
                <td className="px-5 py-3.5 text-[var(--text-secondary)]">{task.applicant}</td>
                <td className="px-5 py-3.5 text-[var(--text-secondary)]">{task.regarding}</td>
                <td className="px-5 py-3.5 text-[var(--text-secondary)]">{task.time}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold" style={{backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)'}}>Pending</span>
                </td>
                <td className="px-5 py-3.5">
                  {task.title.toLowerCase().includes('verification') && (
                    <button onClick={() => onJoinMeeting(task)} className="bg-[var(--sidebar-bg)] hover:brightness-125 text-white text-[12px] font-bold px-4 py-2 rounded-lg transition cursor-pointer">
                      Join Meeting
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={taskPage} totalPages={totalPages} totalItems={pending.length} itemsPerPage={itemsPerPage} onPageChange={setTaskPage} />
      </div>
    </div>
  );
}
