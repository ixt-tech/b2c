const IxtProtect = artifacts.require("./IxtProtect.sol");

contract("IXTProtect", async (accounts) => {
  let ixtProtect;

  const IXTTokenAddress = web3.utils.toChecksumAddress("0xfca47962d45adfdfd1ab2d972315db4ce7ccf094");
  const randomAddress = web3.utils.toChecksumAddress("0x06117af0811a820e2504ca4581225d7e831dfbe6");
  const deployer = accounts[0];
  const validator = accounts[1];
  const user = accounts[2];
  const Products = { 
    PERSONAL_PROTECTION: 0
  };
  const ErrorReasons = {
    onlyValidator: "This function can only be called by the validator.",
    userNotAuthorised: "Member is already authorised.",
    userIsAuthorised: "Member is not authorised.",
    userNotJoined: "Member has already joined.",
    userIsJoined: "Member has not joined."
  };

  function memberData() {
    return {
      membershipNumber: "123123123",
      memberAddress: user,
      productsCovered: [ Products.PERSONAL_PROTECTION ],
      invitationCode: "0x00"
    };
  }

  beforeEach(async () => {
    ixtProtect = await IxtProtect.new(validator, IXTTokenAddress);
  });

  describe("General functionality", () => {
    it("Should inherit the Ownable contract", async () => {
      const owner =  await ixtProtect.owner();
      assert.equal(owner, deployer);
    });

    it("Should hold the correct IXTToken address", async () => {
      const addressInContract =  await ixtProtect.IXTToken();
      assert.equal(addressInContract, IXTTokenAddress);
    });

    it("Total balance should initially be zero.", async () => {
      const totalBalance =  await ixtProtect.totalBalance();
      assert.equal(totalBalance, "0");
    });

    it("Validator should be set correctly.", async () => {
      const _validator =  await ixtProtect.validator();
      assert.equal(_validator, validator);
    });

    it("Should expose a public getter for members mapping.", async () => {
      const member =  await ixtProtect.members(randomAddress);
      assert.equal(member.authorisedTimestamp, "0");
      assert.equal(member.joinedTimestamp, "0");
    });

    it("Should expose a public getter for members array.", () => {
      assert(ixtProtect.hasOwnProperty("membersArray"));
    });

  });

  describe("AuthoriseUser function", () => {
    let member = memberData();

    it("Should allow a verifier to authorise a new user", async () => {
      await ixtProtect.authoriseUser(member.membershipNumber, member.memberAddress, member.productsCovered, member.invitationCode, { from: validator });
      const newMember = await ixtProtect.members(member.memberAddress);
      assert.equal(newMember.joinedTimestamp, "0");
      assert.equal(newMember.stakeBalance, "0");
      assert.equal(newMember.rewardBalance, "0");
      assert.equal(newMember.membershipNumber, member.membershipNumber);
    });

    it("Should not allow a verifier to authorise an authorised user", async () => {
      const expectedReason = ErrorReasons.userNotAuthorised;
      await ixtProtect.authoriseUser(member.membershipNumber, member.memberAddress, member.productsCovered, member.invitationCode, { from: validator });
      try {
        await ixtProtect.authoriseUser(member.membershipNumber, member.memberAddress, member.productsCovered, member.invitationCode, { from: validator });
        assert.fail(`Expected '${expectedReason}' failure not received`);
      } catch (error) {
        assert.equal(error.reason, expectedReason);
      }
    });

    it("Should not allow a non-verifier to authorise a new user", async () => {
      const expectedReason = ErrorReasons.onlyValidator;
      try {
        await ixtProtect.authoriseUser(member.membershipNumber, member.memberAddress, member.productsCovered, member.invitationCode, { from: accounts[4] });
        assert.fail(`Expected '${expectedReason}' failure not received`);
      } catch (error) {
        assert.equal(error.reason, expectedReason);
      }
    });

    it("Should not allow a non-verifier to authorise an authorised user", async () => {
      const expectedReason = ErrorReasons.onlyValidator;
      try {
        await ixtProtect.authoriseUser(member.membershipNumber, member.memberAddress, member.productsCovered, member.invitationCode, { from: accounts[4] });
        assert.fail(`Expected '${expectedReason}' failure not received`);
      } catch (error) {
        assert.equal(error.reason, expectedReason);
      }
    });
  }); 

  /*      To Be Completed      */
  describe("Join function", () => {
  });
  describe("Deposit function", () => {
  });
  describe("Withdraw function", () => {
  });
  describe("getAccountBalance function", () => {
  });
  describe("getRewardBalance function", () => {
  });
  describe("halt function", () => {
  });
  describe("drain function", () => {
  });
  describe("replenishPool function", () => {
  });
});
