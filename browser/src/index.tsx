import ReactDOM from 'react-dom/client';
import './snakeviz.css'

import React, { useEffect, useState } from "react";
import {SnakevizData} from "./snakeviz";
import {FlameGraph} from "./graphs/FlameGraph/FlameGraph";
import {buildHierarchy} from "./call-nodes";

function App() {
  const [data, setData] = useState<SnakevizData | null>(null);

  useEffect(() => {
    if (window.snakeviz) {
      setData(window.snakeviz);
    }
  }, []);

  if (!data) return <div>Loading SnakeViz data...</div>;

  const callNodes = buildHierarchy(data);

  return (
    <div className="app-container">
      <aside className="sidebar">

      </aside>

      <main className="main-view">
        <div id="container">
          <FlameGraph data={data}/>
        </div>
      </main>

      <footer className="footer">
        <button onClick={() => window.location.reload()}>Reset</button>
      </footer>
    </div>
  );
}

const rootElement = document.getElementById('root');

if (!rootElement) {
    alert('Document is missing root element. Try reopening the profile.')
}

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);