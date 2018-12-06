pragma solidity 0.5.0;

import "./lib/Ownable.sol";
import "./lib/IERC20.sol";
import "./lib/SafeMath.sol";
import "./lib/Pausable.sol";

contract IxtProtect is Ownable, Pausable {

  /*      Events      */

  event Authorised(
    address memberAddress,
    uint256 membershipNumber,
    Products[] productsCovered
  );

  event Joined(
    address memberAddress,
    uint256 membershipNumber,
    Products[] productsCovered
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

  /*      Function modifiers      */

  modifier onlyValidator() {
    require(
      msg.sender == validator,
      "This function can only be called by the validator."
    );
    _;
  }

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
    uint256 membershipNumber;
    Products[] productsCovered;
    bytes32 invitationCode;
    uint256 stakeBalance;
    uint256 rewardBalance;
  }

  /// @dev compiles to smallest uintX possible (ie. uint8 if < 256 entries)
  enum Products { PERSONAL_PROTECTION }

  /*      Variable declarations      */

  /// @dev the minimum stake period in seconds
  uint256 public minimumStakePeriodSeconds;
  /// @dev the reward received when inviting someone
  uint256 public invitationReward;
  /// @dev the reward received for loyalty
  uint256 public loyaltyReward;
  /// @dev the reward received for not claiming
  uint256 public noClaimReward; 
  /// @dev the address of the approved KYC validator for IXLedger
  address public validator;
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

  /*      Constants      */
  uint256 public constant MINIMUM_STAKE = 2000 * (10**IXT_DECIMALS);
  uint256 public constant IXT_DECIMALS = 8;

  /*      Constructor      */

  constructor(
    address _validator,
    address _ixtToken,
    uint256 minimumStakeDays,
    uint256 _invitationReward,
    uint256 _loyaltyReward,
    uint256 _noClaimReward
  ) public {
    require(_validator != address(0x0), "Validator address was set to 0.");
    require(_ixtToken != address(0x0), "ixtToken address was set to 0.");
    validator = _validator;
    ixtToken = IERC20(_ixtToken);
    minimumStakePeriodSeconds = minimumStakeDays * 24 * 60 * 60;
    invitationReward = _invitationReward;
    loyaltyReward = _loyaltyReward; 
    noClaimReward = _noClaimReward;
  }

  /*      Public Functions      */

  /// @notice Registers new user as a member after the KYC process
  function authoriseUser(
    uint256 membershipNumber,
    address memberAddress,
    Products[] memory productsCovered,
    bytes32 invitationCode
  ) 
    public
    onlyValidator
    userNotAuthorised(memberAddress)
    userNotJoined(memberAddress)
  {
    require(
      memberAddress != address(0x0),
      "Member address was set to 0."
    );
    Member memory member = Member(
      block.timestamp,
      0,
      membershipNumber,
      productsCovered,
      invitationCode,
      0,
      0
    );
    members[memberAddress] = member;
    membersArray.push(memberAddress);
    emit Authorised(memberAddress, membershipNumber, productsCovered);
  }

  /// @notice Called by a member once they have been approved to join the scheme
  function join()
    public
    whenNotPaused()
    userIsAuthorised(msg.sender)
    userNotJoined(msg.sender)
  {
    deposit(msg.sender, MINIMUM_STAKE, false);
    Member storage member = members[msg.sender];
    member.joinedTimestamp = block.timestamp;
    emit Joined(msg.sender, member.membershipNumber, member.productsCovered);
  }

  /// @notice Allows member to deposit funds to increase their stake
  function deposit(uint256 amount)
    public
    whenNotPaused()
    userIsJoined(msg.sender)
  {
    deposit(msg.sender, amount, false);
  }

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

  function getAccountBalance(address memberAddress)
    public
    view
    userIsJoined(memberAddress)
    returns (uint256)
  {
    return SafeMath.add(members[memberAddress].stakeBalance, members[memberAddress].rewardBalance);
  }

  function getStakeBalance(address memberAddress)
    public
    view
    userIsJoined(memberAddress)
    returns (uint256)
  {
    return members[memberAddress].stakeBalance;
  }

  function getRewardBalance(address memberAddress)
    public
    view
    userIsJoined(memberAddress)
    returns (uint256)
  {
    return members[memberAddress].rewardBalance;
  }

  function depositPool(uint256 amountToDeposit)
    public
    onlyOwner
  {
    deposit(msg.sender, amountToDeposit, true);
  }

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
  }

  /// @dev Can be called if user is authorised or joined
  function removeMember(address userAddress)
    public
    userIsAuthorised(userAddress)
    onlyOwner
  {
    cancelMembership(userAddress);
  }

  function drain() public onlyOwner {
    /// @dev Refund and delete all members
    for (uint256 index = 0; index < membersArray.length; index++) {
      address memberAddress = membersArray[index];
      uint256 amountRefunded = refundUserBalance(memberAddress);
      delete members[memberAddress];

      emit MemberRefunded(memberAddress, amountRefunded);
    }
    delete membersArray;

    /// @dev Refund the pool balance
    require(
      ixtToken.transfer(msg.sender, totalPoolBalance),
      "Unable to withdraw this value of IXT."
    );
    emit PoolBalanceRefunded(msg.sender, totalPoolBalance);
    totalPoolBalance = 0;
    
    emit ContractDrained(msg.sender);
  }

  function setInvitationReward(uint256 _invitationReward)
    public
    onlyOwner
  {
    invitationReward = _invitationReward;
  }

  function setLoyaltyReward(uint256 _loyaltyReward)
    public
    onlyOwner
  {
    loyaltyReward = _loyaltyReward;
  }

  function setNoClaimReward(uint256 _noClaimReward)
    public
    onlyOwner
  {
    noClaimReward = _noClaimReward; 
  }

  function setMinimumStakeDays(uint256 minimumStakeDays)
    public
    onlyOwner
  {
    minimumStakePeriodSeconds = minimumStakeDays * 24 * 60 * 60;
  }

  function getMinimumStakeDays()
    public
    view
    returns (uint256)
  {
    return minimumStakePeriodSeconds / 60 / 60 / 24;
  }

  /*      Internal Functions      */

  function cancelMembership(address memberAddress) internal {
    uint256 amountRefunded = refundUserBalance(memberAddress);

    delete members[memberAddress];

    removeMemberFromArray(memberAddress);

    emit MemberCancelled(memberAddress, amountRefunded);
  }

  function refundUserBalance(
    address memberAddress
  ) 
    internal
    returns (uint256 amountRefunded)
  {
    Member storage member = members[memberAddress];

    uint256 amountToRefund = SafeMath.add(member.rewardBalance, member.stakeBalance);
    bool userJoined = member.joinedTimestamp != 0;
    if (amountToRefund > 0 && userJoined) {
      require(
        ixtToken.transfer(memberAddress, amountToRefund),
        "Unable to withdraw this value of IXT."  
      );
      totalMemberBalance = SafeMath.sub(totalMemberBalance, amountToRefund);
    }
    return amountToRefund;
  }

  function removeMemberFromArray(address memberAddress) internal {
    /// @dev removing the member address from the membersArray
    for (uint256 index; index < membersArray.length; index++) {
      if (membersArray[index] == memberAddress) {
        membersArray[index] = membersArray[membersArray.length - 1];
        membersArray.length -= 1;
        break;
      }
    }
  }

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
