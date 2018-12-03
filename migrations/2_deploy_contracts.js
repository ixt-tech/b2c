var IxtProtect = artifacts.require("./IxtProtect.sol");

module.exports = function(deployer, network, accounts) {
  const validator = accounts[0];
  const IXTTokenAddress = "0xfca47962d45adfdfd1ab2d972315db4ce7ccf094";
  const minStakeDays = "90";
  /// 200 IXT for all rewards
  const invitationReward = "20000000000";
  const loyaltyReward = "20000000000";
  const noClaimReward = "20000000000";
  deployer.deploy(
    IxtProtect,
    validator,
    IXTTokenAddress,
    minStakeDays,
    invitationReward,
    loyaltyReward,
    noClaimReward
  );
};
