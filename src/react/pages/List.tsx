import React, { useEffect, useState } from 'react';

interface SelectedTextItem {
  id: string;
  text: string;
  url: string;
}

const List: React.FC = () => {
  const [selectedTextList, setSelectedTextList] = useState<SelectedTextItem[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSelectedText = async () => {
      try {
        const authToken = await new Promise<string>(resolve => {
          chrome.storage.local.get('auth_token', data => {
            console.log('dataToken', data);
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
          throw new Error('Failed to fetch saved text');
        }

        const data = await response.json();
        console.log('LIST DATA', data);
        setSelectedTextList(data.texts);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedText();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Saved Selected Texts</h1>
      {selectedTextList.length === 0 ? (
        <p>No saved texts found.</p>
      ) : (
        <ul>
          {selectedTextList.map(item => (
            <li key={item.id}>
              <p>
                <strong>Text:</strong> {item.text}
              </p>
              <p>
                <strong>URL:</strong>{' '}
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.url}
                </a>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default List;
