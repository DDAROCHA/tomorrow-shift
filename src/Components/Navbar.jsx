import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css"; // Import styles from external CSS file

export function Navbar() {
  // React hook to manage the state of the menu (open/closed)
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      {/* Contenedor principal del navbar */}
      <div className="navbar-container">
        {/* "Hamburger" button (☰) for mobile screens */}
        <button
          onClick={() => setIsOpen(!isOpen)} // Toggle menu
          className="menu-btn"
        >
          ☰
        </button>

        {/* Navigation menu */}
        <ul className={`menu ${isOpen ? "open" : ""}`}>
          <li>
            <NavLink to="/" className="menu-link">
              Set Shift
            </NavLink>
          </li>
          <li>
            <NavLink to="/Page1" className="menu-link">
              Review and Send
            </NavLink>
          </li>
          <li>
            <NavLink to="/Page2" className="menu-link">
              About
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}
