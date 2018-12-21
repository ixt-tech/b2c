import React from 'react';
import {
  Container,
  Button,
  Message,
  Segment,
} from 'semantic-ui-react';
import './styles.css';

class NonAdmin extends React.Component {

  render() {
    return (
      <Container>
        <Message negative>
            You must use the owner account.
        </Message>
      </Container>
    )
  }

}

export default NonAdmin;
