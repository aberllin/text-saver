import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Tab, Tabs } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import styled from 'styled-components';
import Icon from './components/Icon';
import Logo from './components/Logo';
import { Header, Heading, Label } from './sharedStyles';
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

const text = {
  heading: 'Text saver',
  settings: 'Settings',
  logout: 'Log out',
  tabs: {
    list: 'View all',
    saver: 'Text saver',
  },
};

const App: React.FC = () => {
  const [alerts, setAlerts] = useState<Array<AlertType>>([]);
  const [key, setKey] = useState<Content>(Content.Saver);
  const navigate = useNavigate();

  const handleLogout = () => {
    chrome.storage.local.remove('auth_token', () => {
      navigate('/');
    });
  };

  return (
    <Container>
      <Header>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Logo /> <Heading>{text.heading}</Heading>
        </div>
        <Dropdown>
          <Dropdown.Toggle variant="primary" size="sm">
            <Icon name="user" color="white" />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item href="#/action-1">{text.settings}</Dropdown.Item>
            <Dropdown.Item onClick={handleLogout}>{text.logout}</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Header>
      {alerts.length > 0 && (
        <Alert variant={alerts[0].level}>{alerts[0].body}</Alert>
      )}
      <Tabs
        activeKey={key}
        onSelect={tab => {
          if (tab) {
            setKey(tab as Content);
          }
        }}
        className="mb-3"
      >
        <Tab eventKey={Content.Saver} title={text.tabs.saver}>
          <Saver setAlerts={setAlerts} />
        </Tab>
        <Tab eventKey={Content.List} title={text.tabs.list}>
          <List setAlerts={setAlerts} />
        </Tab>
      </Tabs>
    </Container>
  );
};

const Container = styled.div`
  width: 400px;
  padding: 24px;
  display: flex;
  flex-direction: column;
`;

export default App;
