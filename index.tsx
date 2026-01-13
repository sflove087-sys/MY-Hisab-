
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<h1 style="padding: 20px; font-family: sans-serif;">Critical Error: #root element not found.</h1>';
  throw new Error("Could not find root element to mount to");
}

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Failed to render React app:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; color: #333;">
      <h1 style="color: #d9534f;">Application Error</h1>
      <p>An unexpected error occurred and the app could not start. Please take a screenshot of this message and send it to the developer.</p>
      <h3 style="margin-top: 20px;">Error Details:</h3>
      <pre style="background: #f7f7f7; border: 1px solid #ddd; padding: 10px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; font-size: 12px;">${error.toString()}</pre>
      <h3 style="margin-top: 20px;">Stack Trace:</h3>
      <pre style="background: #f7f7f7; border: 1px solid #ddd; padding: 10px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; font-size: 12px;">${error.stack}</pre>
    </div>
  `;
}
