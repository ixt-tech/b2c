import React from 'react';
import {
  Divider,
  Grid,
  Segment,
} from 'semantic-ui-react';
import './styles.css';
import {fromBn} from "../../utils/number";
import { fromTimestamp } from '../../utils/date';

class InvitationGrid extends React.Component {

  state = { rows: [] }

  constructor(props) {
    super(props);
  }

  componentDidMount = async () => {
    const web3 = this.props.web3;
    const contract = this.props.contract;
    const account = this.props.account;

    const invitationRewards = await contract.getPastEvents('InvitationRewardGiven', {
      filter: { memberReceivingReward: account },
      fromBlock: 0,
      toBlock: 'latest'
    });
    let rows = [];
    for(let i = 0; i < invitationRewards.length; i++) {
      const invitationReward = invitationRewards[i].returnValues;
      if(invitationReward.memberReceivingReward == account) {
        const blockNumber = invitationRewards[i].blockNumber;
        const block = await web3.eth.getBlock(blockNumber);
        rows.push({
          key: i,
          rewardAmount: invitationReward.rewardAmount,
          timestamp: block.timestamp,
        });
      }
    }
    this.setState({rows: rows});
  }

  render() {
    return (
      <div>
        <h2>Invitation rewards</h2>
        <Divider />
        <Grid columns='equal'>
          { this.state.rows.map((row) => (
          <Grid.Row className='tx-row' children={this.state.rows} key={row.key}>
            <Grid.Column>{ fromBn(row.rewardAmount) } IXT</Grid.Column>
            <Grid.Column>{ fromTimestamp(row.timestamp) }</Grid.Column>
          </Grid.Row>
          ))}
        </Grid>
      </div>
    );
  }

}

export default InvitationGrid;
