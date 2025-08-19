import React, { useEffect, useState } from "react";
import Backendless from 'backendless'


import "./Page1.css";


export function Page1() {
    const APP_ID = 'F405D13E-0A77-400C-ACBE-8146E8285936';
    const API_KEY = 'BC70880E-34E2-4992-AB6C-C87592ED3A5B';

    Backendless.initApp(APP_ID, API_KEY);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        Backendless.Data.of("Person").findFirst()
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

    return (
        <div className="page1-container">
            <h4>Page1 - Backendless</h4>

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
                    <h5>Datos de la primera persona:</h5>
                    <ul>

                        <li><b>Nombre:</b> {data.name}</li>
                        <li><b>Dirección:</b> {data.address}</li>

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
        </div>
    );
}
