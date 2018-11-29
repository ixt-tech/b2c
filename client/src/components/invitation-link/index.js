import React from 'react';
import {
  Segment,
  Button,
  Icon,
} from 'semantic-ui-react';
import './styles.css';

class InvitationLink extends React.Component {

  render() {
    return (
      <Segment>
        Your invitation link: {this.props.url}
        <Button icon size='mini'>
          <Icon name='copy' />
        </Button>
      </Segment>
    );
  }

}

export default InvitationLink;
