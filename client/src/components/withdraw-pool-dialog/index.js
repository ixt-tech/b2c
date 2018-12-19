import React from 'react';
import {
  Modal,
  Form,
  Button,
} from 'semantic-ui-react';
import './styles.css';

class WithdrawPoolDialog extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.state = {
      isValid: false,
      modalOpen: false,
      amount: ''
    };
  }

  handleChange(event, { name, value }) {
    this.setState({ amount: value });
  }

  handleSubmit = async (event) => {
    this.props.postSubmit(this.state.amount);
    this.setState({ amount: '' });
    this.setState({ modalOpen: false });
  }

  handleOpen = () => this.setState({ modalOpen: true })
  handleClose = () => this.setState({ modalOpen: false })

  render() {
    return (
      <Modal size='tiny' open={this.state.modalOpen} trigger={<Button negative onClick={this.handleOpen} onClose={this.handleClose}>Withdraw from pool</Button>}>
        <Modal.Header>Withdraw IXT from pool</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.handleSubmit}>
            <Form.Input placeholder='IXT amount' name='amount' value={this.state.amount} onChange={this.handleChange} />
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

export default WithdrawPoolDialog;
