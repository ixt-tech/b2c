import React from 'react';
import {
  Image,
} from 'semantic-ui-react';
import logo from '../../images/logo.png';
import './header.css';

const Header = props => {
  return (
    <div>

      <div className='header'>
        <img src={logo} className='logo' />
      </div>

    </div>
  );
};
export default Header;