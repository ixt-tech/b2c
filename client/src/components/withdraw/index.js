import React from 'react';
import {
  Input,
  Label,
  Button,
} from 'semantic-ui-react';
import './styles.css';

class Deposit extends React.Component {

  render() {
    return (
      <Input labelPosition='left' type='number' placeholder='Amount...' >
        <Label basic>IXT</Label>
        <input />
        <Button type='submit'>Withdraw</Button>
      </Input>
    );
  }

}

export default Deposit;
