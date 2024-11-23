import { createRoot } from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {
  RouterProvider,
  createMemoryRouter,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import React from 'react';
import { JustificationContainer } from './sharedStyles';
import { Spinner } from 'react-bootstrap';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(
    null,
  );

  React.useEffect(() => {
    chrome.storage.local.get(['auth_token'], result => {
      setIsAuthenticated(!!result.auth_token);
    });
  }, []);

  if (isAuthenticated === null) {
    return (
      <JustificationContainer>
        <Spinner animation="border" role="status" />
      </JustificationContainer>
    );
  }

  return <>{children}</>;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(
    null,
  );
  const navigate = useNavigate();

  React.useEffect(() => {
    chrome.storage.local.get(['auth_token'], result => {
      setIsAuthenticated(!!result.auth_token);
    });
  }, []);

  React.useEffect(() => {
    if (isAuthenticated === false) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated === null) {
    return (
      <JustificationContainer>
        <Spinner animation="border" role="status" />
      </JustificationContainer>
    );
  }

  return isAuthenticated ? (
    <JustificationContainer>{children}</JustificationContainer>
  ) : null;
};

const router = createMemoryRouter(
  [
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <App />
        </ProtectedRoute>
      ),
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
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ],
  {
    initialEntries: ['/'],
    initialIndex: 0,
  },
);

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>,
);
