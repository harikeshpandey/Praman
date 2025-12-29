import { BrowserRouter } from "react-router-dom";
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Buffer } from 'buffer';

window.Buffer = Buffer;
//@ts-ignore
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);