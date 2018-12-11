import React from 'react';
import {
  Menu,
  Container,
} from 'semantic-ui-react';
import './styles.css';
import logo from '../../images/logo.png'

const Header = props => {
  return (
    <Menu>
      <Container>
        <Menu.Item as='a' href='http://ixt.global'>
          <img src={logo} className='logo'/>
        </Menu.Item>
        <Menu.Menu position='right'>
          <Menu.Item as='a' href='http://ixt.global'>Home</Menu.Item>
          <Menu.Item as='a' href='http://ixt.global'>Account</Menu.Item>
          <Menu.Item as='a' href='http://ixt.global'>About</Menu.Item>
          <Menu.Item as='a' href='http://ixt.global'>Blog</Menu.Item>
          <Menu.Item as='a' href='http://ixt.global'>Contact</Menu.Item>
        </Menu.Menu>
      </Container>
    </Menu>
  );
};
export default Header;