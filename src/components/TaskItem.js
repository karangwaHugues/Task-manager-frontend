import React from "react";

const priorityColors = {
  low: "#22c55e",    // green
  medium: "#eab308", // yellow
  high: "#ef4444"    // red
};

const TaskItem = ({ task, onToggle, onDelete, onEdit, loading }) => {
  return (
    <li
      className="task-item"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: task.completed ? "#f3f4f6" : "white",
        opacity: loading ? 0.6 : 1,
        cursor: loading ? "not-allowed" : "default"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => !loading && onToggle(task.id, !task.completed)}
          aria-label={task.completed ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as complete`}
          disabled={loading}
        />
        <span
          style={{
            textDecoration: task.completed ? "line-through" : "none",
            color: task.completed ? "#6b7280" : "#111827",
            flexGrow: 1,
            userSelect: "none"
          }}
        >
          {task.title}
        </span>
        <span
          aria-label={`Priority: ${task.priority}`}
          title={`Priority: ${task.priority}`}
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: priorityColors[task.priority] || "#6b7280",
            display: "inline-block"
          }}
        />
      </div>

      {task.dueDate && (
        <small
          style={{
            fontSize: "12px",
            color: task.completed ? "#9ca3af" : "#6b7280",
            marginRight: "1rem",
            whiteSpace: "nowrap"
          }}
        >
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </small>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => !loading && onEdit(task)}
          aria-label={`Edit task: ${task.title}`}
          disabled={loading}
          style={{
            backgroundColor: "transparent",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "18px",
            color: "#3b82f6"
          }}
          title="Edit"
        >
          ✏️
        </button>

        <button
          onClick={() => !loading && onDelete(task.id)}
          aria-label={`Delete task: ${task.title}`}
          disabled={loading}
          style={{
            backgroundColor: "transparent",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "18px",
            color: "#ef4444"
          }}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </li>
  );
};

export default TaskItem;
