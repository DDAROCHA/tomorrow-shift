import React, { useState } from "react";

export function Home() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <h1>Contador Home: {count}</h1>

            <button onMouseEnter={() => setCount(count + 1)}>
                Incrementar
            </button>

        </div>
    )
}
