import React from 'react';
import {
  Divider,
  Grid,
  Segment,
} from 'semantic-ui-react';
import './styles.css';
import { fromBn } from "../../utils/number";
import { fromTimestamp } from '../../utils/date';

class AdminEventGrid extends React.Component {

  state = { rows: [] }

  constructor(props) {
    super(props);
  }

  componentDidMount = async () => {
    const web3 = this.props.web3;
    const contract = this.props.contract;

    const events = await contract.getPastEvents('allEvents', {
      filter: { },
      fromBlock: 0,
      toBlock: 'latest'
    });
    let rows = [];
    for(let rowIndex = 0; rowIndex < events.length; rowIndex++) {
      const row = await this.generateRow(web3, rowIndex, events[rowIndex]);
      if(row) rows.push(row);
    }
    this.setState({rows: rows});
  }

  render() {
    return (
      <div>
        <h2>Events</h2>
        <Grid>
          <Grid.Row className='event-header'>
            <Grid.Column width={4}>Event</Grid.Column>
            <Grid.Column width={3}>Time</Grid.Column>
            <Grid.Column width={4}>Transaction</Grid.Column>
          </Grid.Row>
          { this.state.rows.map((row) => (
          <Grid.Row className='event-row' children={this.state.rows} key={row.key}>
            <Grid.Column width={4}>{ row.title }</Grid.Column>
            <Grid.Column width={3}>{ fromTimestamp(row.timestamp) }</Grid.Column>
            <Grid.Column width={4}>{ row.transactionHash }</Grid.Column>
          </Grid.Row>
          ))}
        </Grid>
      </div>
    );
  }

  async generateRow(web3, rowIndex, event) {
    const eventData = event.returnValues;
    const blockNumber = event.blockNumber;
    const block = await web3.eth.getBlock(blockNumber);
    let row = {
      key: rowIndex,
      timestamp: block.timestamp,
      transactionHash: event.transactionHash,
    };
    if(event.event == 'MemberAdded') {
      row.title = 'Your membership started';
      return row;
    } else if(event.event == 'StakeDeposited') {
      row.title = 'You staked ' + fromBn(eventData.stakeAmount);
      return row;
    } else if(event.event == 'StakeWithdrawn') {
      row.title = 'You withdrew your stake of ' + fromBn(eventData.stakeAmount);
      return row;
    } else if(event.event == 'InvitationRewardGiven') {
      row.title = 'You received an invitation reward of ' + fromBn(eventData.rewardAmount);
      return row;
    } else if(event.event == 'RewardClaimed') {
      row.title = 'You claimed rewards of ' + fromBn(eventData.rewardAmount);
      return row;
    }
    return undefined;

  }

}

export default AdminEventGrid;
