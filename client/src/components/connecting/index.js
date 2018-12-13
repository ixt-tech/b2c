import React from 'react';
import {
  Dimmer,
  Loader,
  Segment,
} from 'semantic-ui-react';
import './styles.css';

class Connecting extends React.Component {

  render() {
    return (
      <Dimmer active inverted>
        <Loader inverted>Connecting to IXT Protect</Loader>
      </Dimmer>
    )
  }

}

export default Connecting;
