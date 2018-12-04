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
    const account = this.props.account ? this.props.account : {};
    this.state = {isValid: false, contract: this.props.contract, account: account};
  }

  handleChange(event) {
    console.log(event);
    this.setState({amount: event.target.value});
    if(event.target.value && event.target.value > 0) {
      this.setState({isValid: true});
    } else {
      this.setState({isValid: false});
    }
  }

  handleSubmit = async (event) => {
    console.log(this.state.account);
    event.preventDefault();
  }

  render() {
    return (
      <Modal size='tiny' trigger={<Button onClick={this.handleOpen}>Add Account</Button>}>
        <Modal.Header>{this.state.account ? 'Edit' : 'New'} Account</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.handleSubmit}>
            <Form.Input placeholder='Membership ID' value={this.state.account.membershipNumber} onChange={this.handleChange} />
            <Form.Input placeholder='Address' value={this.state.account.memberAddress} onChange={this.handleChange} />
            <Form.Input placeholder='Products' value={this.state.account.productsCovered} onChange={this.handleChange} />
            <Form.Input placeholder='Invitation Code' value={this.state.account.invitationCode} onChange={this.handleChange} />
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
