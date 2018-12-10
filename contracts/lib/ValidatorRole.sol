
pragma solidity 0.5.1;

import "./Roles.sol";

contract ValidatorRole {
  using Roles for Roles.Role;

  event ValidatorAdded(address indexed account);
  event ValidatorRemoved(address indexed account);

  Roles.Role private validators;

  constructor(address validator) public {
    _addValidator(validator);
  }

  modifier onlyValidator() {
    require(
      isValidator(msg.sender),
      "This function can only be called by a validator."
    );
    _;
  }

  function isValidator(address account) public view returns (bool) {
    return validators.has(account);
  }

  function addValidator(address account) public onlyValidator {
    _addValidator(account);
  }

  function renounceValidator() public {
    _removeValidator(msg.sender);
  }

  function _addValidator(address account) internal {
    validators.add(account);
    emit ValidatorAdded(account);
  }

  function _removeValidator(address account) internal {
    validators.remove(account);
    emit ValidatorRemoved(account);
  }
}
