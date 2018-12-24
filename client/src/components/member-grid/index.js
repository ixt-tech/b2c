import React from 'react';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import matchSorter from 'match-sorter'
import './styles.css';
import {fromTimestamp, fromDate} from "../../utils/date";
import {fromBn} from "../../utils/number";
import TableExport from "../table-export";

class MemberGrid extends React.Component {

  constructor(props) {
    super(props);
    this.state = { members: [], addresses: [], columns: [] };
  }

  componentDidMount = async () => {
    const columns = [
      {
        Header: 'Member ID',
        accessor: 'membershipNumber',
        width: 100,
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["membershipNumber"] }),
        filterAll: true
      },
      {
        Header: 'Wallet address',
        accessor: 'memberAddress',
        width: 400,
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["memberAddress"] }),
        filterAll: true
      },
      {
        Header: 'Added at',
        accessor: 'addedTimestamp',
        width: 150,
      },
      {
        Header: 'Staked at',
        accessor: 'stakedTimestamp',
        width: 100,
      },
      {
        Header: 'Stake',
        accessor: 'stakeBalance',
        width: 100,
      },
      {
        Header: 'Invitation reward',
        accessor: 'invitationBalance',
        width: 100,
      },
      {
        Header: 'Loyalty reward',
        accessor: 'loyaltyBalance',
        width: 100,
      },
      {
        Header: 'Invitation code',
        accessor: 'invitationCode',
        width: 100,
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["invitationCode"] }),
        filterAll: true
      },
      {
        Header: 'Products',
        accessor: 'productsCovered',
        width: 200,
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["productsCovered"] }),
        filterAll: true
      },
    ];
    this.setState({columns: columns});

    const web3 = this.props.web3;
    const contract = this.props.contract;
    const length = await contract.getMembersArrayLength();
    const members = [];
    const addresses = [];
    for(let i = 0; i < length; i++) {
      const address = await contract.membersArray(i);
      addresses.push(address);
      let m = await contract.members(address);
      let loyaltyBalance = 0;
      let invitationBalance = 0;
      if(m.stakeTimestamp.toNumber() > 0) {
        loyaltyBalance = fromBn(await contract.getLoyaltyRewardBalance(address));
        invitationBalance = fromBn(m.invitationRewards);
      }
      let member = {
        membershipNumber: web3.utils.toAscii(m.membershipNumber),
        memberAddress: address,
        productsCovered: '',
        addedTimestamp: fromTimestamp(m.addedTimestamp),
        stakedTimestamp: fromTimestamp(m.stakeTimestamp),
        invitationCode: web3.utils.toAscii(m.invitationCode),
        stakeBalance: fromBn(m.stakeBalance),
        loyaltyBalance: loyaltyBalance,
        invitationBalance: invitationBalance
      }
      members.push(member);
    }
    this.setState({
      members: members,
      addresses: addresses,
    });
  }

  render() {
    const { members, addresses, columns } = this.state;
    const fileName = 'member-export-' + fromDate(new Date()) + '.csv';
    return (
      <div>
        <h2>Members</h2>
        <TableExport columns={columns} table={this.reactTable} fileName={fileName} />
        <ReactTable
          ref={(r) => this.reactTable = r}
          data={members}
          filterable
          noDataText=''
          defaultFilterMethod={(filter, row) =>
            String(row[filter.id]) === filter.value}
          columns={columns}
          defaultPageSize={20}
          pageSizeOptions={[20, 50, 100, 200, 300]}
          className="-striped -highlight"
        />
      </div>
    );
  }

}

export default MemberGrid;
