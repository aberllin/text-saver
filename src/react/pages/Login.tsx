import React, { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Logo from '../components/Logo';
import { Heading, Label } from '../sharedStyles';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:5001/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);

        // Save auth_token in chrome.storage.local
        chrome.storage.local.set({ auth_token: data.auth_token }, () => {
          navigate('/');
        });
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (err: any) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <Container>
      <Header>
        <Logo /> <Heading>Hello!</Heading>
      </Header>

      <p>Welcome back dear friend!</p>

      <Form onSubmit={handleSubmit} style={{ width: '90%' }}>
        <Form.Group className="mb-2" controlId="formBasicEmail">
          <Label>Email address</Label>
          <Form.Control
            type="email"
            placeholder="email@example.com"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-1" controlId="formBasicPassword">
          <Label>Password</Label>
          <Form.Control
            type="password"
            placeholder="Password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <p>
          Don't have an account? <Link to="/register">Click to sign up!</Link>
        </p>
        <Button variant="primary" type="submit">
          Log In
        </Button>
      </Form>
    </Container>
  );
};

const Header = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const Container = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
`;

export default Login;
