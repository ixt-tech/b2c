import React from 'react';
import {
  Container,
  Segment,
  Grid,
  Divider,
  Button,
} from 'semantic-ui-react';

import './styles.css';

import AccountDetails from '../../components/account-details';
import InvitationLink from '../../components/invitation-link';
import Stake from '../../components/stake';
import Withdraw from '../../components/withdraw';
import TransactionGrid from '../../components/transaction-grid';

import getWeb3 from '../../utils/getWeb3';
import getContract from '../../utils/getContract';
import IxtProtect from '../../contracts/IxtProtect.json';
import truffleContract from 'truffle-contract';

class AccountPage extends React.Component {

  state = { web3: null, account: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      const account = web3.utils.toChecksumAddress(accounts[0]);

      // Get the contract instance.
      //const contract = await getContract(web3);
      const Contract = truffleContract(IxtProtect);
      Contract.setProvider(web3.currentProvider);
      const contract = await Contract.deployed();
      const member = await contract.members(account);
      if(member.membershipNumber.toString() == 0) {
        alert('You are not a member');
      }
      this.setState({ web3, account, contract, member });

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load your IXT Protect account. You must connect with your account you registered with.`
      );
      console.log(error);
    }
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <Container>

        <h1>Your account</h1>
        <h4>Address: { this.state.account }</h4>

        <AccountDetails
          account={ this.state.account }
          contract={ this.state.contract }
        />

        <InvitationLink web3={this.state.web3} member={ this.state.member } />

        <TransactionGrid />
      </Container>
    );
  }
}

export default AccountPage;
