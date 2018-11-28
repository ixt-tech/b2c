const IxtProtect = artifacts.require("./IxtProtect.sol");

contract("IXTProtect", async (accounts) => {
  let ixtProtect;

  const deployer = accounts[0];
  const verifier = accounts[1];
  const user = accounts[2];
  const Products = { 
    PERSONAL_PROTECTION: 0
  };

  const memberTypes = {
    membershipNumber: "uint256",
    memberAddress: "address",
    productsCovered: "uint8[]",
    invitationCode: "uint256"
  };

  function memberData() {
    return {
      membershipNumber: 123123123,
      memberAddress: user,
      productsCovered: [ Products.PERSONAL_PROTECTION ],
      invitationCode: 0
    };
  }

  beforeEach(async => {
    ixtProtect = await IxtProtect.new(verifier);
  });

  it("Should inherit the Ownable contract", async () => {
    const owner =  await ixtProtect.owner();
    assert.equal(owner, deployer);
  });

  describe("Join function", () => {

    it("Should allow a member to join if they have a proof signed by the contract owner", async () => {
      const member = memberData();

      // 1. Sign the data with `verifier` address
      const ixtAddress = ixtProtect.address;
      const signature = signMembershipData(member, verifier, ixtAddress);
      // 2. Include the data and digital signature in the payload to join() - this should complete without throwing
      // 3. Assert that the member is now present in the smart contracts storage data
    });
  }); 

  function signMembershipData(memdata, signer, contractAddress) {
    // This call equivalent to getMemberHash in contract
    const memHash = getMemberHash(memdata);


    function getMemberHash(member) {
      return hashEIP712Message(hashMember(member));
    }

    function hashMember(member) {
      // abi.encodePacked() the struct
    }

    function hashEIP712Message() {

    }
  }



});
