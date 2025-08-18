import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./SortableItem.css";

export function SortableItem({ id, title, valor, onDelete, incrementValor, decrementValor, baseHeight = 35, overlay = false }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
    background: overlay ? "#e0e0e0" : "#f2f2f3",
    height: `${baseHeight * valor}px`, // height depends on hours
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(id);
  };

  return (
    <div ref={setNodeRef} style={style} className="task" {...attributes}>
      {/* Left side: drag handle + employee name */}
      <div className="task-left" {...listeners}>
        <span className="drag-handle">⋮⋮</span>
        <span className="task-title">{title}</span>
      </div>

      {/* Right side: controls (+, -, hours, delete) */}
      <div className="task-controls">
        <button onClick={() => decrementValor(id)} className="task-btn">-</button>
        <span className="task-hours">{valor}h</span>
        <button onClick={() => incrementValor(id)} className="task-btn">+</button>
        {onDelete && (
          <button
            onClick={handleDeleteClick}
            className="task-btn delete-btn"
            title="Delete"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}
