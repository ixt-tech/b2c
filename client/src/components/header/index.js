import React from 'react';
import {
  Header as SemanticHeader,
} from 'semantic-ui-react';

import logo from '../../images/logo.png';

import './header.css';

const Header = props => {
  const pathname = window.location.pathname;
  return (
    <SemanticHeader></SemanticHeader>
  );
};
export default Header;