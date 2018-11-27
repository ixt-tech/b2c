pragma solidity ^0.4.24;

contract IxtProtect {
  uint storedData;

  function set(uint x) public {
    storedData = x;
  }

  function get() public view returns (uint) {
    return storedData;
  }

  function join(string proof) {

  }

  function withdraw(uint amount) {

  }

  function deposit(uint amount) {

  }

  function getAccountBalance() public view returns (uint) {
  	return 123;
  }

  function getRewardBalance() public view returns (uint) {
  	return 123;
  }

  function halt() {

  }

  function depositPool(uint amount) {

  }

  function withdrawPool(uint amount) {

  }

}
