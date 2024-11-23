import { Button, Form, InputGroup } from 'react-bootstrap';
import styled from 'styled-components';
import { isEmpty } from 'ramda';
import { Label } from '../sharedStyles';
import type { AlertType } from '../App';

type Props = {
  setAlerts: React.Dispatch<React.SetStateAction<Array<AlertType>>>;
  text: string;
  activeTab: chrome.tabs.Tab | null;
  onTextChange: (value: string) => void;
  onSave: () => void;
};

const Saver: React.FC<Props> = ({
  setAlerts,
  activeTab,
  text,
  onSave,
  onTextChange,
}) => (
  <>
    <form>
      <Form.Group className="mb-1">
        <Label>Selected Text</Label>
        <Form.Control
          as="textarea"
          aria-label="With textarea"
          value={text}
          onChange={e => {
            setAlerts([]);
            onTextChange(e.target.value);
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
        onClick={onSave}
        disabled={isEmpty(text)}
        variant={isEmpty(text) ? 'secondary' : 'primary'}
      >
        Save
      </Button>
    </form>
  </>
);

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export default Saver;
