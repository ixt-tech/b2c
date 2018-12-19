import React from 'react';
import {
  Modal,
  Form,
  Button,
} from 'semantic-ui-react';
import './styles.css';

class Pause extends React.Component {

  state = { paused: false };
  constructor(props) {
    super(props);
    this.pause = this.pause.bind(this);
  }

  componentDidMount = async () => {
    const contract = await this.props.contract;
    const paused = await contract.paused();
    this.setState({ paused: paused });
  }

  pause = async (event) => {
    const contract = await this.props.contract;
    const account = await this.props.account;
    if(this.state.paused) {
      await contract.unpause({from: account});
    } else {
      await contract.pause({from: account});
    }
    this.setState({ paused: !this.state.paused });
  }

  render() {
    let title = this.state.paused ? 'Unpause' : 'Pause';
    return (
      <Button negative={!this.state.paused} positive={this.state.paused} onClick={this.pause}>{title}</Button>
    );
  }

}

export default Pause;
