import { Link } from 'react-router-dom';

function App() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Plataforma LSC - Inicio</h1>
      <nav className="flex flex-col gap-2">
        <Link to="/capture" className="text-blue-500 underline">
          Ir a Captura de Video
        </Link>
        <Link to="/image-test" className="text-green-500 underline">
          Prueba de Imágenes Estáticas
        </Link>
      </nav>
    </div>
  );
}

export default App;
