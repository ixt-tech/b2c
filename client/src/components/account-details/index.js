import React from 'react';
import {
  Card,
} from 'semantic-ui-react';
import './styles.css';
import Stake from '../stake'
import Reward from '../reward'

class AccountDetails extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Card.Group itemsPerRow={3}>
        <Stake contract={this.props.contract} account={this.props.account}/>
        <Reward contract={this.props.contract} account={this.props.account}/>
        <Card>
          <Card.Content>
            <Card.Header>Products</Card.Header>
            <Card.Description>Travel Crisis Protection</Card.Description>
            <Card.Meta>Start date: Not activated</Card.Meta>
          </Card.Content>
        </Card>
      </Card.Group>
    );
  }
}

export default AccountDetails;
