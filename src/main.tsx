
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import { FirebaseProvider } from "./contexts/FirebaseContext";
  import "./index.css";

  // Add global error handler for debugging
  window.addEventListener('error', (event) => {
    console.error('❌ Global Error:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled Promise Rejection:', event.reason);
  });

  const root = document.getElementById("root");
  if (!root) {
    console.error('❌ Root element not found');
    document.body.innerHTML = '<h1>Error: Root element not found</h1>';
  } else {
    try {
      createRoot(root).render(
        <FirebaseProvider>
          <App />
        </FirebaseProvider>
      );
    } catch (error) {
      console.error('❌ Render Error:', error);
      document.body.innerHTML = '<h1>Error rendering app</h1><pre>' + String(error) + '</pre>';
    }
  }
  