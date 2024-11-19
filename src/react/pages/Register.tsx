import React, { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { equals, repeat } from 'ramda';
import styled from 'styled-components';
import Logo from '../components/Logo';
import { Heading, Label } from '../sharedStyles';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error and success messages before submitting
    setError(null);
    setSuccess(null);

    try {
      if (!equals(password, repeatPassword)) {
        return setError('Passwords do not match');
      }

      const response = await fetch('http://localhost:5001/register', {
        body: JSON.stringify({ email, password }),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();

      // Store the token (you could use localStorage or cookies depending on your needs)
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        setSuccess(data.message);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Container>
      <Header>
        <Logo /> <Heading>Hello!</Heading>
      </Header>

      <Form onSubmit={handleSubmit} style={{ width: '90%' }}>
        <Form.Group controlId="formBasicEmail" className="mb-2">
          <Label>Email address</Label>
          <Form.Control
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Form.Text className="text-muted">Will be used as login.</Form.Text>
        </Form.Group>

        <Form.Group controlId="formBasicPassword" className="mb-1">
          <Label>Password</Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formBasicRepeatPassword" className="mb-1">
          <Label>Repeat password</Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={repeatPassword}
            onChange={e => setRepeatPassword(e.target.value)}
            required
          />
        </Form.Group>
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success ">{success}</Alert>}
        <p>
          Already have an account? <Link to="/login">Sign in!</Link>
        </p>
        <Button variant="primary" type="submit">
          Register
        </Button>
      </Form>
    </Container>
  );
};

const Container = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

export default Register;
