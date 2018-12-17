import React from 'react';
import {
  Form,
  Dropdown,
  Input,
  Label,
  Button,
  Segment,
  Select,
  Card,
  Grid,
} from 'semantic-ui-react';
import './styles.css';
import { fromBn, toBn } from '../../utils/number';
import { fromTimestamp } from '../../utils/date';

class Stake extends React.Component {

  state = {stakeBalance: 0, stake: 0};

  constructor(props) {
    super(props);
    this.handleDeposit = this.handleDeposit.bind(this);
    this.handleWithdraw = this.handleWithdraw.bind(this);
  }

  componentDidMount = async () => {
    const contract = await this.props.contract;
    const account = await this.props.account;
    const member = await this.props.member;
    this.setState({ stakeBalance: fromBn(member.stakeBalance), stakedAt: fromTimestamp(member.joinedTimestamp) });
  }

  handleChange = (e, { value }) => {
    this.setState({ stake: value });
  }

  handleDeposit = async (event) => {
    const contract = await this.props.contract;
    const ixtContract = await this.props.ixtContract;
    const stake = this.state.stake;
    await ixtContract.approve(contract.address, 100000000000000, {from: this.props.account});
    await contract.join(stake, {from: this.props.account});
  }

  handleWithdraw = async (event) => {
    const contract = await this.props.contract;
    contract.cancelMembership({from: this.props.account});
  }

  options = [
    { key: '1000', text: '1000 IXT', value: 0 },
    { key: '5000', text: '5000 IXT', value: 1 },
    { key: '10000', text: '10000 IXT', value: 2 },
  ]

  render() {
    if(this.state.stakeBalance > 0) {
      return (
        <Card>
          <Card.Content>
            <Card.Header>Stake</Card.Header>
            <Card.Meta>Stake deposited on: {this.state.stakedAt}</Card.Meta>
            <Card.Description>
              <Form onSubmit={this.handleWithdraw}>
                <Grid>
                  <Grid.Column width={9}>
                    <h1>{this.state.stakeBalance} IXT</h1>
                  </Grid.Column>
                  <Grid.Column width={2}>
                    <Button inverted>Withdraw</Button>
                  </Grid.Column>
                </Grid>
              </Form>
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
                    <Dropdown selection width={14} options={this.options} placeholder='Stake amount' onChange={this.handleChange} />
                  </Grid.Column>
                  <Grid.Column width={4}>
                    <Form.Button inverted content='Deposit'/>
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
