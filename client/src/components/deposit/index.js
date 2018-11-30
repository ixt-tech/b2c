import React from 'react';
import {
  Input,
  Label,
  Button,
  Segment,
} from 'semantic-ui-react';
import './styles.css';

class Deposit extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {amount: 0.00, isValid: false, contract: this.props.contract};
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
//    await this.state.contract.deposit(123).then(function(result) {
//      alert(result);
//    });
    event.preventDefault();
  }

  render() {
    const amount = this.state.amount;
    return (
      <div>
        <h2>Deposit</h2>
        Deposit to your IXT Protect account. By entering the amount and clicking Deposit you will approve a
        transaction from your account to the IXT Protect pool.
        <Segment>
          <form onSubmit={this.handleSubmit}>
            <Input labelPosition='left' type='number' placeholder='Amount...' >
              <Label basic>IXT</Label>
              <input value={this.state.amount} onChange={this.handleChange} />
              <Button type='submit' onClick={this.handleSubmit} disabled={!this.state.isValid}>Deposit</Button>
            </Input>
          </form>
        </Segment>
      </div>
    );
  }

}

export default Deposit;
