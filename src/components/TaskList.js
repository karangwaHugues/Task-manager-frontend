import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import TaskItem from './TaskItem';
import '../App.css';

const TaskList = ({ tasks, onToggle, onDelete, onEdit }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isOverdue = useCallback((dueDate) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    return due < now && !isSameDay(due, now);
  }, []);

  // Helper function to check if task is completed (handles different property names)
  const isCompleted = useCallback((task) => {
    if (!task) return false;
    return task.completed || task.isCompleted || task.status === 'completed' || task.status === 'done';
  }, []);

  const filteredTasks = useMemo(() => {
    // Add debugging with better error handling
    console.log('Tasks received:', tasks);
    console.log('Tasks length:', tasks?.length);
    
    if (!Array.isArray(tasks)) {
      console.warn('Tasks is not an array:', tasks);
      return [];
    }

    return tasks.filter(task => {
      if (!task) return false;
      
      const completed = isCompleted(task);
      
      switch (filter) {
        case 'active': return !completed;
        case 'completed': return completed;
        case 'overdue': return isOverdue(task.dueDate || task.due_date) && !completed;
        case 'high':
        case 'medium':
        case 'low': return (task.priority || '').toLowerCase() === filter;
        default: return true;
      }
    });
  }, [tasks, filter, isOverdue, isCompleted]);

  const sortedTasks = useMemo(() => {
    if (!Array.isArray(filteredTasks)) return [];
    
    return [...filteredTasks].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const levels = { high: 3, medium: 2, low: 1 };
          const aPriority = (a.priority || '').toLowerCase();
          const bPriority = (b.priority || '').toLowerCase();
          return (levels[bPriority] || 0) - (levels[aPriority] || 0);
        case 'dueDate':
          const aDate = a.dueDate || a.due_date || 0;
          const bDate = b.dueDate || b.due_date || 0;
          return new Date(aDate) - new Date(bDate);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'status':
          const aCompleted = isCompleted(a);
          const bCompleted = isCompleted(b);
          return aCompleted === bCompleted ? 0 : aCompleted ? 1 : -1;
        default:
          const aCreated = a.createdAt || a.created_at || a.dateCreated || 0;
          const bCreated = b.createdAt || b.created_at || b.dateCreated || 0;
          return new Date(bCreated) - new Date(aCreated);
      }
    });
  }, [filteredTasks, sortBy, isCompleted]);

  const stats = useMemo(() => {
    if (!Array.isArray(tasks)) return { total: 0, completed: 0, active: 0, overdue: 0, highPriority: 0 };
    
    const total = tasks.length;
    const completed = tasks.filter(t => isCompleted(t)).length;
    const active = total - completed;
    const overdue = tasks.filter(t => isOverdue(t.dueDate || t.due_date) && !isCompleted(t)).length;
    const highPriority = tasks.filter(t => 
      (t.priority || '').toLowerCase() === 'high' && !isCompleted(t)
    ).length;
    return { total, completed, active, overdue, highPriority };
  }, [tasks, isOverdue, isCompleted]);

  // Debug logging with better formatting
  console.log('Filtered tasks:', filteredTasks);
  console.log('Stats:', stats);

  // Handle loading state better
  const isLoading = !Array.isArray(tasks) || (tasks.length === 0 && !tasks.hasOwnProperty('length'));

  return (
    <div className="tasks-container">
      <header className="tasklist-header">
        <h2 className="tasklist-title">
          📋 My Tasks{' '}
          {stats.total > 0 && (
            <small className="tasklist-count">
              ({filteredTasks.length} {filter !== 'all' ? `${filter} ` : ''}of {stats.total})
            </small>
          )}
        </h2>

        <div className="tasklist-stats">
          <div>✅ {stats.completed} Completed</div>
          <div>⏳ {stats.active} Active</div>
          {stats.overdue > 0 && <div>⚠️ {stats.overdue} Overdue</div>}
          {stats.highPriority > 0 && <div>🔥 {stats.highPriority} High Priority</div>}
        </div>

        {stats.total > 0 && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(stats.completed / stats.total) * 100}%` }}
            />
          </div>
        )}
      </header>

      <div className="tasklist-controls">
        <div className="tasklist-filters">
          {[
            { key: 'all', icon: '📋' },
            { key: 'active', icon: '⏳' },
            { key: 'completed', icon: '✅' },
            { key: 'overdue', icon: '⚠️' },
          ].map(({ key, icon }) => (
            <button
              key={key}
              className={`filter-btn ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {icon} {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}

          <div className="filter-divider" />

          {['high', 'medium', 'low'].map(p => (
            <button
              key={p}
              className={`filter-btn priority-btn ${filter === p ? 'active' : ''} ${p}`}
              onClick={() => setFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="created">Sort by Created</option>
          <option value="priority">Sort by Priority</option>
          <option value="dueDate">Sort by Due Date</option>
          <option value="title">Sort by Title</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>

      <div className="task-list">
        {isLoading ? (
          <p className="no-tasks">Loading tasks...</p>
        ) : sortedTasks.length === 0 ? (
          <p className="no-tasks">
            {filter === 'all'
              ? tasks?.length === 0 
                ? 'No tasks yet. Create your first task!' 
                : 'No tasks found.'
              : filter === 'completed'
              ? 'No completed tasks.'
              : `No ${filter} tasks found.`}
          </p>
        ) : (
          sortedTasks.map(task => (
            <TaskItem
              key={task.id || task._id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
};

TaskList.propTypes = {
  tasks: PropTypes.array.isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default TaskList;