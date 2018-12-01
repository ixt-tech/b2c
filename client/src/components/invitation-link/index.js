import React from 'react';
import {
  Grid,
  Segment,
  Button,
  Icon,
  Popup,
} from 'semantic-ui-react';
import './styles.css';

class InvitationLink extends React.Component {

  constructor(props) {
    super(props);
    this.copy = this.copy.bind(this);
  }

  copy() {
    let _tmp = document.createElement('input');
    document.body.appendChild(_tmp);
    _tmp.value = this.props.url;
    _tmp.select();
    document.execCommand('copy');
    document.body.removeChild(_tmp);
  }

  render() {
    return (
      <div>
        <h2>Invitation link</h2>
        This in your personal invitation link. You can simply copy and send it to anyone you wish to invite to join IXT Protect.
        You will be rewarded with 100 IXT for every successful registration.
        <br/>
        <Grid>
          <Grid.Column width={5}>
            <Segment>
              <b>{this.props.url}</b>
              <Popup trigger={<Button className='invitation' size='small' icon='copy outline' onClick={this.copy} />} content='Copied to clipboard' on='click' hideOnScroll/>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }

}

export default InvitationLink;
