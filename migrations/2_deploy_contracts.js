var IxtProtect = artifacts.require("./IxtProtect.sol");

module.exports = async function(deployer, network, accounts) {
  const validator = accounts[0];
  const IXTTokenAddress = "0xfca47962d45adfdfd1ab2d972315db4ce7ccf094";
  const loyaltyPeriod = "90";
  /// 200 IXT for all rewards
  const invitationReward = "20000000000";
  const loyaltyRewardAmount = "10";
  const ixtStakingLevels = [
    "100000000000",  //  1000 IXT
    "500000000000",  //  5000 IXT
    "1000000000000", // 10000 IXT
  ];
  deployer.deploy(
    IxtProtect,
    validator,
    loyaltyPeriod,
    IXTTokenAddress,
    invitationReward,
    loyaltyRewardAmount,
    ixtStakingLevels
  );
  if(network == "test") {
    console.log("In test mode, adding the owner as a member...");
    const contract = await IxtProtect.at(IxtProtect.address);
    contract.authoriseUser("1", accounts[0], "0xA");
    contract.authoriseUser("2", accounts[1], "0xB");
  }

};
