import React from 'react';
import {
  Form,
  Input,
  Label,
  Button,
  Segment,
} from 'semantic-ui-react';
import './styles.css';

class Withdraw extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {isValid: false, contract: this.props.contract};
  }

  handleChange(event) {
    this.setState({amount: event.target.value});
    if(event.target.value && event.target.value > 0) {
      this.setState({isValid: true});
    } else {
      this.setState({isValid: false});
    }
  }

  handleSubmit = async (event) => {
    const contract = this.state.contract;
    await contract.deposit(123);
    event.preventDefault();
  }

  render() {
    const amount = this.state.amount;
    return (
      <div>
        <h2>Withdraw</h2>
        Withdraw the rewards you have earned.
        <Segment className='withdraw'>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group>
              <Form.Input placeholder='Name' width={14} name='name' value={this.state.amount} onChange={this.handleChange} />
              <Form.Button content='Withdraw' />
            </Form.Group>
          </Form>
        </Segment>
      </div>
    );
  }

}

export default Withdraw;
