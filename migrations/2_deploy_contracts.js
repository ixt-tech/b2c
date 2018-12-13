var IxtProtect = artifacts.require("./IxtProtect.sol");
var IxtToken = artifacts.require("./IxtToken.sol");

module.exports = async function(deployer, network, accounts) {
  const validator = accounts[0];
  const loyaltyPeriod = "90";
  /// 200 IXT for all rewards
  const invitationReward = "20000000000";
  const loyaltyRewardPercentage = "10";
  const ixtStakingLevels = [
    "100000000000",  //  1000 IXT
    "500000000000",  //  5000 IXT
    "1000000000000", // 10000 IXT
  ];
  const ixtTokenAddress = "0xfca47962d45adfdfd1ab2d972315db4ce7ccf094";

  if (network != "live") {
    deployer.deploy(IxtToken).then(function() {
      return deployer.deploy(
        IxtProtect,
        validator,
        loyaltyPeriod,
        IxtToken.address,
        invitationReward,
        loyaltyRewardPercentage,
        ixtStakingLevels
      );
    }).then(async function() {
      const ixtToken = await IxtToken.at(IxtToken.address);
      for(let i = 0; i < accounts.length; i++) {
        await ixtToken.mint(accounts[i], 100000000000000);
        console.log('Minted IXT to ' + accounts[i]);
      }
      console.log('Dev mode, deployed ERC20 to ' + ixtToken.address + ' contract as well and allocated tokens');
    });
  } else {
    deployer.deploy(
      IxtProtect,
      validator,
      loyaltyPeriod,
      ixtTokenAddress,
      invitationReward,
      loyaltyRewardPercentage,
      ixtStakingLevels
    );
  }

};
