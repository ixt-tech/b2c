import React from 'react';
import {
  Table,
} from 'semantic-ui-react';
import './styles.css';
import { asNum, fromBn } from "../../utils/number";

class Levels extends React.Component {

  state = { invitationReward: 0, loyaltyReward: 0, loyaltyPeriod: 90, poolSize: 0, memberDeposits: 0, numberOfMembers: 0 };

  constructor(props) {
    super(props);
  }

  componentDidMount = async () => {
    const contract = this.props.contract;
    const member = this.props.member;
    const invitationReward = await contract.invitationReward();
    const loyaltyReward = await contract.loyaltyRewardAmount();
    const stakeBalance = await member.stakeBalance;
    const ixtloyaltyReward = fromBn(loyaltyReward / 100 * stakeBalance);
    const loyaltyPeriod = await contract.loyaltyPeriodDays();
    const poolSize = await contract.totalMemberBalance();
    const memberDeposits = await contract.totalPoolBalance();
    const numberOfMembers = await contract.getMembersArrayLength();
    this.setState({
      invitationReward: fromBn(invitationReward),
      loyaltyReward: ixtloyaltyReward,
      loyaltyPeriod: asNum(loyaltyPeriod),
      poolSize: fromBn(poolSize) + fromBn(memberDeposits),
      numberOfMembers: asNum(numberOfMembers)
    });
  }

  render() {
    return (
      <div>
        <h2>Current levels</h2>
        <Table definition>
          <Table.Body>
            <Table.Row>
              <Table.Cell width={4}>Invitation reward</Table.Cell>
              <Table.Cell>{ this.state.invitationReward } IXT</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Loyalty reward</Table.Cell>
              <Table.Cell>{ this.state.loyaltyReward } IXT</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Loyalty period</Table.Cell>
              <Table.Cell>{ this.state.loyaltyPeriod } days</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Pool size</Table.Cell>
              <Table.Cell>{ this.state.poolSize } IXT</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Number of members</Table.Cell>
              <Table.Cell>{ this.state.numberOfMembers }</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    );
  }

}

export default Levels;
