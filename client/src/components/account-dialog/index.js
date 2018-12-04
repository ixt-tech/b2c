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

class AccountDialog extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
    const account = this.props.account ? this.props.account : this.newAccount();
    this.state = {
      isValid: false,
      modalOpen: false,
      contract: this.props.contract,
      account: account
    };
  }

  handleChange(event, { name, value }) {
    const account = this.state.account;
    account[name] = value;
    this.setState({ account: account });
  }

  handleSubmit = async (event) => {
    // call contract with new account
    this.setState({ account: this.newAccount() });
    this.setState({ modalOpen: false });
    event.preventDefault();
  }

  newAccount() {
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
      <Modal size='tiny' open={this.state.modalOpen} trigger={<Button onClick={this.handleOpen} onClose={this.handleClose}>Add Account</Button>}>
        <Modal.Header>{this.state.account.id ? 'Edit' : 'New'} Account</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.handleSubmit}>
            <Form.Input placeholder='Membership ID' name='membershipNumber' value={this.state.account.membershipNumber} onChange={this.handleChange} />
            <Form.Input placeholder='Address' name='memberAddress' value={this.state.account.memberAddress} onChange={this.handleChange} />
            <Form.Input placeholder='Products' name='productsCovered' value={this.state.account.productsCovered} onChange={this.handleChange} />
            <Form.Input placeholder='Invitation Code' name='invitationCode' value={this.state.account.invitationCode} onChange={this.handleChange} />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.handleSubmit}>
            OK
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

}

export default AccountDialog;
