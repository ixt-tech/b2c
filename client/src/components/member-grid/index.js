import React from 'react';
import ReactDataGrid from 'react-data-grid';
import { Toolbar, Data, Filters } from "react-data-grid-addons";

import './styles.css';

class MemberGrid extends React.Component {

  state = { columns: [] }

  constructor(props) {
    super(props);
  }

  componentDidMount = async () => {
    const defaultProps = {
      resizable: true
    };
    const columns = [
      { key: 'membershipNumber', name: 'Member ID', width: 100 },
      { key: 'memberAddress', name: 'Wallet address', width: 400 },
      { key: 'addedTimestamp', name: 'Added at', width: 150 },
      { key: 'stakedTimestamp', name: 'Staked at', width: 150 },
      { key: 'stakeBalance', name: 'Stake', width: 100 },
      { key: 'invitationBalance', name: 'Invitations', width: 100 },
      { key: 'loyaltyBalance', name: 'Loyalty', width: 100 },
      { key: 'invitationCode', name: 'Invitation code', width: 100 },
      { key: 'productsCovered', name: 'Products', width: 200 }
    ].map(c => ({ ...c, ...defaultProps }));

    this.setState({ columns: columns });
  }

  render() {
    return (
      <div>
        <h2>Members</h2>
        <ReactDataGrid
          columns={this.state.columns}
          rowGetter={i => this.props.members[i]}
          rowsCount={this.props.members.length}
          minHeight={500}
          enableCellSelect={true}
        />
      </div>
    );
  }

}

export default MemberGrid;
