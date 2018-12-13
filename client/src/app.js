import React, { Component } from "react";
import {BrowserRouter as Router, Redirect, Route, Switch} from 'react-router-dom';
import Loadable from 'react-loadable';
import Header from './components/header/index';
import Connecting from './components/connecting';

import "./app.css";

const l = () => <Connecting />;

const AdminPage = Loadable({
  loader: () => import('./modules/admin-page'),
  loading: l,
});

const AccountPage = Loadable({
  loader: () => import('./modules/account-page'),
  loading: l,
});

const TestPage = Loadable({
  loader: () => import('./modules/test-page'),
  loading: l,
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
            <Route path="/test" component={TestPage} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
