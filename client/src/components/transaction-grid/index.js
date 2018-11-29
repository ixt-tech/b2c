import React from 'react';
import {
  Divider,
  Grid,
} from 'semantic-ui-react';
import './styles.css';

class TransactionGrid extends React.Component {

  render() {
    return (
      <div>
        <h2>Transactions</h2>
        <Divider />
        <Grid columns='equal'>
          <Grid.Row className='tx-row'>
            <Grid.Column>01-Dec-2018 23:02:33</Grid.Column>
            <Grid.Column>0x11213132313wdsd2edsadads</Grid.Column>
            <Grid.Column>1,200 IXT</Grid.Column>
            <Grid.Column>Stake</Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }

}

export default TransactionGrid;
