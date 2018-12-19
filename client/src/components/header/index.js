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
          <Menu.Item as='a' href='https://ixt.global/ixt-protect'>Home</Menu.Item>
          <Menu.Item as='a' href='/account'>Account</Menu.Item>
          <Menu.Item as='a' href='http://ixt.global'>Blog</Menu.Item>
          <Menu.Item as='a' href='https://www.ixt.global/contact-us/'>Contact us</Menu.Item>
        </Menu.Menu>
      </Container>
    </Menu>
  );
};
export default Header;