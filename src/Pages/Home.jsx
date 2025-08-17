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

export function Home() {
  const APP_ID = "F405D13E-0A77-400C-ACBE-8146E8285936";
  const API_KEY = "BC70880E-34E2-4992-AB6C-C87592ED3A5B";
  Backendless.initApp(APP_ID, API_KEY);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseHeight = 35; // altura base de 1 hora

  useEffect(() => {
    Backendless.Data.of("Lista")
      .find()
      .then((results) => {
        const formatted = results
          .sort((a, b) => a.Orden - b.Orden)
          .map((item) => ({
            id: item.objectId,
            title: item.Item || "Sin título",
            valor: item.Valor != null ? Number(item.Valor) : 1,
          }));
        setTasks(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener datos:", err.message);
        setError("Error al obtener datos: " + err.message);
        setLoading(false);
      });
  }, []);

  const addTask = async (title) => {
    try {
      const newItem = { Item: title, Valor: 1, Orden: tasks.length };
      const saved = await Backendless.Data.of("Lista").save(newItem);
      setTasks((tasks) => [...tasks, { id: saved.objectId, title: saved.Item, valor: 1 }]);
    } catch (err) {
      console.error("Error al guardar:", err.message);
      alert("No se pudo guardar el nuevo ítem.");
    }
  };

  const deleteTask = async (id) => {
    try {
      await Backendless.Data.of("Lista").remove(id);
      setTasks((tasks) => tasks.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Error al eliminar:", err.message);
      alert("No se pudo eliminar el ítem.");
    }
  };

  const updateValor = async (id, newValor) => {
    setTasks((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, valor: newValor } : task))
    );
    try {
      await Backendless.Data.of("Lista").save({ objectId: id, Valor: newValor });
    } catch (err) {
      console.error("Error actualizando valor:", err.message);
    }
  };

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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
      const updates = reorderedTasks.map((task, index) =>
        Backendless.Data.of("Lista").save({ objectId: task.id, Orden: index })
      );
      await Promise.all(updates);
    } catch (err) {
      console.error("Error actualizando orden:", err.message);
      alert("Hubo un problema al guardar el nuevo orden.");
    }
  };

  function SortableItem({ id, title, valor, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: transition,
      background: "#f2f2f3",
      padding: "0 15px",
      borderRadius: "5px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      color: "blue",
      marginBottom: "0px",
      height: `${baseHeight * valor}px`,
      boxSizing: "border-box",
      outline: "1px dotted black", 
    };

    const handleDeleteClick = (e) => {
      e.stopPropagation();
      onDelete(id);
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }} {...listeners}>
          <span style={{ cursor: "grab" }}>⋮⋮</span> {/* ✅ icono de puntos */}
          <span>{title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <button onClick={() => decrementValor(id)}>-</button>
          <span style={{ minWidth: "25px", textAlign: "center", color: "black" }}>{valor}h</span>
          <button onClick={() => incrementValor(id)}>+</button>
          <button
            onClick={handleDeleteClick}
            style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "red" }}
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4>Assign Employees for Tomorrow’s Shift</h4>

      {loading && (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "15px" }}>
        <Input
          onSubmit={addTask}
          buttonLabel="Add Employee"
          buttonStyle={{ minWidth: "130px" }}
        />
      </div>

      <div style={{ display: "flex", gap: "0px" }}>
        {/* TIMELINE 24HS */}
        <div style={{ width: "60px", display: "flex", flexDirection: "column" }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const hour = (6 + i) % 24;
            let bgColor = "";
            if (hour >= 6 && hour <= 11) bgColor = "#fff59d"; // amarillo claro
            else if (hour >= 12 && hour <= 23) bgColor = "#d9a441"; // ocre
            else bgColor = "#f8bbd0"; // rosa claro

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

        {/* TASKS */}
        <div style={{ flex: 1 }}>
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
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
          </DndContext>
        </div>
      </div>

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
