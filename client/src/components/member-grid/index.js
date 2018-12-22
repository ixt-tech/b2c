import React from 'react';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import matchSorter from 'match-sorter'
import './styles.css';

class MemberGrid extends React.Component {

  state = { columns: [] }

  constructor(props) {
    super(props);
  }

  render() {
    const data = this.props.members;
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
          ]}
          defaultPageSize={20}
          pageSizeOptions={[20, 50, 100, 200, 300]}
          className="-striped"
        />
      </div>
    );
  }

}

export default MemberGrid;
