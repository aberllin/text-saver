import React, { useEffect, useState } from 'react';
import { Accordion, Spinner } from 'react-bootstrap';
import styled from 'styled-components';
import { JustificationContainer } from '../sharedStyles';
import { Link } from 'react-router-dom';
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

  useEffect(() => {
    const fetchSelectedText = async () => {
      try {
        setLoading(true);
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
          const errorData = await response.json();
          throw new Error(errorData.error || text.genericError);
        }

        const data = await response.json();
        setSelectedTextList(data.texts || []);
      } catch (err: any) {
        setAlerts(prev => [...prev, { body: err, level: 'danger' }]);
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedText();
  }, []);

  if (loading)
    return (
      <JustificationContainer>
        <Spinner animation="border" role="status" />
      </JustificationContainer>
    );

  return (
    <>
      {selectedTextList.length === 0 ? (
        <JustificationContainer
          $padding={null}
          $width="100%"
          $align="center"
          $justification="center"
        >
          {text.noText}
        </JustificationContainer>
      ) : (
        <Accordion>
          {selectedTextList.reverse().map(item => (
            <Accordion.Item eventKey={item.id} key={item.id}>
              <Accordion.Header>{item.title}</Accordion.Header>
              <Accordion.Body>
                <p>
                  <strong>Text:</strong> {item.text}
                </p>
                <UrlContainer>
                  <strong>URL:</strong>{' '}
                  <Link to={item.url} target="_blank" rel="noopener noreferrer">
                    {item.url}
                  </Link>
                </UrlContainer>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </>
  );
};

const UrlContainer = styled.p`
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
`;

export default List;
