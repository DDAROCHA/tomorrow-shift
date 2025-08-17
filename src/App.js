
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './Pages/Home';
import { Page1 } from './Pages/Page1';
import { Layout } from './Layout';


import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">

        <h1>
          TOMORROW SHIFT
        </h1>

        <Router>
          <Routes>
            <Route element={<Layout/>}>
              <Route path="/" element={<Home/>} />
              <Route path="/Page1" element={<Page1/>} />
            </Route>
          </Routes>
        </Router>




      </header>
    </div>
  );
}

export default App;
