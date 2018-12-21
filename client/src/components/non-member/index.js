import React from 'react';
import {
  Container,
  Button,
  Segment
} from 'semantic-ui-react';
import './styles.css';

class NonMember extends React.Component {

  render() {
    return (
      <Container>
        <Segment textAlign='center'>
          You are using an Ethereum account which is not a member of IXT Protect or we are in the process of approving your application.
          <br/>
          <br/>
          <Button positive>Sign up</Button>
        </Segment>
      </Container>
    )
  }

}

export default NonMember;
