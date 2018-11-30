import React from 'react';
import {
  Container,
  Segment,
  Grid,
  Divider,
} from 'semantic-ui-react';

import './styles.css';

import AccountDetails from '../../components/account-details';
import InvitationLink from '../../components/invitation-link';
import Deposit from '../../components/deposit';
import Withdraw from '../../components/withdraw';
import TransactionGrid from "../../components/transaction-grid";

import getWeb3 from "../../utils/getWeb3";
import getContract from "../../utils/getContract";
import truffleContract from "truffle-contract";
import IxtProtect from "../../contracts/IxtProtect.json";

class AccountPage extends React.Component {

  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const contract = getContract(web3);

      const accountBalance = 123;//await instance.getAccountBalance;
      const rewardBalance = 123;//await instance.getRewardBalance;
      const invitationUrl = 'https://ixt.global/sign-up/123ABC'

      this.setState({ web3, accounts,  accountBalance, rewardBalance, invitationUrl });

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
        <h4 className='address'>Address: { this.state.accounts[0] }</h4>

        <AccountDetails
          accountBalance={this.state.accountBalance.toString()}
          rewardBalance={this.state.rewardBalance.toString()}
          products={this.state.products}/>

        <InvitationLink url={this.state.invitationUrl}/>

        <Grid columns={2} textAlign='center'>
          <Grid.Row>
            <Grid.Column>
              <Deposit contract={this.state.contract} />
            </Grid.Column>
            <Grid.Column>
              <Withdraw />
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <TransactionGrid />

      </Container>
    );
  }
}

export default AccountPage;
