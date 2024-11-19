import { createRoot } from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import Login from './pages/Login';
import React from 'react';
import Register from './pages/Register';
import List from './pages/List';

const router = createMemoryRouter(
  [
    {
      path: '/',
      element: <App />,
    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/register',
      element: <Register />,
    },
    {
      path: '/list',
      element: <List />,
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  },
);

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  // <React.StrictMode>
  <RouterProvider router={router} />,
  // </React.StrictMode>,
);
