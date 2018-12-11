import React from 'react';
import {
  Container,
  Divider,
} from 'semantic-ui-react';
import ReactDataGrid from 'react-data-grid';
import MemberDialog from '../../components/member-dialog'

import './styles.css';
import getWeb3 from '../../utils/getWeb3';
import IxtProtect from '../../contracts/IxtProtect.json';
import truffleContract from 'truffle-contract';


class AdminPage extends React.Component {

  state = { web3: null, accounts: null, contract: null, members: [], columns: [] };

  constructor(props) {
    super(props);
    this.getCellActions = this.getCellActions.bind(this);
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      // Get the contract instance.
      const Contract = truffleContract(IxtProtect);
      Contract.setProvider(web3.currentProvider);
      const contract = await Contract.deployed();

      const length = await contract.membersArray.length;
      console.log(length);

      const members = [
        { membershipNumber: 1, memberAddress: '0x1', productsCovered: 'Personal Travel Crisis', invitationCode: '0x1' },
        { membershipNumber: 2, memberAddress: '0x2', productsCovered: 'Personal Travel Crisis', invitationCode: '0x2' },
        { membershipNumber: 3, memberAddress: '0x3', productsCovered: 'Personal Travel Crisis', invitationCode: '0x3' },
      ];

      const columns = [
        { key: 'membershipNumber', name: 'Member ID' },
        { key: 'memberAddress', name: 'Address' },
        { key: 'productsCovered', name: 'Products' },
        { key: 'invitationCode', name: 'Invite Code' }
      ];

      this.setState({ web3, account, contract, members, columns });

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load your IXT Protect account. You must connect with your account you registered with.`
      );
      console.log(error);
    }
  };

  getCellActions(column, row) {
    return null;
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <Container>
        <h1>IXT Protect Admin</h1>
        <h4 className='address'>Address: { this.state.account }</h4>
        <MemberDialog account={this.state.account} contract={this.state.contract} />
        <h2>Members</h2>
        <ReactDataGrid
          columns={this.state.columns}
          rowGetter={i => this.state.members[i]}
          rowsCount={3}
          minHeight={500}
          getCellActions={this.getCellActions}
        />
      </Container>
    );
  }
}

export default AdminPage;
