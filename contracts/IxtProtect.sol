pragma solidity 0.5.0;

import "./lib/Ownable.sol";
import "./lib/LibEIP712.sol";

contract IxtProtect is Ownable, LibEIP712 {

  /*      Data types      */

  struct Member {
    uint256 membership_number;
    Products[] products_covered;
    bytes32 invitation_code;
  }

  /// @dev compiles to smallest uintX possible (ie. uint8 if < 256 entries)
  enum Products { PERSONAL_PROTECTION }

  /*      Variable declarations      */

  /// @dev the address of the approved KYC validator for IXLedger
  address public validator;
  /// @dev a mapping from member wallet addresses to Member struct
  mapping(address => Member) members;
  /// @dev the same data as `members`, but iterable
  Member[] members_arr;
  /// @dev definition of type hash of structure to provide support for EIP-712
  bytes32 constant internal EIP712_MEMBER_SCHEMA_HASH = keccak256(
    abi.encodePacked(
      "Member(",
      "uint256 membership_number,",
      "uint8[] products_covered,",
      "bytes32 invitation_code",
      ")"
    )
  );

  /*      Constructor      */

  constructor(address _validator) public {
    require(_validator != address(0x0), "Validator address was set to 0.");
    validator = _validator;
  }

  /*      Main Functions      */

  /// @notice Registers new user as a member after the KYC process
  function join(
    uint256 membership_number,
    Products[] memory products_covered,
    bytes32 invitation_code,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public {
    Member memory member = Member(
      membership_number,
      products_covered,
      invitation_code
    );
    bytes32 memberHash = getMemberHash(member);

    require(
      isValidSignature(validator, memberHash, v, r, s),
      "Provided signature was invalid."
    );

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

  /*      Util Functions      */

  /// @notice Verifies that a signature is valid.
  /// @param signer address of signer.
  /// @param hash Signed Keccak-256 hash.
  /// @param v ECDSA signature parameter v.
  /// @param r ECDSA signature parameters r.
  /// @param s ECDSA signature parameters s.
  /// @return Validity of a signature.
  function isValidSignature(
    address signer,
    bytes32 hash,
    uint8 v,
    bytes32 r,
    bytes32 s
  )
    public
    pure
    returns (bool)
  {
    address recovered = ecrecover(
      hash,
      v,
      r,
      s
    );
    return (signer == recovered);
  }

  /// @dev Calculates Keccak-256 hash of the member.
  /// @param member the member struct.
  /// @return Keccak-256 EIP712 hash of the member.
  function getMemberHash(Member memory member)
    internal
    view
    returns (bytes32 memberHash)
  {
    memberHash = hashEIP712Message(hashMember(member));
    return memberHash;
  }

  /// @dev Calculates EIP712 hash of the member.
  /// @param member the member struct.
  /// @return EIP712 hash of the member.
  function hashMember(Member memory member)
    internal
    pure
    returns (bytes32)
  {
    return keccak256(
      abi.encodePacked(
        EIP712_MEMBER_SCHEMA_HASH,
        member.membership_number,
        keccak256(abi.encodePacked(member.products_covered)),
        member.invitation_code
      )
    );
  }

}
