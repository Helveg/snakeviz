import React from 'react';
import ReactDOM from 'react-dom/client';
import './snakeviz.css'

const App = () => {
  return <h1>Hello, React with ESBuild in a Python package!</h1>;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);