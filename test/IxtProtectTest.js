const IxtProtect = artifacts.require("./IxtProtect.sol");
const MockToken = artifacts.require("./MockToken.sol");
const BN = web3.utils.BN;

contract("IXTProtect", async (accounts) => {
  let ixtProtect;
  let token;

  const IXTTokenAddress = web3.utils.toChecksumAddress("0xfca47962d45adfdfd1ab2d972315db4ce7ccf094");
  const randomAddress = web3.utils.toChecksumAddress("0x06117af0811a820e2504ca4581225d7e831dfbe6");
  const deployer = accounts[0];
  const validator = accounts[1];
  const user = accounts[2];
  const unusedAccount = accounts[4];
  const Products = { 
    PERSONAL_PROTECTION: 0
  };
  const memberData = {
    membershipNumber: "123123123",
    memberAddress: user,
    productsCovered: [ Products.PERSONAL_PROTECTION ],
    invitationCode: "0x00"
  };
  const TokenAmounts = {
    noTokens: "0",
    // 100 IXT Tokens (with 8 decimals)
    lessThanMinimumStake: "10000000000",
    // 2000 IXT Tokens (with 8 decimals)
    minimumStake: "200000000000",
    // 80000 IXT Tokens (with 8 decimals)
    overMinimumStake: "8000000000000",
    // There are 8 decimals in the IXT ERC20 token
    IXTDecimals: "8"
  };
  const ErrorReasons = {
    onlyValidator: "This function can only be called by the validator.",
    userNotAuthorised: "Member is already authorised.",
    userIsAuthorised: "Member is not authorised.",
    userNotJoined: "Member has already joined.",
    userIsJoined: "Member has not joined.",
    cannotDeposit: "Unable to deposit IXT - check allowance and balance."  
  };

  function authoriseUser(instance, member, sender) {
    return instance.authoriseUser(
      member.membershipNumber,
      member.memberAddress,
      member.productsCovered, 
      member.invitationCode,
      { from: sender }
    );
  }
  function createNewToken() {
    return MockToken.new().then(instance => {
      token = instance;
    });
  }
  function giveUserBalanceOfTokens(userAccount, amount) {
    return token.mint(userAccount, amount);
  }
  function setUserTokenApproval(userAccount, spender, amount) {
    return token.approve(spender, amount, { from: userAccount });
  }
  function deployIxtProtect(validator, tokenAddress) {
    return IxtProtect.new(validator, tokenAddress).then(instance => {
      ixtProtect = instance;
    });
  }

  function prepContracts(member, userBalance, approvalAmount, shouldAuthorise, validatorAddress = validator) {
    return createNewToken().then(() => {
      return giveUserBalanceOfTokens(member.memberAddress, userBalance);
    }).then(() => {
      return deployIxtProtect(validatorAddress, token.address);
    }).then(() => {
      return setUserTokenApproval(member.memberAddress, ixtProtect.address, approvalAmount);
    }).then(() => {
      if (shouldAuthorise) return authoriseUser(ixtProtect, member, validatorAddress);
    });
  }

  beforeEach(async () => {
    await deployIxtProtect(validator, IXTTokenAddress);
  });

  describe("General functionality",  () => {
    it("should inherit the Ownable contract", async () => {
      const owner =  await ixtProtect.owner();
      assert.equal(owner, deployer);
    });

    it("should hold the correct IXTToken address", async () => {
      const addressInContract =  await ixtProtect.IXTToken();
      assert.equal(addressInContract, IXTTokenAddress);
    });

    it("total balance should initially be zero.", async () => {
      const totalBalance =  await ixtProtect.totalBalance();
      assert.equal(totalBalance, "0");
    });

    it("validator should be set correctly.", async () => {
      const _validator =  await ixtProtect.validator();
      assert.equal(_validator, validator);
    });

    it("should expose a public getter for members mapping.", async () => {
      const randomMember = await ixtProtect.members(randomAddress);
      assert.equal(randomMember.authorisedTimestamp, "0");
      assert.equal(randomMember.joinedTimestamp, "0");
    });

    it("should expose a public getter for members array.", () => {
      assert(ixtProtect.hasOwnProperty("membersArray"));
    });

  });

  describe("AuthoriseUser function", () => {
    it("should allow a validator to authorise a new user", async () => {
      await authoriseUser(ixtProtect, memberData, validator);
      const newMember = await ixtProtect.members(memberData.memberAddress);
      assert.equal(newMember.joinedTimestamp, "0");
      assert.equal(newMember.stakeBalance, "0");
      assert.equal(newMember.rewardBalance, "0");
      assert.equal(newMember.membershipNumber, memberData.membershipNumber);
    });

    it("should not allow a validator to authorise an authorised user", async () => {
      const expectedReason = ErrorReasons.userNotAuthorised;
      await authoriseUser(ixtProtect, memberData, validator);
      try {
        await authoriseUser(ixtProtect, memberData, validator);
        assert.fail(`Expected '${expectedReason}' failure not received`);
      } catch (error) {
        assert.equal(error.reason, expectedReason);
      }
    });

    it("should not allow a non-validator to authorise a new user", async () => {
      const expectedReason = ErrorReasons.onlyValidator;
      try {
        await authoriseUser(ixtProtect, memberData, unusedAccount);
        assert.fail(`Expected '${expectedReason}' failure not received`);
      } catch (error) {
        assert.equal(error.reason, expectedReason);
      }
    });

    it("should not allow a non-validator to authorise an authorised user", async () => {
      const expectedReason = ErrorReasons.onlyValidator;
      await authoriseUser(ixtProtect, memberData, validator);
      try {
        await authoriseUser(ixtProtect, memberData, unusedAccount);
        assert.fail(`Expected '${expectedReason}' failure not received`);
      } catch (error) {
        assert.equal(error.reason, expectedReason);
      }
    });
  }); 

  describe("Join function", () => {
    describe("when the allowance has been set to a correct level.", () => {
      describe("and the validator has authorised the user.", () => {
        it("should allow join to be called if the allowance is equal to the minimum stake.", async () => {
          await prepContracts(memberData, TokenAmounts.minimumStake, TokenAmounts.minimumStake, true);
          await ixtProtect.join( { from: memberData.memberAddress });
          const newMember = await ixtProtect.members(memberData.memberAddress);
          assert(newMember.joinedTimestamp != "0");
          assert(newMember.stakeBalance.toString() == TokenAmounts.minimumStake);
          assert.equal(newMember.rewardBalance, "0");
        });
        it("should allow join to be called if the allowance is above the minimum stake.", async () => {
          await prepContracts(memberData, TokenAmounts.overMinimumStake, TokenAmounts.overMinimumStake, true);
          await ixtProtect.join( { from: memberData.memberAddress });
          const newMember = await ixtProtect.members(memberData.memberAddress);
          assert(newMember.joinedTimestamp != "0");
          assert(newMember.stakeBalance.toString() == TokenAmounts.minimumStake);
          assert.equal(newMember.rewardBalance, "0");
        });
        describe("but the balance is not sufficient.", () => {
          it("should not allow join to be called.", async () => {
            await prepContracts(memberData, TokenAmounts.minimumStake, TokenAmounts.minimumStake, true);
            // Reduce the user balance so an unsufficient amount is available
            await token.transfer(randomAddress, "200", { from: memberData.memberAddress });
            const expectedReason = ErrorReasons.cannotDeposit;
            try {
              await ixtProtect.join( { from: memberData.memberAddress });
              assert.fail(`Expected '${expectedReason}' failure not received`);
            } catch (error) {
              assert.equal(error.reason, expectedReason);
            }
          });
        });
      });
      describe("and the validator has not authorised the user.", () => {
        it("should not allow join to be called.", async () => {
          await prepContracts(memberData, TokenAmounts.minimumStake, TokenAmounts.minimumStake, false);
          const expectedReason = ErrorReasons.userIsAuthorised;
          try {
            await ixtProtect.join( { from: memberData.memberAddress });
            assert.fail(`Expected '${expectedReason}' failure not received`);
          } catch (error) {
            assert.equal(error.reason, expectedReason);
          }
        });
      });
    });
    describe("when the allowance has not been set to a correct level.", () => {
      describe("and the validator has authorised the user.", async () => {
        await prepContracts(memberData, TokenAmounts.minimumStake, TokenAmounts.noTokens, true);
        const expectedReason = ErrorReasons.cannotDeposit;
        it("should not allow join to be called (no allowance set).", async () => {
          try {
            await ixtProtect.join( { from: memberData.memberAddress });
            assert.fail(`Expected '${expectedReason}' failure not received`);
          } catch (error) {
            assert.equal(error.reason, expectedReason);
          }
        });
        it("should not allow join to be called (allowance set, but lower than minimum stake).", async () => {
          await token.approve(ixtProtect.address, TokenAmounts.lessThanMinimumStake);
          try {
            await ixtProtect.join( { from: memberData.memberAddress });
            assert.fail(`Expected '${expectedReason}' failure not received`);
          } catch (error) {
            assert.equal(error.reason, expectedReason);
          }
        });
      });
      describe("and the validator has not authorised the user.", () => {
        it("should not allow join to be called.", async () => {
          await prepContracts(memberData, TokenAmounts.minimumStake, TokenAmounts.minimumStake, false);
          const expectedReason = ErrorReasons.userIsAuthorised;
          try {
            await ixtProtect.join( { from: memberData.memberAddress });
            assert.fail(`Expected '${expectedReason}' failure not received`);
          } catch (error) {
            assert.equal(error.reason, expectedReason);
          }
        });
      });
    });
  });

  function balanceCheck(beforeBalance, afterBalance, expectedDifference) {
    const bef = new BN(beforeBalance);
    const aft = new BN(afterBalance);
    const expected = new BN(expectedDifference);
    const expectedAfter = bef.add(expected);
    return aft.eq(expectedAfter);
  }

  describe("Deposit function", () => {
    let val = "1";
    describe("when user is authorised", () => {
      describe("and user is joined", () => {
        describe("and user has sufficient balance", () => {
          it("should allow deposit and user balance and total balance should increase.", async () => {
            await prepContracts(memberData, TokenAmounts.overMinimumStake, TokenAmounts.overMinimumStake, true);
            await ixtProtect.join( { from: memberData.memberAddress });
            const totalBalanceBefore = await ixtProtect.totalBalance();
            const userBalanceBefore = await ixtProtect.members(memberData.memberAddress).then(member => member.stakeBalance);
            await ixtProtect.deposit(val, { from: memberData.memberAddress });
            const totalBalanceAfter = await ixtProtect.totalBalance();
            const userBalanceAfter = await ixtProtect.members(memberData.memberAddress).then(member => member.stakeBalance);
            assert(balanceCheck(totalBalanceBefore, totalBalanceAfter, val));
            assert(balanceCheck(userBalanceBefore, userBalanceAfter, val));
          });
        });
        describe("and user doesn't have sufficient balance", () => {
          it("should not allow deposit.", async () => {
            await prepContracts(memberData, TokenAmounts.overMinimumStake, TokenAmounts.overMinimumStake, true);
            await ixtProtect.join( { from: memberData.memberAddress });
            const expectedReason = ErrorReasons.cannotDeposit;
            try {
              await ixtProtect.deposit("424242424242424242424242424242424242", { from: memberData.memberAddress });
              assert.fail(`Expected '${expectedReason}' failure not received`);
            } catch (error) {
              assert.equal(error.reason, expectedReason);
            }
          });
        });
      });
      describe("and user is not joined", () => {
        it("should not allow deposit.", async () => {
          await prepContracts(memberData, TokenAmounts.overMinimumStake, TokenAmounts.overMinimumStake, true);
          const expectedReason = ErrorReasons.userIsJoined;
          try {
            await ixtProtect.deposit(val, { from: memberData.memberAddress });
            assert.fail(`Expected '${expectedReason}' failure not received`);
          } catch (error) {
            assert.equal(error.reason, expectedReason);
          }
        });
      });
    });
    describe("and user is not authorised", () => {
      it("should not allow deposit.", async () => {
        await prepContracts(memberData, TokenAmounts.overMinimumStake, TokenAmounts.overMinimumStake, false);
        const expectedReason = ErrorReasons.userIsJoined;
        try {
          await ixtProtect.deposit(val, { from: memberData.memberAddress });
          assert.fail(`Expected '${expectedReason}' failure not received`);
        } catch (error) {
          assert.equal(error.reason, expectedReason);
        }
      });
    });
  });

  /*      To Be Completed      */
  describe("Withdraw function", () => {
  });
  describe("GetAccountBalance function", () => {
  });
  describe("GetRewardBalance function", () => {
  });
  describe("Halt function", () => {
  });
  describe("Drain function", () => {
  });
  describe("ReplenishPool function", () => {
  });
});
