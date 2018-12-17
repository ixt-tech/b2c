import React from 'react';
import {
  Grid,
  Segment,
  Button,
  Icon,
  Popup,
} from 'semantic-ui-react';
import './styles.css';
import { fromBn, asNum } from "../../utils/number";

class InvitationLink extends React.Component {

  state = { invitationLink: '' };

  constructor(props) {
    super(props);
    this.copy = this.copy.bind(this);
  }

  componentDidMount = async () => {
    const web3 = this.props.web3;
    const contract = this.props.contract;
    const member = this.props.member;
    const invitationLink = 'https://www.ixt.global/ixt-protect-sign-up?invitation=' + web3.utils.toAscii(member.invitationCode);
    const invitationReward = await contract.invitationReward();
    this.setState({ invitationLink, invitationReward });
  }

  copy() {
    let _tmp = document.createElement('input');
    document.body.appendChild(_tmp);
    _tmp.value = this.state.invitationLink;
    _tmp.select();
    document.execCommand('copy');
    document.body.removeChild(_tmp);
  }

  render() {
    return (
      <div>
        <h2>Invitation link</h2>
        You can simply copy and send it to anyone you wish to invite to join IXT Protect.
        You will be rewarded with { fromBn(this.state.invitationReward) } IXT for every successful registration.
        <br/>
        <Grid>
          <Grid.Column width={8}>
            <Segment>
              <b>{ this.state.invitationLink }</b>
              <Popup trigger={<Button className='invitation' size='small' icon='copy outline' onClick={this.copy} />} content='Copied to clipboard' on='click' hideOnScroll/>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }

}

export default InvitationLink;
