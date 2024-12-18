import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Spinner, Tab, Tabs } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import Icon from './components/Icon';
import Logo from './components/Logo';
import { Header, Heading, JustificationContainer } from './sharedStyles';
import { isEmpty } from 'ramda';
import Saver from './pages/Saver';
import List from './pages/List';

enum Content {
  Saver = 'saver',
  List = 'list',
}

export type AlertType = {
  body: string;
  level: 'success' | 'danger';
};

export type OnValueChange = {
  key: 'text' | 'url' | 'title';
  value: string;
};

const text = {
  heading: 'Text saver',
  settings: 'Settings',
  logout: 'Log out',
  tabs: {
    list: 'View all',
    saver: 'Text saver',
  },
  textEmptyField: 'Text field cannot be empty',
  successMessage: 'Text saved successfully',
  saveError: 'Failed to save text. Try again!',
};

const App: React.FC = () => {
  const [selectedText, setSelectedText] = useState('');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [alerts, setAlerts] = useState<Array<AlertType>>([]);
  const [key, setKey] = useState<Content>(Content.Saver);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSelectedText = async () => {
      chrome.storage.local.get('selectedText', data => {
        if (data.selectedText) {
          setSelectedText(data.selectedText);
          setTimeout(() => chrome.storage.local.remove('selectedText'), 100);
        }
      });
    };

    fetchSelectedText();

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs.length > 0 && tabs[0]) {
        const activeTab = tabs[0];
        setTitle(activeTab.title ?? '');
        setUrl(activeTab.url ?? '');
      }
    });
  }, []);

  const handleLogout = () => {
    chrome.storage.local.remove('auth_token', () => {
      navigate('/login', { replace: true });
    });
  };

  const handleSave = async () => {
    setAlerts([]);

    if (isEmpty(selectedText)) {
      setAlerts(prev => [
        ...prev,
        { body: text.textEmptyField, level: 'danger' },
      ]);
      return;
    }

    setLoading(true);
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
        body: JSON.stringify({
          text: selectedText,
          url: url,
          title: title,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setAlerts(prev => [
          ...prev,
          { body: text.successMessage, level: 'success' },
        ]);
      } else {
        setAlerts(prev => [
          ...prev,
          {
            body: result.error || text.saveError,
            level: 'danger',
          },
        ]);
      }
    } catch (error) {
      setAlerts(prev => [...prev, { body: text.saveError, level: 'danger' }]);
    } finally {
      setLoading(false);
    }
  };

  const onValueChange = ({ key, value }: OnValueChange) => {
    console.log({ key, value });
    switch (key) {
      case 'text':
        return setSelectedText(value);
      case 'title':
        return setTitle(value);
      case 'url':
        setUrl(value);
    }
  };

  if (loading) {
    return (
      <JustificationContainer>
        <Spinner animation="border" role="status" />
      </JustificationContainer>
    );
  }

  return (
    <>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Logo /> <Heading>{text.heading}</Heading>
        </div>
        <Dropdown>
          <Dropdown.Toggle variant="primary" size="sm">
            <Icon name="user" color="white" />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={handleLogout}>{text.logout}</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Header>

      {alerts.length > 0 && (
        <Alert className="w-100" variant={alerts[0].level}>
          {alerts[0].body}
        </Alert>
      )}

      <Tabs
        activeKey={key}
        onSelect={tab => {
          setAlerts([]);

          if (tab) {
            setKey(tab as Content);
          }
        }}
        className="mb-3 w-100"
      >
        <Tab eventKey={Content.Saver} title={text.tabs.saver} className="w-100">
          <Saver
            setAlerts={setAlerts}
            selectedText={selectedText}
            title={title}
            url={url}
            onValueChange={onValueChange}
            onSave={handleSave}
          />
        </Tab>
        <Tab eventKey={Content.List} title={text.tabs.list}>
          <List setAlerts={setAlerts} />
        </Tab>
      </Tabs>
    </>
  );
};

export default App;
