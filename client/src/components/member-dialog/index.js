import React from 'react';
import {
  Modal,
  Form,
  Button,
} from 'semantic-ui-react';
import './styles.css';

class MemberDialog extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
    const member = this.props.member ? this.props.member : this.newMember();
    this.state = {
      isValid: false,
      modalOpen: false,
      member: member
    };
  }

  handleChange(event, { name, value }) {
    const member = this.state.member;
    member[name] = value;
    if(name == 'address' && value.length > 10) {
      let code = value.substring(value.length - 8);
      member.membershipNumber = code;
      member.invitationCode = code;
    }
    this.setState({ member: member });
  }

  handleSubmit = async (event) => {
    this.props.postSubmit(this.state.member);
    this.setState({ member: this.newMember() });
    this.setState({ modalOpen: false });
  }

  newMember() {
    return {
      membershipNumber: '',
      address: '',
      products: '',
      invitationCode: '',
      referralInvitationCode: ''
    };
  }

  handleOpen = () => this.setState({ modalOpen: true })
  handleClose = () => this.setState({ modalOpen: false })

  render() {
    return (
      <Modal size='tiny' open={this.state.modalOpen} trigger={<Button positive onClick={this.handleOpen} onClose={this.handleClose}>Add Member</Button>}>
        <Modal.Header>{this.state.member.id ? 'Edit' : 'Add'} Member</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.handleSubmit}>
            <Form.Input placeholder='Wallet address' name='address' value={this.state.member.address} onChange={this.handleChange} />
            <Form.Input placeholder='Referral Invitation Code' name='referralInvitationCode' value={this.state.member.referralInvitationCode} onChange={this.handleChange} />
            <Form.Input placeholder='Invitation Code' name='invitationCode' value={this.state.member.invitationCode} onChange={this.handleChange} />
            <Form.Input placeholder='Membership ID' name='membershipNumber' value={this.state.member.membershipNumber} onChange={this.handleChange} />
            <Form.Input placeholder='Invitation Code' name='invitationCode' value={this.state.member.invitationCode} onChange={this.handleChange} />
            <Form.Input placeholder='Products' name='products' value={this.state.member.productsCovered} onChange={this.handleChange} />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.handleClose}>
            Cancel
          </Button>
          <Button onClick={this.handleSubmit} positive>
            OK
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

}

export default MemberDialog;
