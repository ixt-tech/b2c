import React from 'react';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import matchSorter from 'match-sorter'

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

    const events = await contract.getPastEvents('allEvents', {
      fromBlock: 6927652, // live contract deployed
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
    const data = this.state.rows;
    return (
      <div>
        <h2>Members</h2>
        <ReactTable
          data={data}
          filterable
          defaultFilterMethod={(filter, row) =>
            String(row[filter.id]) === filter.value}
          columns={[
            {
              Header: 'Event',
              accessor: 'title',
              width: 600,
              filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["title"] }),
              filterAll: true
            },
            {
              Header: 'Time',
              accessor: 'timestamp',
              width: 150,
              filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["timestamp"] }),
              filterAll: true
            },
            {
              Header: 'Transaction hash',
              accessor: 'transactionHash',
              width: 600,
            }
          ]}
          defaultSorted={[
            {
              id: "timestamp",
              desc: true
            }
          ]}
          defaultPageSize={20}
          pageSizeOptions={[20, 50, 100, 200, 300]}
          className="-striped"
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
