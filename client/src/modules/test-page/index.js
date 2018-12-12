import React from 'react';
import {
  Container,
  Divider,
} from 'semantic-ui-react';
import ReactDataGrid from 'react-data-grid';

import './styles.css';
import getWeb3 from "../../utils/getWeb3";
import IxtProtect from "../../contracts/IxtProtect.json";
import truffleContract from "truffle-contract";

class TestPage extends React.Component {

  state = { web3: null, accounts: null, contract: null, members: [], columns: [] };

  constructor(props) {
    super(props);
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const Contract = truffleContract(IxtProtect);
      Contract.setProvider(web3.currentProvider);
      const contract = await Contract.deployed();

      console.log('Contract address: ' + contract.address);
      console.log('Account: ' + accounts[0]);
      const members = await contract.members(web3.utils.toChecksumAddress(accounts[0]));
      console.log(members);

      this.setState({ web3, accounts, contract });

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
      return <Container>Loading Web3, accounts, and contract...</Container>;
    }
    return (
      <Container>
        <h1>Test Page</h1>
      </Container>
    );
  }
}

export default TestPage;
