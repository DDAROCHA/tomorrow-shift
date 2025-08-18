import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './Pages/Home';
import { Page1 } from './Pages/Page1';
import { Page2 } from './Pages/Page2';
import { Layout } from './Layout';

import './App.css';
import logo from './logo.png';
import { FaGithub } from 'react-icons/fa';

function App() {
  return (
    <div className="App">
      {/* Cabecera responsive con logo, título, subtítulo y GitHub */}
      <header className="App-header">
        {/* Bloque central: logo + título + GitHub */}
        <div className="header-center">
          <img src={logo} alt="Logo" className="header-logo" />
          <div className="header-title-wrapper">
            <h1 className="header-title">TOMORROW SHIFT</h1>
            <a 
              href="https://www.linkedin.com/in/diego-da-rocha" 
              target="_blank" 
              rel="noopener noreferrer"
              className="header-subtitle"
            >
              By DDR
            </a>
          </div>
          <a 
            href="https://github.com/DDAROCHA" 
            target="_blank" 
            rel="noopener noreferrer"
            className="header-github"
          >
            <FaGithub size={24} />
          </a>
        </div>
      </header>

      {/* Contenedor de rutas */}
      <div className="App-content">
        <Router>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/Page1" element={<Page1 />} />
              <Route path="/Page2" element={<Page2 />} />
            </Route>
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
