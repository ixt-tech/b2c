const IxtProtect = artifacts.require("./IxtProtect.sol");

contract("IxtProtect", accounts => {
  it("...should store the value 89.", async () => {
    const ixtProtectInstance = await IxtProtect.deployed();

    // Set value of 89
    await ixtProtectInstance.set(89, { from: accounts[0] });

    // Get stored value
    const storedData = await ixtProtectInstance.get.call();

    assert.equal(storedData, 89, "The value 89 was not stored.");
  });
});
