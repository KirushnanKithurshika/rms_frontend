import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { ToastContainer } from "react-toastify";

// Offline mode: stub global fetch to avoid backend calls
try {
  const w = window as any;
  if (!w.__offlineFetchPatched) {
    w.__offlineFetchPatched = true;
    w.fetch = async (_input: any, _init?: any) => {
      const body = JSON.stringify({ status: "success", data: [] });
      return new Response(body, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };
  }
} catch {}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
