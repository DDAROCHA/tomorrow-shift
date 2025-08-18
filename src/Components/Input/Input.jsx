import { useState } from "react";
import "./Input.css";

export const Input = ({ onSubmit, buttonLabel = "Submit" }) => {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input) return;
    onSubmit(input);
    setInput("");
  };

  return (
    <div className="input-container">
      <input
        className="input"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter employee name..."
      />
      <button onClick={handleSubmit} className="menu-link">
        {buttonLabel}
      </button>
    </div>
  );
};
