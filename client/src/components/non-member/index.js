import React from 'react';
import {
  Container,
  Button,
  Segment,
  Header,
  Icon,
} from 'semantic-ui-react';
import './styles.css';

class NonMember extends React.Component {

  render() {
    return (
      <Container>
        <Segment textAlign='center'>
          You are using an account which is not a member of IXT Protect yet.
          <br/>
          <Button positive>Sign Up</Button>
        </Segment>
      </Container>
    )
  }

}

export default NonMember;
