import React, { useEffect, useState } from "react";
import Backendless from "backendless";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Input } from "../Components/Input/Input";

// ---------------------------
// Main Home component
// ---------------------------
export function Home() {
  // Backendless configuration
  const APP_ID = "F405D13E-0A77-400C-ACBE-8146E8285936";
  const API_KEY = "BC70880E-34E2-4992-AB6C-C87592ED3A5B";
  Backendless.initApp(APP_ID, API_KEY);

  // State variables
  const [tasks, setTasks] = useState([]);      // List of employees/tasks
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null);     // Error state
  const [activeId, setActiveId] = useState(null); // Currently dragged task

  const baseHeight = 35; // Base height for 1 hour block

  // ---------------------------
  // Load data from Backendless when component mounts
  // ---------------------------
  useEffect(() => {
    Backendless.Data.of("Lista")
      .find()
      .then((results) => {
        const formatted = results
          .sort((a, b) => a.Orden - b.Orden)
          .map((item) => ({
            id: item.objectId,
            title: item.Item || "Untitled",
            valor: item.Valor != null ? Number(item.Valor) : 1, // Hours assigned
          }));
        setTasks(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err.message);
        setError("Error fetching data: " + err.message);
        setLoading(false);
      });
  }, []);

  // ---------------------------
  // Add a new task/employee
  // ---------------------------
  const addTask = async (title) => {
    try {
      const newItem = { Item: title, Valor: 1, Orden: tasks.length };
      const saved = await Backendless.Data.of("Lista").save(newItem);
      setTasks((tasks) => [...tasks, { id: saved.objectId, title: saved.Item, valor: 1 }]);
    } catch (err) {
      console.error("Error saving item:", err.message);
      alert("Could not save the new item.");
    }
  };

  // ---------------------------
  // Delete an existing task/employee
  // ---------------------------
  const deleteTask = async (id) => {
    try {
      await Backendless.Data.of("Lista").remove(id);
      setTasks((tasks) => tasks.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Error deleting item:", err.message);
      alert("Could not delete the item.");
    }
  };

  // ---------------------------
  // Update the number of hours (Valor) in Backendless and state
  // ---------------------------
  const updateValor = async (id, newValor) => {
    setTasks((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, valor: newValor } : task))
    );
    try {
      await Backendless.Data.of("Lista").save({ objectId: id, Valor: newValor });
    } catch (err) {
      console.error("Error updating value:", err.message);
    }
  };

  // Increment/decrement hours with limits (1 to 8)
  const incrementValor = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newValor = Math.min(task.valor + 1, 8);
    updateValor(id, newValor);
  };

  const decrementValor = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newValor = Math.max(task.valor - 1, 1);
    updateValor(id, newValor);
  };

  // ---------------------------
  // Drag and drop setup
  // ---------------------------
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getTaskPos = (id) => tasks.findIndex((task) => task.id === id);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const originalPos = getTaskPos(active.id);
    const newPos = getTaskPos(over.id);

    const reorderedTasks = arrayMove(tasks, originalPos, newPos);
    setTasks(reorderedTasks);

    try {
      // Save new order in Backendless
      const updates = reorderedTasks.map((task, index) =>
        Backendless.Data.of("Lista").save({ objectId: task.id, Orden: index })
      );
      await Promise.all(updates);
    } catch (err) {
      console.error("Error updating order:", err.message);
      alert("There was a problem saving the new order.");
    }
  };

  // ---------------------------
  // SortableItem component (each employee/task)
  // ---------------------------
  function SortableItem({ id, title, valor, onDelete, overlay = false }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: transition,
      background: overlay ? "#e0e0e0" : "#f2f2f3", // Gray when dragged
      padding: "0 15px",
      borderRadius: "5px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      color: "blue",
      marginBottom: "0px",
      height: `${baseHeight * valor}px`, // Height depends on hours
      boxSizing: "border-box",
      outline: "1px dotted black", // Outline for tasks
    };

    const handleDeleteClick = (e) => {
      e.stopPropagation();
      if (onDelete) onDelete(id);
    };

    // Common style for buttons (+, -, 🗑️)
    const buttonStyle = {
      background: "white",
      border: "1px solid #ccc",
      borderRadius: "4px",
      width: "28px",
      height: "28px",
      fontSize: "16px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        {/* Left side: drag handle + employee name */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }} {...listeners}>
          <span style={{ cursor: "grab" }}>⋮⋮</span>
          <span>{title}</span>
        </div>

        {/* Right side: controls (+, -, hours, delete) */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <button onClick={() => decrementValor(id)} style={buttonStyle}>-</button>
          <span style={{ minWidth: "30px", textAlign: "center", color: "black" }}>
            {valor}h
          </span>
          <button onClick={() => incrementValor(id)} style={buttonStyle}>+</button>
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              style={{ ...buttonStyle, color: "red" }}
              title="Delete"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------
  // Main render
  // ---------------------------
  return (
    <div>
      <h4>Assign Employees for Tomorrow’s Shift</h4>

      {/* Loading spinner */}
      {loading && (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      )}

      {/* Error message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Input to add new employees */}
      <div style={{ marginBottom: "15px" }}>
        <Input
          onSubmit={addTask}
          buttonLabel="Add Employee"
          buttonStyle={{ minWidth: "130px" }}
        />
      </div>

      <div style={{ display: "flex", gap: "0px" }}>
        {/* LEFT TIMELINE: 24 hours (6AM - 5AM) */}
        <div style={{ width: "60px", display: "flex", flexDirection: "column" }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const hour = (6 + i) % 24;
            let bgColor = "";
            if (hour >= 6 && hour <= 11) bgColor = "#fff59d"; // light yellow
            else if (hour >= 12 && hour <= 23) bgColor = "#d9a441"; // ochre
            else bgColor = "#f8bbd0"; // light pink

            const ampm = hour < 12 || hour === 24 ? "AM" : "PM";
            const displayHour = hour % 12 === 0 ? 12 : hour % 12;

            return (
              <div
                key={i}
                style={{
                  height: `${baseHeight}px`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottom: "1px solid #ccc",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "black",
                  backgroundColor: bgColor,
                  boxSizing: "border-box",
                }}
              >
                {displayHour}{ampm}
              </div>
            );
          })}
        </div>

        {/* RIGHT SIDE: tasks */}
        <div style={{ flex: 1 }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <SortableItem
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  valor={task.valor}
                  onDelete={deleteTask}
                />
              ))}
            </SortableContext>

            {/* Overlay while dragging */}
            <DragOverlay>
              {activeId ? (
                <SortableItem
                  id={activeId}
                  title={tasks.find((t) => t.id === activeId)?.title}
                  valor={tasks.find((t) => t.id === activeId)?.valor}
                  overlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Loading spinner animation */}
      <style>{`
        .spinner {
          border: 8px solid #f3f3f3;
          border-top: 8px solid #3498db;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
          margin: auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
