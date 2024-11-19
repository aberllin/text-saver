import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import styled from 'styled-components';
import { isEmpty } from 'ramda';
import Logo from '../components/Logo';
import { CenteredContainer, Heading, Label } from '../sharedStyles';
import Icon from '../components/Icon';
import type { AlertType } from '../App';

type Props = {
  setAlerts: React.Dispatch<React.SetStateAction<Array<AlertType>>>;
};

const Saver: React.FC<Props> = ({ setAlerts }) => {
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    // Redirect to login page if auth check is complete but user is not authenticated
    if (isAuthCheckComplete && !isAuthenticated) {
      return navigate('/login');
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
        }
      });
    };

    fetchSelectedText();

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      console.log({ tab: tabs[0].title, chrome, document });

      if (tabs.length > 0) {
        setActiveTab(tabs[0]);
      }
    });
  }, [isAuthenticated, text]);

  const handleSave = async () => {
    setAlerts([]);

    if (!isAuthenticated) {
      setAlerts(prev => [
        ...prev,
        { body: 'Oops.. Something went wrong. Try again!', level: 'danger' },
      ]);
      return;
    }

    if (isEmpty(text)) {
      setAlerts(prev => [
        ...prev,
        { body: 'Text field cannot be empty', level: 'danger' },
      ]);
      return;
    }

    setLoading(true);
    try {
      setAlerts([]);

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
        body: JSON.stringify({
          text,
          url: activeTab?.url || '',
          title: activeTab?.title || activeTab?.url || '',
        }),
      });

      // const result = await response.json();

      if (response.ok) {
        setLoading(false);
        setAlerts(prev => [
          ...prev,
          { body: 'Text saved successfully', level: 'success' },
        ]);
      } else {
        setAlerts(prev => [
          ...prev,
          { body: 'Failed to save text. Try again!', level: 'danger' },
        ]);
      }
    } catch (error) {
      // Do nothing, already handled, prevent page from failing
    }
  };

  if (!isAuthCheckComplete || loading) {
    return (
      <CenteredContainer>
        <Spinner animation="border" role="status" />
      </CenteredContainer>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Content>
        <form>
          <Form.Group className="mb-1">
            <Label>Selected Text</Label>
            <Form.Control
              as="textarea"
              aria-label="With textarea"
              value={text}
              onChange={e => {
                setAlerts([]);
                setText(e.target.value);
              }}
            />
          </Form.Group>
          <InputGroup className="mb-1">
            <InputGroup.Text id="basic-addon1">Title</InputGroup.Text>
            <Form.Control
              aria-label="Small"
              aria-describedby="inputGroup-sizing-sm"
              value={activeTab?.title || ''}
              readOnly
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">URL</InputGroup.Text>
            <Form.Control
              aria-label="Small"
              aria-describedby="inputGroup-sizing-sm"
              value={activeTab?.url || ''}
              readOnly
            />
          </InputGroup>
          <Button
            onClick={handleSave}
            disabled={isEmpty(text)}
            variant={isEmpty(text) ? 'secondary' : 'primary'}
          >
            Save
          </Button>
        </form>
      </Content>
    </>
  );
};

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export default Saver;
