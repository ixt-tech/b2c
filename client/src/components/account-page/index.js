import React from 'react';
import {
  Container,
  Segment,
  Input,
  Label,
  Button,
  Header,
  Card,
} from 'semantic-ui-react';
import './account.css';
import IxtProtect from "../../contracts/IxtProtect.json";
import getWeb3 from "../../utils/getWeb3";
import truffleContract from "truffle-contract";

class AccountPage extends React.Component {

  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const Contract = truffleContract(IxtProtect);
      Contract.setProvider(web3.currentProvider);
      const instance = await Contract.deployed();

      const accountBalance = 123;//await instance.getAccountBalance.call();
      const rewardBalance = 123;//await instance.getRewardBalance.call();

      this.setState({ web3, accounts, contract: instance, accountBalance, rewardBalance });

      instance.getPastEvents('allEvents', {
        fromBlock: 0,
        toBlock: 'latest'
      }, function(error, events){ console.log(events); })
        .then(function(events){
          console.log(events) // same results as the optional callback above
        });

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load account. You must connect your account you registered with IXT Protect`
      );
      console.log(error);
    }
  };

  deposit = async (e) => {
    console.log('Depositing ', this.state.depositAmount);
    this.setState({depositAmount: 0.0});
  }

  withdraw = async (e) => {
    console.log('Withdrawing ', this.state.withdrawAmount);
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <Container>

        <h1>Your account</h1>
        <h4 className='address'>Address: { this.state.accounts[0] }</h4>

        <Card.Group>
          <Card>
            <Card.Content>
              <Card.Header>Account Balance</Card.Header>
              <Card.Meta>As of: 01-Dec-2018 23:02:33</Card.Meta>
              <Card.Description>{ this.state.accountBalance.toString() } IXT</Card.Description>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content>
              <Card.Header>Rewards Balance</Card.Header>
              <Card.Meta>As of: 01-Dec-2018 23:02:33</Card.Meta>
              <Card.Description>{ this.state.rewardBalance.toString() } IXT</Card.Description>
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

        <Segment>
          Deposit to IXT Protect. The deposit will be added to your balance.<br/>
          <Input labelPosition='left' type='number' placeholder='Amount...' >
            <Label basic>IXT</Label>
            <input onChange={(e) => this.setState({depositAmount: e.target.value})} />
            <Button type='submit' onClick={this.deposit}>Deposit</Button>
          </Input>
        </Segment>
        <Segment>
          Deposit to IXT Protect. The deposit will be added to your balance.<br/>
          <Input labelPosition='left' type='number' placeholder='Amount...'>
            <Label basic>IXT</Label>
            <input onChange={(e) => this.setState({withdrawAmount: e.target.value})} />
            <Button type='submit' onClick={this.withdraw}>Withdraw</Button>
          </Input>
        </Segment>

        <h2>Transactions</h2>

      </Container>
    );
  }
}

export default AccountPage;
