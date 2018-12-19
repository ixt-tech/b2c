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
    this.state = {
      isValid: false,
      modalOpen: false,
      members: []
    };
  }

  handleChange(event, { name, value }) {
    const lines = value.split('\n');
    const members = [];
    for(let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineSplit = line.split(' ');

      let member = {};
      const address = lineSplit[0];
      member.address = address;

      let code = address.substring(address.length - 8);
      member.membershipNumber = code;
      member.invitationCode = code;
      if(lineSplit.length > 1) {
        member.referralInvitationCode = lineSplit[1];
      }
      members.push(member);
    }
    this.setState({ members: members });
  }

  handleSubmit = async (event) => {
    this.props.postSubmit(this.state.members);
    this.setState({ members: [] });
    this.setState({ modalOpen: false });
  }

  handleOpen = () => this.setState({ modalOpen: true })
  handleClose = () => this.setState({ modalOpen: false })

  render() {
    return (
      <Modal size='large' open={this.state.modalOpen} trigger={<Button positive onClick={this.handleOpen} onClose={this.handleClose}>Add members</Button>}>
        <Modal.Header>Add members</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.handleSubmit}>
            <Form.TextArea rows={15} placeholder='Wallet addresses' name='addresses' value={this.state.addresses} onChange={this.handleChange} />
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
