var IxtProtect = artifacts.require("./IxtProtect.sol");

module.exports = function(deployer, network, accounts) {
  const IXTTokenAddress = "0xfca47962d45adfdfd1ab2d972315db4ce7ccf094";
  deployer.deploy(IxtProtect, accounts[0], IXTTokenAddress);
};
