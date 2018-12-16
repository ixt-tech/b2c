import React from 'react';
import {
  Container,
  Segment,
  Grid,
  Divider,
  Button,
} from 'semantic-ui-react';
import './styles.css';
import getWeb3 from '../../utils/getWeb3';
import IxtProtect from '../../contracts/IxtProtect.json';
import IxtToken from '../../contracts/IxtToken.json';
import truffleContract from 'truffle-contract';

import Connecting from '../../components/connecting';
import NonMember from '../../components/non-member';
import AccountDetails from '../../components/account-details';
import InvitationLink from '../../components/invitation-link';
import Levels from '../../components/levels';
import InvitationsGrid from '../../components/invitation-grid';

class AccountPage extends React.Component {

  state = { web3: null, account: null, contract: null };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const account = web3.utils.toChecksumAddress(accounts[0]);

      const Contract = truffleContract(IxtProtect);
      Contract.setProvider(web3.currentProvider);
      const contract = await Contract.deployed();

      const IxtContract = truffleContract(IxtToken);
      IxtContract.setProvider(web3.currentProvider);
      const ixtAddress = await contract.ixtToken();
      const ixtContract = await IxtContract.at(ixtAddress);

      const member = await contract.members(account);
      if(member.membershipNumber.toString() != 0) {
        this.setState({ isMember: true });
      }

      this.setState({ web3, account, contract, ixtContract, member });

    } catch (error) {
      alert(
        `Failed to load your IXT Protect account. You must connect with your account you registered with.`
      );
      console.log(error);
    }
  };

  render() {
    if (!this.state.web3) {
      return <Connecting />;
    } else if(!this.state.isMember) {
      return <NonMember />
    }

    return (
      <Container>

        <h1>Your account</h1>
        <h4>Address: { this.state.account }</h4>

        <AccountDetails
          account={ this.state.account }
          contract={ this.state.contract }
          ixtContract={ this.state.ixtContract }
        />

        <InvitationLink web3={this.state.web3} member={ this.state.member } />

        <Levels contract={this.state.contract} />

        <InvitationsGrid web3={this.state.web3} contract={this.state.contract} account={this.state.account} />

      </Container>
    );
  }
}

export default AccountPage;
