const IXTGroupPolicy = artifacts.require("./IXTGroupPolicy.sol")

module.exports = function(deployer) {
    deployer.deploy(IXTGroupPolicy)
}
