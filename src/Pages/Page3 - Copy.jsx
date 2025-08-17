import React, { useEffect, useState } from "react";

import Backendless from "backendless";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { Input } from "../Components/Input/Input";

export function Page3() {
  const APP_ID = "F405D13E-0A77-400C-ACBE-8146E8285936";
  const API_KEY = "BC70880E-34E2-4992-AB6C-C87592ED3A5B";

  Backendless.initApp(APP_ID, API_KEY);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Backendless.Data.of("Lista")
      .find()
      .then((results) => {
        const formatted = results
          .sort((a, b) => a.Orden - b.Orden)
          .map((item) => ({
            id: item.objectId,
            title: item.Item || "Sin título",
          }));
        setTasks(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err.message);
        setError("Error al obtener datos: " + err.message);
        setLoading(false);
      });
  }, []);

  const addTask = async (title) => {
    try {
      const newItem = {
        Item: title,
        Valor: "",
        Orden: tasks.length,
      };

      const saved = await Backendless.Data.of("Lista").save(newItem);

      setTasks((tasks) => [
        ...tasks,
        {
          id: saved.objectId,
          title: saved.Item,
        },
      ]);
    } catch (err) {
      console.error("Error al guardar en Backendless:", err.message);
      alert("No se pudo guardar el nuevo ítem.");
    }
  };

  const deleteTask = async (id) => {
    try {
      await Backendless.Data.of("Lista").remove(id);
      setTasks((tasks) => tasks.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Error al eliminar el ítem:", err.message);
      alert("No se pudo eliminar el ítem.");
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getTaskPos = (id) => tasks.findIndex((task) => task.id === id);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const originalPos = getTaskPos(active.id);
    const newPos = getTaskPos(over.id);

    const reorderedTasks = arrayMove(tasks, originalPos, newPos);
    setTasks(reorderedTasks);

    try {
      const updates = reorderedTasks.map((task, index) => {
        return Backendless.Data.of("Lista").save({
          objectId: task.id,
          Orden: index,
        });
      });

      await Promise.all(updates);
    } catch (err) {
      console.error("Error actualizando orden en Backendless:", err.message);
      alert("Hubo un problema al guardar el nuevo orden.");
    }
  };

  function SortableItem({ id, title, onDelete }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      background: "#f2f2f3",
      padding: "10px 15px",
      borderRadius: "5px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      color: "blue",
      marginBottom: "10px",
    };

    const handleDeleteClick = (e) => {
      e.stopPropagation();
      onDelete(id);
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }} {...listeners}>
          <span style={{ cursor: "grab" }}>☰</span>
          <span>{title}</span>
        </div>
        <button
          onClick={handleDeleteClick}
          style={{
            background: "none",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
            color: "red",
          }}
          title="Eliminar"
        >
          🗑️
        </button>
      </div>
    );
  }

  return (
    <div>
      <h4>Lista Drag & Drop con Backendless</h4>

      {loading && (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <div className="spinner"></div>
          <p>Cargando datos...</p>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <Input onSubmit={addTask} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableItem
              key={task.id}
              id={task.id}
              title={task.title}
              onDelete={deleteTask}
            />
          ))}
        </SortableContext>
      </DndContext>

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
