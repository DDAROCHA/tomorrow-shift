import React, { useEffect, useState } from "react";
import { getTasks, saveEnviar } from "../services/backend"; // usamos saveEnviar
import { Spinner } from "../Components/Spinner/Spinner";
import "./Page1.css";

export function Page1() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const baseHour = 6; // los turnos arrancan a las 6am

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
        setLoading(false);
      });
  }, []);

  // Calcula rangos horarios
  const buildShiftText = (task, index) => {
    const startHour = baseHour + tasks.slice(0, index).reduce((acc, t) => acc + t.valor, 0);
    const endHour = startHour + task.valor;
    return `${task.title} from ${startHour}am to ${endHour}am`;
  };

  const handleSend = async () => {
    if (!email) {
      alert("Please enter an email address.");
      return;
    }
    setSending(true);

    // Texto simple para la lista
    const lines = tasks.map((t, i) => buildShiftText(t, i));

    // Mensaje HTML más prolijo
    const mensaje = `
      <p>Hi, this is the full rotation for tomorrow's shift:</p>
      <ul>
        ${lines.map((line) => `<li>${line}</li>`).join("")}
      </ul>
      <p>Sincerely,<br/>The manager.</p>
    `;

    try {
      await saveEnviar({ mail: email, mensaje });
      alert("Message saved to Backendless.");
      setEmail("");
    } catch (err) {
      console.error("Error saving message:", err.message);
      alert("Could not save the message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page1-container">
      <h4>Tomorrow’s Shift Overview</h4>

      {loading ? (
        <Spinner text="Loading employees..." />
      ) : (
        <div className="page1-block">
          {tasks.map((task, index) => (
            <div key={task.id} className="page1-line">
              {buildShiftText(task, index)}
            </div>
          ))}
        </div>
      )}

      {/* Input email */}
      <div className="page1-input">
        <input
          type="email"
          placeholder="email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleSend} disabled={sending}>
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
