import React from 'react';
import {
  Divider,
  Grid,
  Segment,
} from 'semantic-ui-react';
import './styles.css';
import {fromBn} from "../../utils/number";
import { fromTimestamp } from '../../utils/date';

class EventGrid extends React.Component {

  state = { rows: [] }

  constructor(props) {
    super(props);
  }

  componentDidMount = async () => {
    const web3 = this.props.web3;
    const contract = this.props.contract;
    const account = this.props.account;

    const events = await contract.getPastEvents('MemberAdded', {
      filter: { memberAddress: account },
      fromBlock: 0,
      toBlock: 'latest'
    });
    let rows = [];
    for(let i = 0; i < events.length; i++) {
      const event = events[i];
      const eventData = event.returnValues;
      const blockNumber = event.blockNumber;
      const block = await web3.eth.getBlock(blockNumber);
      rows.push({
        key: i,
        title: this.getEventTitle(account, event, eventData),
        timestamp: block.timestamp,
        transactionHash: event.transactionHash,
      });
    }
    this.setState({rows: rows});
  }

  render() {
    return (
      <div>
        <h2>Account History</h2>
        <Divider />
        <Grid>
          { this.state.rows.map((row) => (
          <Grid.Row className='tx-row' children={this.state.rows} key={row.key}>
            <Grid.Column width={6}>{ row.title }</Grid.Column>
            <Grid.Column width={3}>{ fromTimestamp(row.timestamp) }</Grid.Column>
            <Grid.Column>{ row.transactionHash }</Grid.Column>
          </Grid.Row>
          ))}
        </Grid>
      </div>
    );
  }

  getEventTitle(account, event, eventData) {

    if(event.event == 'MemberAdded' && eventData.memberAddress == account) {
      return 'Your membership started';
    }
    return '';

  }

}

export default EventGrid;
