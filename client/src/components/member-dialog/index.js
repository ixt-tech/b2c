import React from 'react';
import {
  Modal,
  Image,
  Header,
  Button,
  Form,
  Label,
  Input,
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
    this.setState({ member: member });
  }

  handleSubmit = async (event) => {
    const contract = this.props.contract;
    const member = this.state.member;
    contract.authoriseUser(
      member.membershipNumber,
      member.memberAddress,
      '0x00',
      {from: this.props.account}
    );

    // call contract with new account
    this.setState({ member: this.newMember() });
    this.setState({ modalOpen: false });
    event.preventDefault();
  }

  newMember() {
    return {
      membershipNumber: '',
      memberAddress: '',
      productsCovered: '',
      invitationCode: ''
    };
  }

  handleOpen = () => this.setState({ modalOpen: true })
  handleClose = () => this.setState({ modalOpen: false })

  render() {
    return (
      <Modal size='tiny' open={this.state.modalOpen} trigger={<Button onClick={this.handleOpen} onClose={this.handleClose}>Add Member</Button>}>
        <Modal.Header>{this.state.member.id ? 'Edit' : 'New'} Member</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.handleSubmit}>
            <Form.Input placeholder='Address' name='memberAddress' value={this.state.member.memberAddress} onChange={this.handleChange} />
            <Form.Input placeholder='Membership ID' name='membershipNumber' value={this.state.member.membershipNumber} onChange={this.handleChange} />
            <Form.Input placeholder='Products' name='productsCovered' value={this.state.member.productsCovered} onChange={this.handleChange} />
            <Form.Input placeholder='Invitation Code' name='invitationCode' value={this.state.member.invitationCode} onChange={this.handleChange} />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.handleClose}>
            Cancel
          </Button>
          <Button onClick={this.handleSubmit}>
            OK
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

}

export default MemberDialog;
