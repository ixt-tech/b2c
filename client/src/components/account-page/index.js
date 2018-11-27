import React from 'react';
import {
  Container,
  Segment,
  Input,
  Label,
  Button,
  Header,
} from 'semantic-ui-react';
import './account.css';
import IxtProtect from "../../contracts/IxtProtect.json";
import getWeb3 from "../../utils/getWeb3";
import truffleContract from "truffle-contract";

class AccountPage extends React.Component {

  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    alert(
      `Failed to load account. You must connect your account you registered with IXT Protect`
    );
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const Contract = truffleContract(IxtProtect);
      Contract.setProvider(web3.currentProvider);
      const instance = await Contract.deployed();

      const accountBalance = await instance.getAccountBalance.call();
      const rewardBalance = await instance.getRewardBalance.call();

      this.setState({ web3, accounts, contract: instance, accountBalance, rewardBalance });

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
        <Segment>
          Account address: { this.state.accounts[0] }
        </Segment>
        <Segment>
          Account balance: { this.state.accountBalance.toString() }
        </Segment>
        <Segment>
          Reward balance: { this.state.rewardBalance.toString() }
        </Segment>
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
      </Container>
    );
  }
}

export default AccountPage;
