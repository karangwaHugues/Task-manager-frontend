import React, { useState, useRef, useEffect } from 'react';

const TaskForm = ({ onAdd, onUpdate, editingTask, onCancelEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const titleRef = useRef();

  // Populate form fields when editingTask changes, or reset when not editing
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority || 'medium');
      setDueDate(editingTask.dueDate || '');
      titleRef.current?.focus();
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Task title is required.');
      return;
    }

    if (dueDate && new Date(dueDate) < new Date().setHours(0, 0, 0, 0)) {
      setError('Due date cannot be in the past.');
      return;
    }

    setLoading(true);

    const taskData = {
      title: trimmedTitle,
      description: description.trim(),
      priority,
      dueDate: dueDate || null,
      completed: editingTask ? editingTask.completed : false,
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
      id: editingTask ? editingTask.id : undefined, // keep id if editing
    };

    try {
      if (editingTask) {
        await onUpdate(taskData);
      } else {
        await onAdd(taskData);
        // Clear form only if adding new task
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
      }
    } catch (err) {
      setError('Failed to save task. Try again.');
      console.error('Task save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formStyles = {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #f1f5f9',
    marginBottom: '2rem',
  };

  const labelStyles = {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '6px',
    display: 'block',
    color: '#374151',
  };

  const inputStyles = {
    width: '100%',
    padding: '12px',
    marginBottom: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#374151',
    outline: 'none',
  };

  const buttonStyles = {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
    marginRight: '1rem',
  };

  return (
    <form onSubmit={handleSubmit} style={formStyles} aria-label="Add or Edit Task Form" noValidate>
      <h2 style={{ marginBottom: '1rem', color: '#1f2937', fontSize: '18px' }}>
        {editingTask ? '✏️ Edit Task' : '📝 Add New Task'}
      </h2>

      {error && (
        <div role="alert" style={{ color: 'red', marginBottom: '12px' }}>
          {error}
        </div>
      )}

      <label htmlFor="title" style={labelStyles}>
        Task Title *
      </label>
      <input
        id="title"
        type="text"
        ref={titleRef}
        placeholder="e.g. Finish the report"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={(e) => setTitle(e.target.value.trim())}
        style={inputStyles}
        disabled={loading}
        required
      />

      <label htmlFor="description" style={labelStyles}>
        Description
      </label>
      <textarea
        id="description"
        placeholder="Optional details about the task"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={(e) => setDescription(e.target.value.trim())}
        style={{ ...inputStyles, minHeight: '80px', resize: 'vertical' }}
        disabled={loading}
      />

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label htmlFor="priority" style={labelStyles}>
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={inputStyles}
            disabled={loading}
          >
            <option value="low">Low 🟢</option>
            <option value="medium">Medium 🟡</option>
            <option value="high">High 🔴</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <label htmlFor="dueDate" style={labelStyles}>
            Due Date
          </label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={inputStyles}
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          style={buttonStyles}
          disabled={loading || !title.trim()}
          aria-label={editingTask ? 'Update task' : 'Add task'}
        >
          {loading ? (editingTask ? 'Updating...' : 'Adding...') : editingTask ? '✏️ Update Task' : '➕ Add Task'}
        </button>

        {editingTask && (
          <button
            type="button"
            onClick={onCancelEdit}
            style={{
              ...buttonStyles,
              backgroundColor: '#ef4444', // red
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            disabled={loading}
            aria-label="Cancel edit"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;
