import React, { Component } from "react";
import {BrowserRouter as Router, Redirect, Route, Switch} from 'react-router-dom';
import Loadable from 'react-loadable';
import Header from './components/header/index'

import "./App.css";

const Loading = () => <div>Loading...</div>;

const AdminPage = Loadable({
  loader: () => import('./modules/admin-page'),
  loading: Loading,
});

const AccountPage = Loadable({
  loader: () => import('./modules/account-page'),
  loading: Loading,
});

class App extends Component {

  render() {
    return (
      <div className="App">
        <Header />
        <Router>
          <Switch>
            <Route path="/account" component={AccountPage} />
            <Route path="/admin" component={AdminPage} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
