import { Button, Form, InputGroup } from 'react-bootstrap';
import { isEmpty } from 'ramda';
import { Label } from '../sharedStyles';
import type { AlertType, OnValueChange } from '../App';

const text = {
  url: 'URL',
  title: 'Title',
  save: 'Save',
  selectedText: 'Selected Text',
};

type Props = {
  setAlerts: React.Dispatch<React.SetStateAction<Array<AlertType>>>;
  selectedText: string;
  title: string;
  url: string;
  onValueChange: (props: OnValueChange) => void;
  onSave: () => void;
};

const Saver: React.FC<Props> = ({
  setAlerts,
  title,
  url,
  selectedText,
  onSave,
  onValueChange,
}) => {
  const handleChange = (
    key: OnValueChange['key'],
    value: OnValueChange['value'],
  ) => {
    setAlerts([]);
    onValueChange({ key, value });
  };

  return (
    <>
      <form>
        <Form.Group className="mb-1">
          <Label>{text.save}</Label>
          <Form.Control
            as="textarea"
            aria-label="With textarea"
            value={selectedText}
            onChange={e => handleChange('text', e.target.value)}
          />
        </Form.Group>
        <InputGroup className="mb-1">
          <InputGroup.Text id="basic-addon1">{text.title}</InputGroup.Text>
          <Form.Control
            aria-label="Small"
            aria-describedby="inputGroup-sizing-sm"
            value={title}
            onChange={e => handleChange('title', e.target.value)}
          />
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1">{text.url}</InputGroup.Text>
          <Form.Control
            aria-label="Small"
            aria-describedby="inputGroup-sizing-sm"
            value={url}
            onChange={e => handleChange('url', e.target.value)}
          />
        </InputGroup>
        <Button
          onClick={onSave}
          disabled={isEmpty(text)}
          variant={isEmpty(text) ? 'secondary' : 'primary'}
        >
          {text.save}
        </Button>
      </form>
    </>
  );
};

export default Saver;
