import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ListarSectores from './pages/ListarSectores';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listar-sectores" element={<ListarSectores />} />
      </Routes>
    </Router>
  );
}

export default App;
