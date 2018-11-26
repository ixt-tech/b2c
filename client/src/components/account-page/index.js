import React from 'react';
import {
  Container,
  Segment,
  Input,
  Label,
  Button,
} from 'semantic-ui-react';
import './account.css';

class AccountPage extends React.Component {
  render() {
    return (
      <Container>
        <Segment>
          Account wallet:
        </Segment>
        <Segment>
          Account balance:
        </Segment>
        <Segment>
          Reward balance:
        </Segment>
        <Segment>
          <Input labelPosition='left' type='number' placeholder='Amount...'>
            <Label basic>IXT</Label>
            <input />
            <Button type='submit'>Deposit</Button>
          </Input>
        </Segment>
        <Segment>
          <Input labelPosition='left' type='number' placeholder='Amount...'>
            <Label basic>IXT</Label>
            <input />
            <Button type='submit'>Withdraw</Button>
          </Input>
        </Segment>
      </Container>
    );
  }
}

export default AccountPage;
