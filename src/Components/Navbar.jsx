import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css"; // Import styles from external CSS file

export function Navbar() {
  // React hook to manage the state of the menu (open/closed)
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* "Hamburger" button (☰) for mobile screens */}
        <button
          onClick={() => setIsOpen(!isOpen)} // Toggles the menu when clicked
          className="menu-btn"
        >
          ☰
        </button>
      </div>

      {/* Navigation menu */}
      {/* 
        - The class "menu" always applies 
        - If isOpen is true, we also add the class "open" (this makes it visible on mobile)
      */}
      <ul className={`menu ${isOpen ? "open" : ""}`}>
        <li>
          {/* NavLink works like Link but also adds "active" class automatically when the route matches */}
          <NavLink to="/" className="menu-link">
            Set Shift
          </NavLink>
        </li>
        <li>
          <NavLink to="/Page1" className="menu-link">
            Review and Send
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
