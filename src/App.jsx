import { Link } from 'react-router-dom';

function App() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Plataforma LSC - Inicio</h1>
      <Link to="/capture" className="text-blue-500 underline">Ir a Captura de Video</Link>
    </div>
  );
}

export default App;
