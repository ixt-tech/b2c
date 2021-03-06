import React from 'react';
import {
  Card,
} from 'semantic-ui-react';
import './styles.css';
import Stake from '../stake'
import Reward from '../reward'
import Product from '../product'

class AccountDetails extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Card.Group itemsPerRow={3}>
        <Stake web3={this.props.web3} contract={this.props.contract} ixtContract={this.props.ixtContract} account={this.props.account} member={this.props.member} />
        <Reward contract={this.props.contract} account={this.props.account} member={this.props.member} />
        <Product contract={this.props.contract} account={this.props.account} />
      </Card.Group>
    );
  }
}

export default AccountDetails;
