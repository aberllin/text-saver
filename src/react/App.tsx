import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import styled from 'styled-components';
import Icon from './components/Icon';

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    chrome.storage.local.get('auth_token', data => {
      if (data.auth_token) {
        setIsAuthenticated(true);
      }
      if (!isAuthCheckComplete) {
        setIsAuthCheckComplete(true);
      }
    });
  }, [isAuthCheckComplete]);

  console.log('isAuthenticated', isAuthenticated);
  console.log('isAuthCheckComplete', isAuthCheckComplete);

  useEffect(() => {
    // Redirect to login page if auth check is complete and user is not authenticated
    if (isAuthCheckComplete && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthCheckComplete, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Retrieve selected text from chrome.storage
    const fetchSelectedText = async () => {
      chrome.storage.local.get('selectedText', data => {
        if (data.selectedText) {
          setText(data.selectedText);
          setTimeout(() => chrome.storage.local.remove('selectedText'), 100);
        } else {
          console.log('No selected text found');
        }
      });
    };

    fetchSelectedText();

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.url) {
        setPageUrl(tabs[0].url);
      }
    });
  }, [isAuthenticated]);

  const handleSave = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated');
      return;
    }

    try {
      const authToken = await new Promise<string>(resolve => {
        chrome.storage.local.get('auth_token', data => {
          resolve(data.auth_token || '');
        });
      });

      const response = await fetch('http://localhost:5001/save_text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ text, url: pageUrl }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Text saved successfully:', result);
      } else {
        console.error('Failed to save text:', result);
      }
    } catch (error) {
      console.error('Error saving text:', error);
    }
  };

  if (!isAuthCheckComplete) {
    return null; // Optionally render a loading spinner here
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="save" /> <h1>Text saver</h1>
        </div>
        <Dropdown>
          <Dropdown.Toggle variant="primary">
            <Icon name="user" />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item href="#/action-1">Settings</Dropdown.Item>
            <Dropdown.Item onClick={handleLogout}>Log out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Header>
      <Content>
        <Link to="/list">SHOW ALL</Link>
        <form>
          <Form.Group className="mb-3">
            <Form.Label>Selected Text</Form.Label>
            <Form.Control
              as="textarea"
              aria-label="With textarea"
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Current URL</Form.Label>
            <Form.Control
              aria-label="Small"
              aria-describedby="inputGroup-sizing-sm"
              value={pageUrl}
              readOnly
            />
          </Form.Group>
          <Button onClick={handleSave}>Save</Button>
        </form>
      </Content>
    </Container>
  );
};

const handleLogout = () => {
  chrome.storage.local.remove('auth_token', () => {
    console.log('User logged out');
    window.location.href = '/login'; // Using window.location.href for simplicity
  });
};

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Container = styled.div`
  width: 400px;
  padding: 24px;
`;

export default App;
