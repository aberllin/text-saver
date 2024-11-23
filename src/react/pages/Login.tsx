import React, { useState, useCallback } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Logo from '../components/Logo';
import { Heading, JustificationContainer, Label } from '../sharedStyles';

const text = {
  signUp: 'Click to sign up!',
  email: 'Email address',
  password: 'Password',
  noAccount: "Don't have an account?",
  loginFailed: 'Login failed. Please try again.',
  welcome: 'Welcome back dear friend!',
};

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);
      setIsLoading(true);

      try {
        const response = await fetch('http://localhost:5001/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess(data.message);
          await new Promise<void>(resolve => {
            chrome.storage.local.set({ auth_token: data.auth_token }, () => {
              resolve();
            });
          });
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 0);
        } else {
          setError(data.error || text.loginFailed);
        }
      } catch (err) {
        setError(text.loginFailed);
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, navigate],
  );

  const handleInputChange = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string>>) => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setter(e.target.value);
      };
    },
    [],
  );

  return (
    <JustificationContainer>
      <Header>
        <Logo /> <Heading>Hello!</Heading>
      </Header>

      <p>{text.welcome}</p>

      <Form onSubmit={handleSubmit} style={{ width: '90%' }}>
        <Form.Group className="mb-2" controlId="formBasicEmail">
          <Label>{text.email}</Label>
          <Form.Control
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={handleInputChange(setEmail)}
            disabled={isLoading}
            required
          />
        </Form.Group>

        <Form.Group className="mb-1" controlId="formBasicPassword">
          <Label>{text.password}</Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={handleInputChange(setPassword)}
            disabled={isLoading}
            required
          />
        </Form.Group>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <p>
          {text.noAccount} <Link to="/register">{text.signUp}</Link>
        </p>

        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Log In'}
        </Button>
      </Form>
    </JustificationContainer>
  );
};

const Header = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

export default Login;
