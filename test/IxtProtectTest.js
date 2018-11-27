const IxtProtect = artifacts.require("./IxtProtect.sol");

contract("IXTProtect", async (accounts) => {

  it("Should inherit the Ownable contract", async () => {
    const instance = await IxtProtect.deployed();
    const owner =  await instance.owner();
    assert.equal(owner, accounts[0]);
  });

});
