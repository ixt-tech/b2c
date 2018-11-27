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

  enum Products { PERSONAL_PROTECTION }

  /*      Variable declarations      */

  /// @dev a mapping from member wallet addresses to Member struct
  mapping(address => Member) members;
  /// @dev the same data as `members`, but iterable
  Member[] members_arr;
  /// @dev definition of type hash of structure to provide support for EIP-712
  bytes32 constant internal EIP712_MEMBER_SCHEMA_HASH = keccak256(
    abi.encodePacked(
      "Member(",
      "uint256 membership_numbers,",
      "uint8[] products_covered,",
      "bytes32 invitation_code",
      ")"
    )
  );

  /*      Constructor      */

  constructor() public {}

  /*      Main Functions      */

  /// @notice 
  /// @param signer address of signer.
  function join(Member memory member_details, ) public {

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

  /// @notice Verifies that an order signature is valid.
  /// @param signer address of signer.
  /// @param hash Signed Keccak-256 hash.
  /// @param v ECDSA signature parameter v.
  /// @param r ECDSA signature parameters r.
  /// @param s ECDSA signature parameters s.
  /// @return Validity of order signature.
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
    return signer == ecrecover(
      keccak256("\x19Ethereum Signed Message:\n32", hash),
      v,
      r,
      s
    );
  }

  /// @dev Calculates EIP712 hash of the member.
  /// @param member the member struct.
  /// @return EIP712 hash of the member.
    function hashMember(Member memory member)
        internal
        pure
        returns (bytes32 result)
    {
      bytes32 schemaHash = EIP712_ORDER_SCHEMA_HASH;

      keccak256(
        abi.encodePacked(
          EIP712_MEMBER_SCHEMA_HASH,
          member.membership_number,
          keccak256(member.products_covered),
          member.invitation_code
        )
      );
    }

}
