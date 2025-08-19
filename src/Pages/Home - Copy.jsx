import React, { useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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

import "./Home.css";

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
    setTasks((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, valor: newValor } : task))
    );
    try {
      await saveTask({ objectId: id, Valor: newValor });
    } catch (err) {
      console.error("Error updating value:", err.message);
    }
  };

  // Increment / Decrement valor (hours)
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
  // DnD-kit sensors configuration
  // ---------------------------
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor), // Enable touch support for mobile
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getTaskPos = (id) => tasks.findIndex((task) => task.id === id);

  // ---------------------------
  // Drag & Drop handlers
  // ---------------------------
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const originalPos = getTaskPos(active.id);
    const newPos = getTaskPos(over.id);

    const reorderedTasks = [...tasks];
    const [moved] = reorderedTasks.splice(originalPos, 1);
    reorderedTasks.splice(newPos, 0, moved);

    setTasks(reorderedTasks);

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
    <div className="home-container">
      <h4>Assign Employees for Tomorrow’s Shift</h4>

      {loading && <Spinner text="Loading..." />}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="home-input">
        <Input onSubmit={addTask} buttonLabel="Add Employee" />
      </div>

      {/* Layout: timeline + task list */}
      <div className="home-layout">
        <Timeline baseHeight={baseHeight} />

        <div className="home-task-list">
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
