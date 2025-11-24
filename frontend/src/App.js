import { useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [helloMessage, setHelloMessage] = useState('');

  const fetchHello = async () => {
    try {
      const response = await fetch('http://localhost:3000/hello');
      const text = await response.text();
      setHelloMessage(text);
    } catch (error) {
      console.error('Error fetching hello:', error);
      setHelloMessage('Error fetching message');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <button onClick={fetchHello} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          Get Hello
        </button>
        {helloMessage && <p style={{ marginTop: '20px', fontSize: '24px' }}>{helloMessage}</p>}
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
