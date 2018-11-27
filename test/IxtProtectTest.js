const IxtProtect = artifacts.require("./IxtProtect.sol");

contract("IXTProtect", async (accounts) => {
  const deployer = accounts[0];
  const user_a = accounts[1];

  it("Should inherit the Ownable contract", async () => {
    const instance = await IxtProtect.deployed();
    const owner =  await instance.owner();
    assert.equal(owner, accounts[0]);
  });

  describe("Join function", () => {

    it("Should allow a member to join if they have a proof signed by the contract owner", async () => {
      const instance = await IxtProtect.deployed();
      // The owner of the contract should be accounts[0]
      const owner =  await instance.owner();

      const member_data = {}
      member_data.membership_number = 123123123;
      member_data.member_address = accounts[1];
      member_data.products_covered = 42;
      member_data.invitation_code = 123123123123;

      // 1. Sign the data with accounts[0]
      const signature = signMembershipData(member_data, owner);
      // 2. Include the data and digital signature in the payload to join() - this should complete without throwing
      // 3. Assert that the member is now present in the smart contracts storage data
    });
  }); 

  function signMembershipData(membership_data, signing_address) {

  }

});
