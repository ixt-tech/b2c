import React, { Component } from "react";
import {BrowserRouter as Router, Redirect, Route, Switch} from 'react-router-dom';
import Loadable from 'react-loadable';
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";
import Header from './components/header/index'

import "./App.css";

const Loading = () => <div>Loading...</div>;

const SignUpPage = Loadable({
  loader: () => import('./components/sign-up-page/index'),
  loading: Loading,
});

const AccountPage = Loadable({
  loader: () => import('./components/account-page/index'),
  loading: Loading,
});

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const Contract = truffleContract(SimpleStorageContract);
      Contract.setProvider(web3.currentProvider);
      const instance = await Contract.deployed();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  render() {
//    if (!this.state.web3) {
//      return <div>Loading Web3, accounts, and contract...</div>;
//    }
    return (
      <div className="App">
        <Router>
          <Switch>
            <Header />
            <Route path="/account" component={AccountPage} />
            <Route path="/sign-up" component={SignUpPage} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
