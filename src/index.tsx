import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import "./styles.css";

import { RootLayout } from "./routes/root";
import Overview from "./routes/index";
import Login from "./routes/login";
import PeersPage from "./routes/peers";
import PeerDetail from "./routes/peers.$peerId";
import SessionsPage from "./routes/sessions";
import SessionDetail from "./routes/sessions.$sessionId";
import WorkspacesPage from "./routes/workspaces";
import ComparePage from "./routes/compare";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Overview /> },
      { path: "workspaces", element: <WorkspacesPage /> },
      { path: "peers", element: <PeersPage /> },
      { path: "peers/:peerId", element: <PeerDetail /> },
      { path: "sessions", element: <SessionsPage /> },
      { path: "sessions/:sessionId", element: <SessionDetail /> },
      { path: "compare", element: <ComparePage /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);

const root = document.getElementById("root")!;
createRoot(root).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
