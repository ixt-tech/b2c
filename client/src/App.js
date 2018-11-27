import React, { Component } from "react";
import {BrowserRouter as Router, Redirect, Route, Switch} from 'react-router-dom';
import Loadable from 'react-loadable';
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

  render() {
    return (
      <div className="App">
        <Header />
        <Router>
          <Switch>
            <Route path="/account" component={AccountPage} />
            <Route path="/sign-up" component={SignUpPage} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
