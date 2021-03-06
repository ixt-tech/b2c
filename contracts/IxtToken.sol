pragma solidity 0.5.1;

import "./lib/ERC20.sol";

contract IxtToken is ERC20 {

  function mint(
    address account,
    uint256 amount
  ) public {
    _mint(account, amount);
  }

  function burn(
    address account,
    uint256 amount
  ) public {
    _burn(account, amount);
  }

  function burnFrom(
    address account,
    uint256 amount
  ) public {
    _burnFrom(account, amount);
  }
}