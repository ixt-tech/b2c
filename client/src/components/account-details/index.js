import React from 'react';
import {
  Card,
} from 'semantic-ui-react';
import './styles.css';

class AccountDetails extends React.Component {

  render() {
    return (
      <Card.Group>
        <Card className='widget'>
          <Card.Content>
            <Card.Header>Account Balance</Card.Header>
            <Card.Meta>As of: 01-Dec-2018 23:02:33</Card.Meta>
            <Card.Description>{ this.props.accountBalance } IXT</Card.Description>
            <Card.Meta>As of: 01-Dec-2018 23:02:33</Card.Meta>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Card.Header>Rewards Balance</Card.Header>
            <Card.Meta>As of: 01-Dec-2018 23:02:33</Card.Meta>
            <Card.Description>{ this.props.rewardBalance } IXT</Card.Description>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Card.Header>Current Products</Card.Header>
            <Card.Meta>Start date: 01-Dec-2018 23:02:33</Card.Meta>
            <Card.Description>Travel Crisis Protection Cover</Card.Description>
          </Card.Content>
        </Card>
      </Card.Group>
    );
  }
}

export default AccountDetails;
