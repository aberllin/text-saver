import React, { useEffect, useState } from 'react';
import { Accordion, Alert, Spinner } from 'react-bootstrap';
import styled from 'styled-components';
import { CenteredContainer, Header, Heading } from '../sharedStyles';
import Logo from '../components/Logo';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import type { AlertType } from '../App';

type SelectedTextItem = {
  id: string;
  text: string;
  url: string;
  title: string;
};

type Props = {
  setAlerts: React.Dispatch<React.SetStateAction<Array<AlertType>>>;
};

const text = {
  noText: 'No saved text found',
  genericError: 'Something went wrong. Please try again!',
};

const List: React.FC<Props> = ({ setAlerts }) => {
  const [selectedTextList, setSelectedTextList] = useState<
    Array<SelectedTextItem>
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSelectedText = async () => {
      try {
        const authToken = await new Promise<string>(resolve => {
          chrome.storage.local.get('auth_token', data => {
            resolve(data.auth_token);
          });
        });

        const response = await fetch('http://localhost:5001/texts', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(text.genericError);
        }

        const data = await response.json();
        setSelectedTextList(data.texts);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedText();
  }, []);

  if (loading)
    return (
      <CenteredContainer>
        <Spinner animation="border" role="status" />
      </CenteredContainer>
    );

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      {selectedTextList.length === 0 ? (
        <NoText>{text.noText}</NoText>
      ) : (
        <Accordion>
          {selectedTextList.reverse().map(item => (
            <Accordion.Item eventKey={item.id} key={item.id}>
              <Accordion.Header>{item.title}</Accordion.Header>
              <Accordion.Body>
                <p>
                  <strong>Text:</strong> {item.text}
                </p>
                <p>
                  <strong>URL:</strong>{' '}
                  <Link to={item.url} target="_blank" rel="noopener noreferrer">
                    {item.url}
                  </Link>
                </p>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </>
  );
};

const NoText = styled.p`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default List;
