import React, { useEffect, useState } from "react";

import Backendless from 'backendless'

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { Column } from "../Components/Column/Column";
import { Input } from "../Components/Input/Input";

export function Page3() {

    const APP_ID = 'F405D13E-0A77-400C-ACBE-8146E8285936';
    const API_KEY = 'BC70880E-34E2-4992-AB6C-C87592ED3A5B';

    Backendless.initApp(APP_ID, API_KEY);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        Backendless.Data.of("Lista").findFirst()
            .then(result => {
                setData(result);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error:", err.message);
                setError("Error al obtener datos: " + err.message);
                setLoading(false);
            });
    }, []); // Solo se ejecuta 1 vez al montar

    const [tasks, setTasks] = useState([
        { id: "077A33E6-4E58-4B7D-AE9E-86079E0564F1", title: "Add tests to homepage" },
        { id: "077A33E6-4E58-4B7D-AE9E-86079E0564F2", title: "Fix styling in about section" },
        { id: "077A33E6-4E58-4B7D-AE9E-86079E0564F3", title: "Learn how to center a div" },
    ]);

    const addTask = (title) => {
        setTasks((tasks) => [...tasks, { id: tasks.length + 1, title }]);
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const getTaskPos = (id) => tasks.findIndex((task) => task.id === id);

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id === over.id) return;

        setTasks((tasks) => {
        const originalPos = getTaskPos(active.id);
        const newPos = getTaskPos(over.id);

        return arrayMove(tasks, originalPos, newPos);
        });
    };

    return (
        <div>
            <h4>De backendless</h4>


            {loading && (
                <div style={{ textAlign: "center", marginTop: "50px" }}>
                    <div className="spinner"></div>
                    <p>Cargando datos...</p>
                </div>
            )}

            {error && (
                <p style={{ color: "red" }}>{error}</p>
            )}

            {data && (
                <div>
                    <h5>Datos del primer Item:</h5>
                    <ul>

                        <li><b>Item:</b> {data.Item}</li>
                        <li><b>Orden:</b> {data.Orden}</li>
                        <li><b>Valor:</b> {data.Valor}</li>

                    </ul>
                </div>
            )}

            {/* Spinner CSS */}
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


            <Input onSubmit={addTask} />
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
            >
                <Column id="toDo" tasks={tasks} />
            </DndContext>


        </div>
    )
}
