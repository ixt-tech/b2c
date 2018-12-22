import React from 'react';
import ReactDataGrid from 'react-data-grid';

import './styles.css';
import { fromBn } from "../../utils/number";
import { fromTimestamp } from '../../utils/date';

class AdminEventGrid extends React.Component {

  state = { columns: [], rows: [] }

  constructor(props) {
    super(props);
  }

  componentDidMount = async () => {
    const web3 = this.props.web3;
    const contract = this.props.contract;

    const defaultProps = {
      resizable: true
    };
    const columns = [
      { key: 'title', name: 'Event', width: 600 },
      { key: 'timestamp', name: 'Time', width: 150 },
      { key: 'transactionHash', name: 'Transaction hash', width: 600 }
    ].map(c => ({ ...c, ...defaultProps }));
    const events = await contract.getPastEvents('MemberAdded', {
      fromBlock: 6927652, // live contract deployed
      toBlock: 'latest'
    });

    let rows = [];
    for(let rowIndex = 0; rowIndex < events.length; rowIndex++) {
      const row = await this.generateRow(web3, rowIndex, events[rowIndex]);
      if(row) rows.push(row);
    }
    this.setState({columns: columns, rows: rows});
  }

  render() {
    const columns = this.state.columns;
    const rows = this.state.rows;
    return (
      <div>
        <h2>Events</h2>
        <ReactDataGrid
          columns={columns}
          rowGetter={i => rows[i]}
          rowsCount={rows.length}
          minHeight={500}
          enableCellSelect={true}
        />
      </div>
    );
  }

  async generateRow(web3, rowIndex, event) {
    const eventData = event.returnValues;
    const blockNumber = event.blockNumber;
    const block = await web3.eth.getBlock(blockNumber);
    let row = {
      key: rowIndex,
      timestamp: fromTimestamp(block.timestamp),
      transactionHash: event.transactionHash,
    };
    if(event.event == 'MemberAdded') {
      row.title = 'New member added ' + eventData.memberAddress;
      return row;
    } else if(event.event == 'StakeDeposited') {
      row.title = 'Member ' + eventData.memberAddress + ' staked ' + fromBn(eventData.stakeAmount) + ' IXT';
      return row;
    } else if(event.event == 'StakeWithdrawn') {
      row.title = 'Member ' + eventData.memberAddress + ' withdrew ' + fromBn(eventData.stakeAmount) + ' IXT';
      return row;
    } else if(event.event == 'RewardClaimed') {
      row.title = 'Member ' + eventData.memberAddress + ' claimed reward of ' + fromBn(eventData.stakeAmount) + ' IXT';
      return row;
    } else if(event.event == 'InvitationRewardGiven') {
      row.title = 'Member ' + eventData.memberReceivingReward + ' received ' + fromBn(eventData.rewardAmount) + ' IXT for inviting ' + eventData.memberGivingReward;
      return row;
    } else if(event.event == 'PoolDeposit') {
      row.title = 'Deposited ' + fromBn(eventData.amount) + ' IXT to pool';
      return row;
    } else if(event.event == 'PoolWithdraw') {
      row.title = 'Withdrew ' + fromBn(eventData.amount) + ' IXT from pool';
      return row;
    } else if(event.event == 'AdminRemovedMember') {
      row.title = 'Member removed ' + eventData.userAddress + ' and refunded ' + eventData.refundIssued + ' IXT';
      return row;
    } else if(event.event == 'MemberDrained') {
      row.title = 'Member ' + eventData.memberAddress + ' drained and was refunded ' + fromBn(eventData.amountRefunded) + ' IXT';
      return row;
    } else if(event.event == 'PoolDrained') {
      row.title = 'The member balance was drained of ' + fromBn(eventData.amountRefunded) + ' IXT';
      return row;
    } else if(event.event == 'ContractDrained') {
      row.title = 'The pool was drained';
      return row;
    } else if(event.event == 'InvitationRewardChanged') {
      row.title = 'The invitation reward was changed to ' + fromBn(eventData.newInvitationReward) + ' IXT';
      return row;
    } else if(event.event == 'LoyaltyRewardChanged') {
      row.title = 'The loyalty reward was changed to ' + eventData.newLoyaltyRewardAmount + ' %';
      return row;
    }
    return undefined;

  }

}

export default AdminEventGrid;
