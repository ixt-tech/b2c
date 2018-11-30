import React from 'react';
import {
  Input,
  Label,
  Button,
} from 'semantic-ui-react';
import './styles.css';

class Withdraw extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.web3 = this.props.web3;
    this.state = {amount: 0.00, isValid: false};
  }

  handleChange(event) {
    this.setState({amount: event.target.value});
    if(event.target.value && event.target.value > 0) {
      this.setState({isValid: true});
    } else {
      this.setState({isValid: false});
    }
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    const amount = this.state.amount;
    return (
      <form onSubmit={this.handleSubmit}>
        <Input labelPosition='left' type='number' placeholder='Amount...' >
          <Label basic>IXT</Label>
          <input value={this.state.amount} onChange={this.handleChange} />
          <Button type='submit' onClick={this.handleSubmit} disabled={!this.state.isValid}>Withdraw</Button>
        </Input>
      </form>
    );
  }

}

export default Withdraw;
