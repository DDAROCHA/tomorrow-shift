import React, { useEffect, useState } from "react";
import { getTasks, saveEnviar } from "../services/backend";
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

  // Convierte hora en formato AM/PM
  const formatHour = (hour) => {
    const h = hour % 24;
    const suffix = h >= 12 ? "pm" : "am";
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${display}${suffix}`;
  };

  // Construye texto de turno
  const buildShiftText = (task, index) => {
    const startHour = baseHour + tasks.slice(0, index).reduce((acc, t) => acc + t.valor, 0);
    const endHour = startHour + task.valor;
    return `${task.title} from ${formatHour(startHour)} to ${formatHour(endHour)}`;
  };

  const handleSend = async () => {
    if (!email) {
      alert("Please enter an email address.");
      return;
    }
    setSending(true);

    const lines = tasks.map((t, i) => buildShiftText(t, i));

    const mensaje = `
      <p>Hi, this is the full rotation for tomorrow's shift:</p>
      <ul>
        ${lines.map((line) => `<li>${line}</li>`).join("")}
      </ul>
      <p>Sincerely,<br/>The manager.</p>
    `;

    try {
      await saveEnviar({ mail: email, mensaje });
      alert("Shift rotation sent for approval");
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
          placeholder="Enter email address..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleSend} disabled={sending} className="send-btn">
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
