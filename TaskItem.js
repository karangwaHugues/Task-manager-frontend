import React from "react";

const TaskItem = ({ task, onToggle, onDelete }) => {
  return (
    <li className="task-item">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id, !task.completed)}
      />
      <span style={{ textDecoration: task.completed ? "line-through" : "none" }}>
        {task.title}
      </span>
      <button onClick={() => onDelete(task.id)}>🗑️</button>
    </li>
  );
};

export default TaskItem;
