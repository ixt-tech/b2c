var IxtProtect = artifacts.require("./IxtProtect.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(IxtProtect, accounts[0]);
};
