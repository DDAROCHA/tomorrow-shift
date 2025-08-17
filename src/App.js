
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './Pages/Home';
import { Page1 } from './Pages/Page1';
import { Page2 } from './Pages/Page2';
import { Page3 } from './Pages/Page3';
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
              <Route path="/Page2" element={<Page2/>} />
              <Route path="/Page3" element={<Page3/>} />
            </Route>
          </Routes>
        </Router>




      </header>
    </div>
  );
}

export default App;
