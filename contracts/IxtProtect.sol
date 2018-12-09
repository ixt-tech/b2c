pragma solidity 0.5.1;

import "./lib/Ownable.sol";
import "./lib/IERC20.sol";
import "./lib/SafeMath.sol";
import "./lib/Pausable.sol";
import "./lib/ValidatorRole.sol";

contract IxtEvents {

  event Authorised(
    address memberAddress,
    uint256 membershipNumber
  );

  event Joined(
    address memberAddress,
    uint256 membershipNumber
  );

  event Deposited(
    address memberAddress,
    uint256 amountDeposited    
  );

  event Withdrawn(
    address memberAddress,
    uint256 amountWithdrawn
  );

  event MemberCancelled(
    address memberAddress,
    uint256 amountRefunded
  );

  event PoolDeposit(
    address depositer,
    uint256 amount
  );

  event MemberRefunded(
    address memberAddress,
    uint256 amountRefunded
  );

  event PoolBalanceRefunded(
    address refundRecipient,
    uint256 amountRefunded
  );

  event ContractDrained(
    address drainInitiator
  );

}

contract RoleManager is Ownable, Pausable, ValidatorRole {

  constructor(address validator)
    public
    ValidatorRole(validator)
  {}
}

contract StakeManager {

  /*      Function modifiers      */

  modifier isValidStakeLevel(StakeLevel level) {
    require(
      uint8(level) >= 0 && uint8(level) <= 2,
      "Is not valid a staking level."
    );
    _;
  }

  /*      Data types      */

  enum StakeLevel { LOW, MEDIUM, HIGH }

  /*      Variable declarations      */

  /// @dev the defined staking amount for each level
  uint256[3] public ixtStakingLevels;

  /*      Constructor      */

  constructor(
    uint256[3] memory _ixtStakingLevels
  ) public {
    ixtStakingLevels = _ixtStakingLevels;
  }

}

contract RewardManager {

  /*      Data types      */

  struct LoyaltyReward {
    uint256 changeTimestamp;
    uint256 loyaltyRewardPercentage;
  }

  /*      Variable declarations      */

  /// @dev the reward received when inviting someone
  uint256 public invitationReward;
  /// @dev the period after which a member gets a loyalty reward
  uint256 public loyaltyPeriod;
  /// @dev contains all times the loyalty reward amount was changed
  LoyaltyReward[] public loyaltyRewardChanges;

  /*      Constructor      */

  constructor(
    uint256 _invitationReward,
    uint256 _loyaltyRewardPercentage,
    uint256 _loyaltyPeriod
  ) public {
    require(
      _loyaltyRewardPercentage >= 0 &&
      _loyaltyRewardPercentage <= 100,
      "Loyalty reward percentage must be between 0 and 100."
    );
    invitationReward = _invitationReward;
    loyaltyPeriod = _loyaltyPeriod;
    LoyaltyReward memory loyaltyReward = LoyaltyReward({
      changeTimestamp: block.timestamp,
      loyaltyRewardPercentage: _loyaltyRewardPercentage
    });
    loyaltyRewardChanges.push(loyaltyReward);
  }

}

contract IxtProtect is IxtEvents, RoleManager, StakeManager, RewardManager {

  /*      Function modifiers      */

  modifier userNotAuthorised(address memberAddress) {
    require(
      members[memberAddress].authorisedTimestamp == 0,
      "Member is already authorised."
    );
    _;
  }

  modifier userIsAuthorised(address memberAddress) {
    require(
      members[memberAddress].authorisedTimestamp != 0,
      "Member is not authorised."
    );
    _;
  }

  modifier userNotJoined(address memberAddress) {
    require(
      members[memberAddress].joinedTimestamp == 0,
      "Member has already joined."
    );
    _;
  }

  modifier userIsJoined(address memberAddress) {
    require(
      members[memberAddress].joinedTimestamp != 0,
      "Member has not joined."
    );
    _;
  }

  /*      Data types      */

  struct Member {
    uint256 authorisedTimestamp;
    uint256 joinedTimestamp;
    uint256 timestampOfPreviousClaim;
    uint256 membershipNumber;
    bytes32 invitationCode;
    uint256 stakeBalance;
    uint256 invitationRewards;
  }

  /*      Variable declarations      */

  /// @dev the IXT ERC20 Token contract
  IERC20 public ixtToken;
  /// @dev a mapping from member wallet addresses to Member struct
  mapping(address => Member) public members;
  /// @dev the same data as `members`, but iterable
  address[] public membersArray;
  /// @dev the total balance of all members
  uint256 public totalMemberBalance;
  /// @dev the total pool balance
  uint256 public totalPoolBalance;
  /// @notice a mapping from invitationCode => memberAddress, so invitation rewards can be applied.
  mapping(bytes32 => address) public memberInvitationCodes;
 

  /*      Constants      */
  uint256 public constant IXT_DECIMALS = 8;

  /*      Constructor      */

  constructor(
    address _validator,
    uint256 _loyaltyPeriod,
    address _ixtToken,
    uint256 _invitationReward,
    uint256 _loyaltyRewardPercentage,
    uint256[3] memory _ixtStakingLevels
  )
    public
    RoleManager(_validator)
    StakeManager(_ixtStakingLevels)
    RewardManager(_invitationReward, _loyaltyRewardPercentage, _loyaltyPeriod)
  {
    require(_ixtToken != address(0x0), "ixtToken address was set to 0.");
    ixtToken = IERC20(_ixtToken);
  }

  /*                            */
  /*      PUBLIC FUNCTIONS      */
  /*                            */

  /*      (member control)      */


  /// @notice Registers new user as a member after the KYC process
  /// @notice This function should not add the invitationCode
  /// to the mapping yet, this should only happen after join
  function authoriseUser(
    uint256 _membershipNumber,
    address _memberAddress,
    bytes32 _invitationCode
  ) 
    public
    onlyValidator
    userNotAuthorised(_memberAddress)
    userNotJoined(_memberAddress)
  {
    require(
      _memberAddress != address(0x0),
      "Member address was set to 0."
    );
    Member memory member = Member({
      authorisedTimestamp: block.timestamp,
      joinedTimestamp: 0,
      timestampOfPreviousClaim: 0,
      membershipNumber: _membershipNumber,
      invitationCode: _invitationCode,
      stakeBalance: 0,
      invitationRewards: 0
    });
    members[_memberAddress] = member;
    membersArray.push(_memberAddress);
    emit Authorised(_memberAddress, _membershipNumber);
  }

  /// @notice Called by a member once they have been approved to join the scheme
  function join(StakeLevel _stakeLevel)
    public
    whenNotPaused()
    userIsAuthorised(msg.sender)
    userNotJoined(msg.sender)
    isValidStakeLevel(_stakeLevel)
  {
    deposit(msg.sender, ixtStakingLevels[uint256(_stakeLevel)], false);
    Member storage member = members[msg.sender];
    member.joinedTimestamp = block.timestamp;
    // Add invitation code...
    emit Joined(msg.sender, member.membershipNumber);
  }

  // function cancelMembership()
  //   public
  //   whenNotPaused()
  //   userIsJoined(msg.sender)
  // {
  //   cancelMembershipInternal(msg.sender);
  // }


  // /// @notice Allows member to deposit funds to increase their stake
  // function deposit(uint256 amount)
  //   public
  //   whenNotPaused()
  //   userIsJoined(msg.sender)
  // {
  //   deposit(msg.sender, amount, false);
  // }

/*
  function withdraw(uint256 amount)
    public
    whenNotPaused()
    userIsJoined(msg.sender)
  {
    Member storage member = members[msg.sender];
    uint256 elapsedTime = block.timestamp - member.joinedTimestamp;
    require(
      elapsedTime >= minimumStakePeriodSeconds,
      "Minimum stake period is not complete."
    );
    bool sufficientBalance = (member.stakeBalance + member.rewardBalance) > amount;
    require(
      sufficientBalance &&
      ixtToken.transfer(msg.sender, amount),
      "Unable to withdraw this value of IXT."  
    );
    uint256 amountToTake = amount;
    if (member.rewardBalance > 0) {
      if (member.rewardBalance >= amountToTake) {
        member.rewardBalance = SafeMath.sub(member.rewardBalance, amountToTake);
        amountToTake = 0;
      } else {
        member.rewardBalance = 0;
        amountToTake = SafeMath.sub(amountToTake, member.rewardBalance);
      }
    }
    if (amountToTake > 0) {
      require(
        member.stakeBalance >= amountToTake,
        "Cannot withdraw this value of IXT."
      );
      member.stakeBalance = SafeMath.sub(member.stakeBalance, amountToTake);
      amountToTake = 0;
    }
    totalMemberBalance = SafeMath.sub(totalMemberBalance, amount);

    if (member.stakeBalance < MINIMUM_STAKE) {
      cancelMembership(msg.sender);
    }

    emit Withdrawn(msg.sender, amount);
  }
*/

  /*      (admin functions)      */

  // function depositPool(uint256 amountToDeposit)
  //   public
  //   onlyOwner
  // {
  //   deposit(msg.sender, amountToDeposit, true);
  // }

  // function withdrawPool(uint256 amountToWithdraw)
  //   public
  //   onlyOwner
  // {
  //   if (amountToWithdraw > 0) {
  //     require(
  //       totalPoolBalance >= amountToWithdraw &&
  //       ixtToken.transfer(msg.sender, amountToWithdraw),
  //       "Unable to withdraw this value of IXT."  
  //     );
  //     totalPoolBalance = SafeMath.sub(totalPoolBalance, amountToWithdraw);
  //   }
  // }

  // /// @dev Can be called if user is authorised or joined
  // function removeMember(address userAddress)
  //   public
  //   userIsAuthorised(userAddress)
  //   onlyOwner
  // {
  //   cancelMembershipInternal(userAddress);
  // }

  // function drain() public onlyOwner {
  //   /// @dev Refund and delete all members
  //   for (uint256 index = 0; index < membersArray.length; index++) {
  //     address memberAddress = membersArray[index];
  //     uint256 amountRefunded = refundUserBalance(memberAddress);
  //     delete members[memberAddress];

  //     emit MemberRefunded(memberAddress, amountRefunded);
  //   }
  //   delete membersArray;

  //   /// @dev Refund the pool balance
  //   require(
  //     ixtToken.transfer(msg.sender, totalPoolBalance),
  //     "Unable to withdraw this value of IXT."
  //   );
  //   emit PoolBalanceRefunded(msg.sender, totalPoolBalance);
  //   totalPoolBalance = 0;
    
  //   emit ContractDrained(msg.sender);
  // }

  // /*      (getter functions)      */

  // function getAccountBalance(address memberAddress)
  //   public
  //   view
  //   userIsJoined(memberAddress)
  //   returns (uint256)
  // {
  //   return SafeMath.add(
  //     getStakeBalance(memberAddress),
  //     getRewardBalance(memberAddress)
  //   );
  // }

  // function getStakeBalance(address memberAddress)
  //   public
  //   view
  //   userIsJoined(memberAddress)
  //   returns (uint256)
  // {
  //   return members[memberAddress].stakeBalance;
  // }

  // function getRewardBalance(address memberAddress)
  //   public
  //   view
  //   userIsJoined(memberAddress)
  //   returns (uint256)
  // {
  //   /// @dev TODO - Change this to calculate the correct withdraw amount
  //   return members[memberAddress].invitationRewards;
  // }

  // /*      (setter functions)      */

  // function setInvitationReward(uint256 _invitationReward)
  //   public
  //   onlyOwner
  // {
  //   invitationReward = _invitationReward;
  // }

  // /*                              */
  // /*      INTERNAL FUNCTIONS      */
  // /*                              */

  // function cancelMembershipInternal(address memberAddress) internal {
  //   uint256 amountRefunded = refundUserBalance(memberAddress);

  //   delete members[memberAddress];

  //   removeMemberFromArray(memberAddress);

  //   emit MemberCancelled(memberAddress, amountRefunded);
  // }

  // function refundUserBalance(
  //   address memberAddress
  // ) 
  //   internal
  //   returns (uint256 amountRefunded)
  // {
  //   Member storage member = members[memberAddress];

  //   uint256 amountToRefund = getAccountBalance(memberAddress);
  //   bool userJoined = member.joinedTimestamp != 0;
  //   if (amountToRefund > 0 && userJoined) {
  //     require(
  //       ixtToken.transfer(memberAddress, amountToRefund),
  //       "Unable to withdraw this value of IXT."  
  //     );
  //     totalMemberBalance = SafeMath.sub(totalMemberBalance, amountToRefund);
  //   }
  //   return amountToRefund;
  // }

  // function removeMemberFromArray(address memberAddress) internal {
  //   /// @dev removing the member address from the membersArray
  //   for (uint256 index; index < membersArray.length; index++) {
  //     if (membersArray[index] == memberAddress) {
  //       membersArray[index] = membersArray[membersArray.length - 1];
  //       membersArray.length -= 1;
  //       break;
  //     }
  //   }
  // }

  function deposit(
    address depositer,
    uint256 amount,
    bool isPoolDeposit
  ) 
    internal
  {
    /// @dev Explicitly checking allowance & balance before transferFrom
    /// so we get the revert message.
    require(amount > 0, "Cannot deposit 0 IXT.");
    require(
      ixtToken.allowance(depositer, address(this)) >= amount &&
      ixtToken.balanceOf(depositer) >= amount &&
      ixtToken.transferFrom(depositer, address(this), amount),
      "Unable to deposit IXT - check allowance and balance."  
    );
    if (isPoolDeposit) {
      totalPoolBalance = SafeMath.add(totalPoolBalance, amount);

      emit PoolDeposit(depositer, amount);
    } else {
      Member storage member = members[depositer];
      member.stakeBalance = SafeMath.add(member.stakeBalance, amount);
      totalMemberBalance = SafeMath.add(totalMemberBalance, amount);

      emit Deposited(depositer, amount);
    }
  }
}
