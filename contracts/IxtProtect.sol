pragma solidity 0.5.1;

import "./lib/Ownable.sol";
import "./lib/IERC20.sol";
import "./lib/SafeMath.sol";
import "./lib/Pausable.sol";
import "./lib/ValidatorRole.sol";

/// @title IxtEvents
/// @notice Holds all events used by the IXTProtect contract
contract IxtEvents {

  event NewMemberAuthorised(
    address memberAddress,
    bytes32 membershipNumber,
    bytes32 invitationCode,
    uint256 authorisedTimestamp
  );

  event NewMemberJoined(
    address memberAddress,
    bytes32 membershipNumber,
    uint256 stakeLevel,
    uint256 joinedTimestamp
  );

  event MemberInitiatedCancelMembership(
    address memberThatCancelled,
    uint256 rewardAmount
  );

  event MemberInitiatedClaimRewards(
    address member,
    uint256 rewardAmount
  );

  event InvitationRewardGiven(
    address memberReceivingReward,
    address memberGivingReward,
    uint256 rewardAmount,
    uint256 invitationTimestamp
  );

  event PoolDeposit(
    address depositer,
    uint256 amount
  );

  event PoolWithdraw(
    address withdrawer,
    uint256 amount
  );

  event AdminRemovedMember(
    address admin,
    address userAddress,
    uint256 refundIssued
  );

  event MemberDrained(
    address memberAddress,
    uint256 amountRefunded
  );

  event PoolDrained(
    address refundRecipient,
    uint256 amountRefunded
  );

  event ContractDrained(
    address drainInitiator
  );

  event InvitationRewardChanged(
    uint256 newInvitationReward
  );

  event LoyaltyRewardChanged(
    uint256 newLoyaltyRewardAmount
  );
}

/// @title RoleManager which inherits the Role-based functionality used
/// by the IXTProtect contract
contract RoleManager is Ownable, Pausable, ValidatorRole {

  constructor(address validator)
    public
    ValidatorRole(validator)
  {}
}

/// @title StakeManager which contains some of the stake-based state
/// used by the IXTProtect contract
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

  /// @dev The three levels of stake used within the IXTProtect platform
  /// @dev Solidity enums are 0 based
  enum StakeLevel { LOW, MEDIUM, HIGH }

  /*      Variable declarations      */

  /// @dev the defined staking amount for each level
  uint256[3] public ixtStakingLevels;

  /*      Constructor      */

  /// @param _ixtStakingLevels the amount of stake used for each of the staking levels
  /// used within the IXTProtect platform
  constructor(
    uint256[3] memory _ixtStakingLevels
  ) public {
    ixtStakingLevels = _ixtStakingLevels;
  }

}

/// @title RewardManager which contains some of the reward-based state
/// used by the IXTProtect contract
contract RewardManager {

  /*      Variable declarations      */

  /// @dev the reward received when inviting someone
  uint256 public invitationReward;
  /// @dev the period after which a member gets a loyalty reward
  uint256 public loyaltyPeriodDays;
  /// @dev the rate used for calculation of the loyalty reward
  uint256 public loyaltyRewardAmount;

  /*      Constructor      */

  /// @param _invitationReward the amount of reward used when a member uses an invitation code
  /// @param _loyaltyPeriodDays the amount of days that will be used for the loyalty period
  /// @param _loyaltyRewardAmount the rate used as a loyalty reward after every loyalty period
  constructor(
    uint256 _invitationReward,
    uint256 _loyaltyPeriodDays,
    uint256 _loyaltyRewardAmount
  ) public {
    require(
      _loyaltyRewardAmount >= 0 &&
      _loyaltyRewardAmount <= 100,
      "Loyalty reward amount must be between 0 and 100."
    );
    invitationReward = _invitationReward;
    loyaltyPeriodDays = _loyaltyPeriodDays;
    loyaltyRewardAmount = _loyaltyRewardAmount;
  }

}

/// @title IxtProtect
/// @notice Holds state and contains key logic which controls the IXTProtect platform
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

  /// @dev data structure used to track state on each member using the platform
  struct Member {
    uint256 authorisedTimestamp;
    uint256 joinedTimestamp;
    uint256 startOfLoyaltyRewardEligibility;
    bytes32 membershipNumber;
    bytes32 invitationCode;
    uint256 stakeBalance;
    uint256 invitationRewards;
    uint256 previouslyAppliedLoyaltyBalance;
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
  mapping(bytes32 => address) public registeredInvitationCodes;
 

  /*      Constants      */

  /// @dev the amount of decimals used by the IXT ERC20 token
  uint256 public constant IXT_DECIMALS = 8;

  /*      Constructor      */

  /// @param _validator the address to use as the validator
  /// @param _loyaltyPeriodDays the amount of days that will be used for the loyalty period
  /// @param _ixtToken the address of the IXT ERC20 token to be used as stake and for rewards
  /// @param _invitationReward the amount of reward used when a member uses an invitation code
  /// @param _loyaltyRewardAmount the rate used as a loyalty reward after every loyalty period
  /// @param _ixtStakingLevels three ascending amounts of IXT token to be used as staking levels
  constructor(
    address _validator,
    uint256 _loyaltyPeriodDays,
    address _ixtToken,
    uint256 _invitationReward,
    uint256 _loyaltyRewardAmount,
    uint256[3] memory _ixtStakingLevels
  )
    public
    RoleManager(_validator)
    StakeManager(_ixtStakingLevels)
    RewardManager(_invitationReward, _loyaltyPeriodDays, _loyaltyRewardAmount)
  {
    require(_ixtToken != address(0x0), "ixtToken address was set to 0.");
    ixtToken = IERC20(_ixtToken);
  }

  /*                            */
  /*      PUBLIC FUNCTIONS      */
  /*                            */

  /*      (member control)      */

  /// @notice Registers a new user as a member after the KYC process
  /// @notice This function should not add the invitationCode
  /// to the mapping yet, this should only happen after join
  /// @notice This function can only be called by a "validator" which is set inside the
  /// constructor
  /// @param _membershipNumber the membership number of the member to authorise
  /// @param _memberAddress the EOA address of the member to authorise
  /// @param _invitationCode should be associated with *this* member in order to apply invitation rewards
  /// @param _referralInvitationCode the invitation code of another member which is used to give the

  function authoriseUser(
    bytes32 _membershipNumber,
    address _memberAddress,
    bytes32 _invitationCode,
    bytes32 _referralInvitationCode
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
      startOfLoyaltyRewardEligibility: 0,
      membershipNumber: _membershipNumber,
      invitationCode: _invitationCode,
      stakeBalance: 0,
      invitationRewards: 0,
      previouslyAppliedLoyaltyBalance: 0
    });
    members[_memberAddress] = member;
    membersArray.push(_memberAddress);

    /// @dev add this members invitation code to the mapping
    registeredInvitationCodes[member.invitationCode] = _memberAddress;
    /// @dev if the _referralInvitationCode is already registered, add on reward
    address rewardMemberAddress = registeredInvitationCodes[_referralInvitationCode];
    if (
      rewardMemberAddress != address(0x0)
    ) {
      Member storage rewardee = members[rewardMemberAddress];
      rewardee.invitationRewards = SafeMath.add(rewardee.invitationRewards, invitationReward);
      emit InvitationRewardGiven(rewardMemberAddress, _memberAddress, invitationReward);
    }

    emit NewMemberAuthorised(_memberAddress, _membershipNumber, _invitationCode, block.timestamp);
  }

  /// @notice Called by a member once they have been approved to join the scheme
  /// @notice Before calling the prospective member *must* have approved the appropriate amount of
  /// IXT token to be transferred by this contract
  /// @param _stakeLevel the staking level used by this member. Note this is not the staking *amount*.
  /// other member a reward upon *this* user joining.
  function join(
    StakeLevel _stakeLevel
  )
    public
    whenNotPaused()
    userIsAuthorised(msg.sender)
    userNotJoined(msg.sender)
    isValidStakeLevel(_stakeLevel)
  {
    uint256 amountDeposited = depositInternal(msg.sender, ixtStakingLevels[uint256(_stakeLevel)], false);
    Member storage member = members[msg.sender];
    member.joinedTimestamp = block.timestamp;
    member.startOfLoyaltyRewardEligibility = block.timestamp;
    emit NewMemberJoined(msg.sender, member.membershipNumber, amountDeposited, block.timestamp);
  }

  /// @notice Called by the member if they wish to cancel their membership
  /// @notice This function will return all stake and eligible reward balance back to the user
  function cancelMembership()
    public
    whenNotPaused()
    userIsJoined(msg.sender)
  {
    uint256 refund = cancelMembershipInternal(msg.sender);
    emit MemberInitiatedCancelMembership(msg.sender, refund);
  }

  /// @notice Called by the member if they wish to claim the rewards they are eligible
  /// @notice This function will return all eligible reward balance back to the user
  function claimRewards()
    public
    whenNotPaused()
    userIsJoined(msg.sender)
  {
    uint256 rewardClaimed = claimRewardsInternal(msg.sender);
    emit MemberInitiatedClaimRewards(msg.sender, rewardClaimed);
  }

  /*      (getter functions)      */

  /// @notice Called in order to get the number of members on the platform
  /// @return length of the members array
  function getMembersArrayLength() public view returns (uint256) {
    return membersArray.length;
  }

  /// @notice Called to obtain the account balance of any given member
  /// @param memberAddress the address of the member to get the account balance for
  /// @return the account balance of the member in question
  function getAccountBalance(address memberAddress)
    public
    view
    userIsJoined(memberAddress)
    returns (uint256)
  {
    return getStakeBalance(memberAddress) +
      getRewardBalance(memberAddress);
  }

  /// @notice Called to obtain the stake balance of any given member
  /// @param memberAddress the address of the member to get the stake balance for
  /// @return the stake balance of the member in question
  function getStakeBalance(address memberAddress)
    public
    view
    userIsJoined(memberAddress)
    returns (uint256)
  {
    return members[memberAddress].stakeBalance;
  }

  /// @notice Called to obtain the reward balance of any given member
  /// @param memberAddress the address of the member to get the total reward balance for
  /// @return the total reward balance of the member in question
  function getRewardBalance(address memberAddress)
    public
    view
    userIsJoined(memberAddress)
    returns (uint256)
  {
    return getInvitationRewardBalance(memberAddress) +
      getLoyaltyRewardBalance(memberAddress);
  }

  /// @notice Called to obtain the invitation reward balance of any given member
  /// @param memberAddress the address of the member to get the invitation reward balance for
  /// @return the invitation reward balance of the member in question
  function getInvitationRewardBalance(address memberAddress)
    public
    view
    userIsJoined(memberAddress)
    returns (uint256)
  {
    return members[memberAddress].invitationRewards;
  }

  /// @notice Called to obtain the loyalty reward balance of any given member
  /// @param memberAddress the address of the member to get the loyalty reward balance for
  /// @return the loyalty reward balance of the member in question
  function getLoyaltyRewardBalance(address memberAddress)
    public
    view
    userIsJoined(memberAddress)
    returns (uint256 loyaltyReward)
  {
    uint256 loyaltyPeriodSeconds = loyaltyPeriodDays * 1 days;
    Member storage thisMember = members[memberAddress];
    uint256 elapsedTimeSinceEligible = block.timestamp - thisMember.startOfLoyaltyRewardEligibility;
    loyaltyReward = thisMember.previouslyAppliedLoyaltyBalance;
    if (elapsedTimeSinceEligible >= loyaltyPeriodSeconds) {
      uint256 numWholePeriods = SafeMath.div(elapsedTimeSinceEligible, loyaltyPeriodSeconds);
      uint256 rewardForEachPeriod = thisMember.stakeBalance * loyaltyRewardAmount / 100;
      loyaltyReward += rewardForEachPeriod * numWholePeriods;
    }
  }

  /*      (admin functions)      */

  /// @notice Called by the admin to deposit extra IXT into the contract to be used as rewards
  /// @notice This function can only be called by the contract owner
  /// @param amountToDeposit the amount of IXT ERC20 token to deposit into the pool
  function depositPool(uint256 amountToDeposit)
    public
    onlyOwner
  {
    uint256 amountDeposited = depositInternal(msg.sender, amountToDeposit, true);
    emit PoolDeposit(msg.sender, amountDeposited);
  }

  /// @notice Called by the admin to withdraw IXT from the pool balance
  /// @notice This function can only be called by the contract owner
  /// @param amountToWithdraw the amount of IXT ERC20 token to withdraw from the pool
  function withdrawPool(uint256 amountToWithdraw)
    public
    onlyOwner
  {
    if (amountToWithdraw > 0) {
      require(
        totalPoolBalance >= amountToWithdraw &&
        ixtToken.transfer(msg.sender, amountToWithdraw),
        "Unable to withdraw this value of IXT."  
      );
      totalPoolBalance = SafeMath.sub(totalPoolBalance, amountToWithdraw);
    }
    emit PoolWithdraw(msg.sender, amountToWithdraw);
  }

  /// @notice Called by an admin to remove a member from the platform
  /// @notice This function can only be called by the contract owner
  /// @notice The member will be automatically refunded their stake balance and any
  /// unclaimed rewards as a result of being removed by the admin
  /// @notice Can be called if user is authorised *or* joined
  /// @param userAddress the address of the member that the admin wishes to remove
  function removeMember(address userAddress)
    public
    userIsAuthorised(userAddress)
    onlyOwner
  {
    uint256 refund = cancelMembershipInternal(userAddress);
    emit AdminRemovedMember(msg.sender, userAddress, refund);
  }

  /// @notice Called by an admin in emergency situations only, will returns *ALL* stake balance
  /// and reward balances back to the users. Any left over pool balance will be returned to the
  /// contract owner.
  /// @notice This function can only be called by the contract owner
  function drain() public onlyOwner {
    /// @dev Refund and delete all members
    for (uint256 index = 0; index < membersArray.length; index++) {
      address memberAddress = membersArray[index];
      bool memberJoined = members[memberAddress].joinedTimestamp != 0;
      uint256 amountRefunded = memberJoined ? refundUserBalance(memberAddress) : 0;

      delete registeredInvitationCodes[members[memberAddress].invitationCode];
      delete members[memberAddress];

      emit MemberDrained(memberAddress, amountRefunded);
    }
    delete membersArray;

    /// @dev Refund the pool balance
    require(
      ixtToken.transfer(msg.sender, totalPoolBalance),
      "Unable to withdraw this value of IXT."
    );
    totalPoolBalance = 0;
    emit PoolDrained(msg.sender, totalPoolBalance);
    
    emit ContractDrained(msg.sender);
  }

  /// @notice Called by the contract owner to set the invitation reward to be given to future members
  /// @notice This function does not affect previously awarded invitation rewards
  /// @param _invitationReward the amount that the invitation reward should be set to
  function setInvitationReward(uint256 _invitationReward)
    public
    onlyOwner
  {
    invitationReward = _invitationReward;
    emit InvitationRewardChanged(_invitationReward);
  }

  /// @notice Called by the contract owner to set the loyalty reward rate to be given to future members
  /// @notice This function does not affect previously awarded loyalty rewards
  /// @notice The loyalty reward amount is actually a rate from 0 to 100 that is used to
  /// calculate the proportion of stake balance that should be rewarded.
  /// @param newLoyaltyRewardAmount the amount that the loyalty reward should be set to
  function setLoyaltyRewardAmount(uint256 newLoyaltyRewardAmount)
    public
    onlyOwner
  {
    require(
      newLoyaltyRewardAmount >= 0 &&
      newLoyaltyRewardAmount <= 100,
      "Loyalty reward amount must be between 0 and 100."
    );
    uint256 loyaltyPeriodSeconds = loyaltyPeriodDays * 1 days;
    /// @dev Loop through all the current members and apply previous reward amounts
    for (uint256 i = 0; i < membersArray.length; i++) {
      Member storage thisMember = members[membersArray[i]];
      uint256 elapsedTimeSinceEligible = block.timestamp - thisMember.startOfLoyaltyRewardEligibility;
      if (elapsedTimeSinceEligible >= loyaltyPeriodSeconds) {
        uint256 numWholePeriods = SafeMath.div(elapsedTimeSinceEligible, loyaltyPeriodSeconds);
        uint256 rewardForEachPeriod = thisMember.stakeBalance * loyaltyRewardAmount / 100;
        thisMember.previouslyAppliedLoyaltyBalance += rewardForEachPeriod * numWholePeriods;
        thisMember.startOfLoyaltyRewardEligibility += numWholePeriods * loyaltyPeriodSeconds;
      }
    }
    loyaltyRewardAmount = newLoyaltyRewardAmount;
    emit LoyaltyRewardChanged(newLoyaltyRewardAmount);
  }

  /*                              */
  /*      INTERNAL FUNCTIONS      */
  /*                              */

  function cancelMembershipInternal(address memberAddress)
    internal
    returns
    (uint256 amountRefunded)
  {
    amountRefunded = refundUserBalance(memberAddress);

    delete registeredInvitationCodes[members[memberAddress].invitationCode];

    delete members[memberAddress];

    removeMemberFromArray(memberAddress);
  }

  function refundUserBalance(
    address memberAddress
  ) 
    internal
    returns (uint256)
  {
    Member storage member = members[memberAddress];

    /// @dev Pool balance will be reduced inside this function
    uint256 claimsRefunded = claimRewardsInternal(memberAddress);
    uint256 stakeToRefund = member.stakeBalance;

    bool userJoined = member.joinedTimestamp != 0;
    if (stakeToRefund > 0 && userJoined) {
      require(
        ixtToken.transfer(memberAddress, stakeToRefund),
        "Unable to withdraw this value of IXT."  
      );
      totalMemberBalance = SafeMath.sub(totalMemberBalance, stakeToRefund);
    }
    return claimsRefunded + stakeToRefund;
  }

  function removeMemberFromArray(address memberAddress) internal {
    /// @dev removing the member address from the membersArray
    for (uint256 index; index < membersArray.length; index++) {
      if (membersArray[index] == memberAddress) {
        membersArray[index] = membersArray[membersArray.length - 1];
        membersArray[membersArray.length - 1] = address(0);
        membersArray.length -= 1;
        break;
      }
    }
  }

  function claimRewardsInternal(address memberAddress)
    internal
    returns (uint256 rewardAmount)
  {
    rewardAmount = getRewardBalance(memberAddress);

    if (rewardAmount == 0) {
      return rewardAmount;
    }

    require(
      totalPoolBalance >= rewardAmount,
      "Pool balance not sufficient to withdraw rewards."
    );
    require(
      ixtToken.transfer(memberAddress, rewardAmount),
      "Unable to withdraw this value of IXT."  
    );
    /// @dev we know this is safe as totalPoolBalance >= rewardAmount
    totalPoolBalance -= rewardAmount;

    Member storage thisMember = members[memberAddress];
    thisMember.previouslyAppliedLoyaltyBalance = 0;
    thisMember.invitationRewards = 0;

    uint256 loyaltyPeriodSeconds = loyaltyPeriodDays * 1 days;
    uint256 elapsedTimeSinceEligible = block.timestamp - thisMember.startOfLoyaltyRewardEligibility;
    if (elapsedTimeSinceEligible >= loyaltyPeriodSeconds) {
      uint256 numWholePeriods = SafeMath.div(elapsedTimeSinceEligible, loyaltyPeriodSeconds);
      thisMember.startOfLoyaltyRewardEligibility += numWholePeriods * loyaltyPeriodSeconds;
    }
  }

  function depositInternal(
    address depositer,
    uint256 amount,
    bool isPoolDeposit
  ) 
    internal
    returns (uint256)
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
    } else {
      Member storage member = members[depositer];
      member.stakeBalance = SafeMath.add(member.stakeBalance, amount);
      totalMemberBalance = SafeMath.add(totalMemberBalance, amount);
    }
    return amount;
  }
}
