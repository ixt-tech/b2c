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
import { fromBn, toBn } from '../../utils/number';

class Reward extends React.Component {

  state = { rewardBalance: 0 };

  constructor(props) {
    super(props);
    this.handleWithdraw = this.handleWithdraw.bind(this);
  }

  componentDidMount = async () => {
    const contract = await this.props.contract;
    const account = await this.props.account;
    const member = await contract.members(account);
    if(member.joinedTimestamp != 0) {
      const rewardBalance = await contract.getRewardBalance(account);
      this.setState({rewardBalance: fromBn(rewardBalance)});
    }
  }

  handleWithdraw = async (event) => {
    const contract = await this.props.contract;
    await contract.claimRewards({from: this.props.account});
    event.preventDefault();
  }

  render() {
    return (
      <Card>
        <Card.Content>
          <Card.Header>Reward balance</Card.Header>
          <Card.Meta>Your current reward balance</Card.Meta>
          <Card.Description>
            <Grid>
              <Grid.Column width={9}>
                <h1>{this.state.rewardBalance} IXT</h1>
              </Grid.Column>
              <Grid.Column width={2}>
                {this.state.rewardBalance > 0 &&
                <Button inverted onClick={this.handleWithdraw}>Withdraw</Button>
                }
              </Grid.Column>
            </Grid>
          </Card.Description>
        </Card.Content>
      </Card>
    )
  }

}

export default Reward;
