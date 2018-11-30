pragma solidity 0.5.0;

import "./lib/Ownable.sol";
import "./lib/IERC20.sol";
import "./lib/SafeMath.sol";

contract IxtProtect is Ownable {

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

  /// @dev the address of the approved KYC validator for IXLedger
  address public validator;
  /// @dev the IXT ERC20 Token contract
  IERC20 public IXTToken;
  /// @dev a mapping from member wallet addresses to Member struct
  mapping(address => Member) public members;
  /// @dev the same data as `members`, but iterable
  Member[] public membersArray;
  /// @dev the total balance of all members
  uint256 public totalBalance;

  /*      Constants      */
  uint256 public constant MINIMUM_STAKE = 2000 * (10**DECIMALS);
  uint256 public constant DECIMALS = 8;

  /*      Constructor      */

  constructor(
    address _validator,
    address _IXTToken
  ) public {
    require(_validator != address(0x0), "Validator address was set to 0.");
    require(_IXTToken != address(0x0), "IXTToken address was set to 0.");
    validator = _validator;
    IXTToken = IERC20(_IXTToken);
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
    emit Authorised(memberAddress, membershipNumber, productsCovered);
  }

  /// @notice Called by a member once they have been approved to join the scheme
  function join()
    public
    userIsAuthorised(msg.sender)
    userNotJoined(msg.sender)
  {
    deposit(msg.sender, MINIMUM_STAKE);
    Member storage member = members[msg.sender];
    member.joinedTimestamp = block.timestamp;
    emit Joined(msg.sender, member.membershipNumber, member.productsCovered);
  }

  /// @notice Allows member to deposit funds to increase their stake
  function deposit(uint256 amount)
    public
    userIsJoined(msg.sender)
  {
    deposit(msg.sender, amount);
  }

  // TODO - check if withdrawal should be possible before 6 months
  /// @notice NOT YET TESTED
  function withdraw(uint256 amount)
    public
    userIsJoined(msg.sender)
  {
    require(
      IXTToken.transfer(msg.sender, amount),
      "Unable to withdraw this value of IXT."  
    );
    Member storage member = members[msg.sender];
    member.stakeBalance = SafeMath.sub(member.stakeBalance, amount);
    totalBalance = SafeMath.sub(totalBalance, amount);

    emit Withdrawn(msg.sender, amount);
  }

  // TODO - Check that it is okay that this was renamed from `getAccountBalance()`
  /// @notice NOT YET TESTED
  function getStakeBalance(address memberAddress)
    public
    view
    userIsJoined(msg.sender)
    returns (uint256)
  {
    return members[memberAddress].stakeBalance;
  }

  /// @notice NOT YET TESTED
  function getRewardBalance(address memberAddress)
    public
    view
    userIsJoined(msg.sender)
    returns (uint256)
  {
    return members[memberAddress].rewardBalance;
  }

  // TODO - need to clarify what functions this halts
  /// @notice NOT YET TESTED
  function halt() public {
  }

  /// @notice NOT YET TESTED
  function depositPool(uint256 amount) public {
  }

  /// @notice NOT YET TESTED
  function withdrawPool(uint256 amount) public {
  }

  // TODO - need to clarify if this removes all member data or just resets `join` status
  /// @notice NOT YET TESTED
  function removeMember(address userAddress) public {
  }

  /*      Internal Functions      */

  function deposit(
    address memberAddress,
    uint256 amount
  ) 
    internal
  {
    require(
      IXTToken.allowance(memberAddress, address(this)) >= amount &&
      IXTToken.balanceOf(memberAddress) >= amount &&
      IXTToken.transferFrom(memberAddress, address(this), amount),
      "Unable to deposit IXT - check allowance and balance."  
    );
    Member storage member = members[memberAddress];
    member.stakeBalance = SafeMath.add(member.stakeBalance, amount);
    totalBalance = SafeMath.add(totalBalance, amount);

    emit Deposited(memberAddress, amount);
  }
}
