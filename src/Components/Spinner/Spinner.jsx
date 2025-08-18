import React from "react";
import "./Spinner.css";

export function Spinner({ text = "Loading..." }) {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>{text}</p>
    </div>
  );
}
