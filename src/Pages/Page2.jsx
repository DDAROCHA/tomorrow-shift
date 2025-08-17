import React, { useState } from "react";

//import { DndContext, closestCorners } from "@dnd-kit/core";

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

export function Page2() {

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
