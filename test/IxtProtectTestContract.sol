pragma solidity 0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/IxtProtect.sol";

contract IxtProtectTestContract {

  function testItStoresAValue() public {
    IxtProtect ixtProtect = IxtProtect(DeployedAddresses.IxtProtect());

    ixtProtect.set(89);

    uint expected = 89;

    Assert.equal(ixtProtect.get(), expected, "It should store the value 89.");
  }

}
