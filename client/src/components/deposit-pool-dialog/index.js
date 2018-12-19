import React from 'react';
import {
  Modal,
  Form,
  Button,
} from 'semantic-ui-react';
import './styles.css';

class DepositPoolDialog extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.state = {
      isValid: false,
      modalOpen: false,
      deposit: ''
    };
  }

  handleChange(event, { name, value }) {
    this.setState({ deposit: value });
  }

  handleSubmit = async (event) => {
    this.props.postSubmit(this.state.deposit);
    this.setState({ deposit: '' });
    this.setState({ modalOpen: false });
  }

  handleOpen = () => this.setState({ modalOpen: true })
  handleClose = () => this.setState({ modalOpen: false })

  render() {
    return (
      <Modal size='tiny' open={this.state.modalOpen} trigger={<Button positive onClick={this.handleOpen} onClose={this.handleClose}>Deposit to pool</Button>}>
        <Modal.Header>Deposit IXT to pool</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.handleSubmit}>
            <Form.Input placeholder='IXT amount' name='deposit' value={this.state.deposit} onChange={this.handleChange} />
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

export default DepositPoolDialog;
