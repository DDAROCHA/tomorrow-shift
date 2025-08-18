import React, { useEffect, useState } from "react";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { Input } from "../Components/Input/Input";
import { Spinner } from "../Components/Spinner/Spinner";
import { Timeline } from "../Components/Timeline/Timeline";
import { SortableItem } from "../Components/SortableItem/SortableItem";

import { getTasks, saveTask, deleteTask } from "../services/backend";

import './Home.css';

export function Home() {
  // ---------------------------
  // Local state
  // ---------------------------
  const [tasks, setTasks] = useState([]);       // List of employees (tasks)
  const [loading, setLoading] = useState(true); // Loading flag
  const [error, setError] = useState(null);     // Error message
  const [activeId, setActiveId] = useState(null); // Active item during drag

  const baseHeight = 35; // Height equivalent to 1 hour in the timeline

  // ---------------------------
  // Load data from Backendless
  // ---------------------------
  useEffect(() => {
    getTasks()
      .then((results) => {
        const formatted = results
          .sort((a, b) => a.Orden - b.Orden)
          .map((item) => ({
            id: item.objectId,
            title: item.Item || "Untitled",
            valor: item.Valor != null ? Number(item.Valor) : 1,
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
  // Add new employee (task)
  // ---------------------------
  const addTask = async (title) => {
    try {
      const newItem = { Item: title, Valor: 1, Orden: tasks.length };
      const saved = await saveTask(newItem);
      setTasks((tasks) => [
        ...tasks,
        { id: saved.objectId, title: saved.Item, valor: 1 },
      ]);
    } catch (err) {
      console.error("Error saving item:", err.message);
      alert("Could not save the new employee.");
    }
  };

  // ---------------------------
  // Delete employee (task)
  // ---------------------------
  const deleteTaskById = async (id) => {
    try {
      await deleteTask(id);
      setTasks((tasks) => tasks.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Error deleting item:", err.message);
      alert("Could not delete the employee.");
    }
  };

  // ---------------------------
  // Update working hours (valor)
  // ---------------------------
  const updateValor = async (id, newValor) => {
    // Update state immediately
    setTasks((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, valor: newValor } : task))
    );
    // Save to backend
    try {
      await saveTask({ objectId: id, Valor: newValor });
    } catch (err) {
      console.error("Error updating value:", err.message);
    }
  };

  // Increase working hours (max 8)
  const incrementValor = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newValor = Math.min(task.valor + 1, 8);
    updateValor(id, newValor);
  };

  // Decrease working hours (min 1)
  const decrementValor = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newValor = Math.max(task.valor - 1, 1);
    updateValor(id, newValor);
  };

  // ---------------------------
  // Drag & Drop configuration
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

    // Reorder tasks in state
    const originalPos = getTaskPos(active.id);
    const newPos = getTaskPos(over.id);

    const reorderedTasks = [...tasks];
    const [moved] = reorderedTasks.splice(originalPos, 1);
    reorderedTasks.splice(newPos, 0, moved);

    setTasks(reorderedTasks);

    // Save new order to backend
    try {
      await Promise.all(
        reorderedTasks.map((task, index) =>
          saveTask({ objectId: task.id, Orden: index })
        )
      );
    } catch (err) {
      console.error("Error updating order:", err.message);
      alert("There was a problem saving the new order.");
    }
  };

  // ---------------------------
  // Render component
  // ---------------------------
  return (
    <div>
      <h4>Assign Employees for Tomorrow’s Shift</h4>

      {/* Show spinner while loading */}
      {loading && <Spinner text="Loading..." />}

      {/* Show error if something went wrong */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Input to add new employees */}
      <div style={{ marginBottom: "15px" }}>
        <Input
          onSubmit={addTask}
          buttonLabel="Add Employee"   // Configurable button text
        />
      </div>

      {/* Layout: left timeline + right tasks */}
      <div style={{ display: "flex", gap: "0px" }}>
        {/* Left timeline with 24h slots */}
        <Timeline baseHeight={baseHeight} />

        {/* Right: draggable list of employees */}
        <div style={{ flex: 1 }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {tasks.map((task) => (
                <SortableItem
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  valor={task.valor}
                  onDelete={deleteTaskById}
                  incrementValor={incrementValor}
                  decrementValor={decrementValor}
                  baseHeight={baseHeight}
                />
              ))}
            </SortableContext>

            {/* Overlay element shown while dragging */}
            <DragOverlay>
              {activeId ? (
                <SortableItem
                  id={activeId}
                  title={tasks.find((t) => t.id === activeId)?.title}
                  valor={tasks.find((t) => t.id === activeId)?.valor}
                  incrementValor={incrementValor}
                  decrementValor={decrementValor}
                  baseHeight={baseHeight}
                  overlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
