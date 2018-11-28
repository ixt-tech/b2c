pragma solidity 0.5.0;

import "./lib/Ownable.sol";
import "./lib/IERC20.sol";
import "./lib/SafeMath.sol";

contract IxtProtect is Ownable {

  /*      Function modifiers      */

  modifier onlyValidator() {
    require(
      msg.sender == validator,
      "This function can only be called by the validator."
    );
    _;
  }

  modifier userNotRegistered(address memberAddress) {
    require(
      members[memberAddress].initialised != true,
      "Member is already registered."
    );
    _;
  }

  /*      Data types      */

  struct Member {
    bool initialised;
    uint256 membership_number;
    Products[] products_covered;
    bytes32 invitation_code;
  }

  /// @dev compiles to smallest uintX possible (ie. uint8 if < 256 entries)
  enum Products { PERSONAL_PROTECTION }

  /*      Variable declarations      */

  /// @dev the address of the approved KYC validator for IXLedger
  address public validator;
  /// @dev the IXT ERC20 Token contract
  IERC20 public IXTToken;
  /// @dev a mapping from member wallet addresses to Member struct
  mapping(address => Member) members;
  /// @dev the same data as `members`, but iterable
  Member[] members_arr;

  /*      Constructor      */

  constructor(
    address _validator,
    address _IXTToken
  ) public {
    require(_validator != address(0x0), "Validator address was set to 0.");
    require(_IXTToken != address(0x0), "IXTToken address was set to 0.");
    validator = _validator;
    IXTToken  = IERC20(_IXTToken);
  }

  /*      Public Functions      */

  /// @notice Registers new user as a member after the KYC process
  function join(
    uint256 membershipNumber,
    address memberAddress,
    Products[] memory productsCovered,
    bytes32 invitationCode
  ) 
    public
    onlyValidator
    userNotRegistered(memberAddress)
  {
    Member memory member = Member(
      true,
      membershipNumber,
      productsCovered,
      invitationCode
    );

    // Check for approval
    members[memberAddress] = member;

  }


  // function withdraw(uint256 amount) public {

  // }

  // function deposit(uint256 amount) public {

  // }

  // function getAccountBalance() public pure returns (uint256) {
  // 	return 123;
  // }

  // function getRewardBalance() public view returns (uint256) {
  // 	return 123;
  // }

  // function halt() public {

  // }

  // function depositPool(uint256 amount) public {

  // }

  // function withdrawPool(uint256 amount) public {

  // }

}
