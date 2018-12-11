import React from 'react';
import {
  Form,
  Input,
  Label,
  Button,
  Segment,
  Select,
  Card,
  Grid,
} from 'semantic-ui-react';
import './styles.css';

class Stake extends React.Component {

  state = {stakeBalance: 0};

  constructor(props) {
    super(props);
    this.handleDeposit = this.handleDeposit.bind(this);
    this.handleWithdraw = this.handleWithdraw.bind(this);
  }

  componentDidMount = async () => {
    const contract = await this.props.contract;
    const account = await this.props.account;
    const member = await contract.members(account);
    this.setState({stakeBalance: 0});//member.stakeBalance.toString()});
  }

  handleDeposit = async (event) => {
    const contract = await this.props.contract;
    const account = await this.props.account;
    contract.join(1000, '0x00', {from: account});
    event.preventDefault();
  }

  handleWithdraw = async (event) => {
    event.preventDefault();
  }

  options = [
    { key: '1000', text: '1000 IXT', value: '1000' },
    { key: '5000', text: '5000 IXT', value: '5000' },
    { key: '10000', text: '10000 IXT', value: '10000' },
  ]

  render() {
    if(this.state.stakeBalance > 0) {
      return (
        <Card>
          <Card.Content>
            <Card.Header>Stake</Card.Header>
            <Card.Meta>Your current stake balance</Card.Meta>
            <Card.Description>
              <Grid>
                <Grid.Column width={9}>
                  <h1>{this.state.stakeBalance} IXT</h1>
                </Grid.Column>
                <Grid.Column width={2}>
                  <Button>Withdraw</Button>
                </Grid.Column>
              </Grid>
            </Card.Description>
          </Card.Content>
        </Card>
      )
    } else {
      return (
        <Card>
          <Card.Content>
            <Card.Header>Stake</Card.Header>
            <Card.Meta>You are currently not staking IXT</Card.Meta>
            <Card.Description>
              <Form onSubmit={this.handleDeposit}>
                <Grid>
                  <Grid.Column width={10}>
                    <Form.Field control={Select} width={14} options={this.options} placeholder='Stake amount'/>
                  </Grid.Column>
                  <Grid.Column width={4}>
                    <Form.Button content='Deposit'/>
                  </Grid.Column>
                </Grid>
              </Form>
            </Card.Description>
          </Card.Content>
        </Card>
      )
    }
  }

}

export default Stake;
