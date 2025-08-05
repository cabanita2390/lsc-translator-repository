import { Link } from 'react-router-dom';

function App() {
  return (
    <>
      <div className="container">
        <h1 className="title">Plataforma LSC - Inicio</h1>
        <nav className="nav-links">
          <Link to="/capture" className="btn blue">
            Ir a Captura de Video
          </Link>
          <Link to="/image-test" className="btn green">
            Prueba de Imágenes Estáticas
          </Link>
        </nav>
      </div>

      <style>{`
        /* Reset básico */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f0f2f5;
        }

        .container {
          max-width: 500px;
          margin: 80px auto;
          padding: 40px;
          background-color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          text-align: center;
        }

        .title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 30px;
          color: #1f2937;
        }

        .nav-links {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .btn {
          display: inline-block;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 16px;
          font-weight: 600;
          transition: background-color 0.3s, transform 0.2s;
        }

        .btn.blue {
          background-color: #3b82f6;
          color: white;
        }

        .btn.blue:hover {
          background-color: #2563eb;
          transform: translateY(-2px);
        }

        .btn.green {
          background-color: #10b981;
          color: white;
        }

        .btn.green:hover {
          background-color: #059669;
          transform: translateY(-2px);
        }
      `}</style>
    </>
  );
}

export default App;
