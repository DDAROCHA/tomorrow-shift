import "./Page2.css";

export function Page2() {
  return (
    <div className="page2-container">
      <h4>About This App</h4>

      <div className="page2-block">
        <p>
          <strong>Developed by:</strong> Diego Da Rocha — 2025 🛠️
        </p>

        <h5>Instructions 📋</h5>
        <p>
          • In the <strong>"Set Shift"</strong> tab, add employees using the{" "}
          <em>Add Employee</em> button.  
          • Adjust working hours with the <strong>+</strong> and{" "}
          <strong>-</strong> buttons.  
          • Reorder employees via <em>Drag & Drop</em> by grabbing the handle{" "}
          <span style={{ fontFamily: "monospace" }}>⋮⋮</span>.  
          • Remove an employee with the 🗑️ button.
        </p>
        <p>
          • In the <strong>"Review and Send"</strong> tab, review the assigned
          shifts, provide an <em>email address</em>, and submit using{" "}
          <em>Send</em> for manager approval ✉️.
        </p>

        <h5>Technology Stack 💻</h5>
        <p>
          This demo app was built with <strong>React</strong>,{" "}
          <strong>dnd-kit</strong> (for drag-and-drop),{" "}
          <strong>Backendless</strong> (as the backend service),{" "}
          <strong>Flowrunner</strong>, and other modern JavaScript tools.
        </p>

        <h5>Notes ℹ️</h5>
        <p>
          This is a free-access showcase application designed for demonstration
          and learning purposes. It is not intended for production environments.
        </p>
        <p>
          Feedback and suggestions are always welcome 🙌 — the goal is to make
          shift planning more intuitive and efficient.
        </p>
      </div>

      <footer className="page2-footer">
        © 2025 Diego Da Rocha — Demo App
      </footer>
    </div>
  );
}
