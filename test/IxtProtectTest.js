const IxtProtect = artifacts.require("./IxtProtect.sol");
const MockToken = artifacts.require("./MockToken.sol");
const TimeHelper = require("openzeppelin-solidity/test/helpers/time");
const BN = web3.utils.BN;

initialSetup();

contract("IXTProtect", (accounts) => {
  let ixtProtect;
  let token;

  const ixtTokenAddress = web3.utils.toChecksumAddress("0xfca47962d45adfdfd1ab2d972315db4ce7ccf094");
  const randomAddress = web3.utils.toChecksumAddress("0x06117af0811a820e2504ca4581225d7e831dfbe6");
  const zeroedBytes32 = "0x0000000000000000000000000000000000000000000000000000000000000000"; 
  const deployer = accounts[0];
  const validator = accounts[1];
  const unusedAccount = accounts[5];
  const defaultLoyaltyAmount = "10";
  const defaultLoyaltyPeriodDays = "90";
  const memberData = [
    {
      membershipNumber: "0xab12300000000000000000000000000000000000000000000000000000000000",
      memberAddress: accounts[2],
      invitationCode: "0xab00000000000000000000000000000000000000000000000000000000000000"
    },
    {
      membershipNumber: "0xab45600000000000000000000000000000000000000000000000000000000000",
      memberAddress: accounts[3],
      invitationCode: "0xcd00000000000000000000000000000000000000000000000000000000000000"
    },
    {
      membershipNumber: "0xab78900000000000000000000000000000000000000000000000000000000000",
      memberAddress: accounts[4],
      invitationCode: "0xdeadbeef00000000000000000000000000000000000000000000000000000000"
    }
  ];
  const FailTypes = {
    revert: "revert",
    throw: "invalidOpcode",
    outOfGas: "outOfGas"
  };
  const LOW = 0;
  const MEDIUM = 1;
  const HIGH = 2;
  const TokenAmounts = {
    noTokens: "0",
    stakingLevels: [
      "100000000000",  //  1000 IXT  - LOW
      "500000000000",  //  5000 IXT  - MEDIUM
      "1000000000000",  // 10000 IXT - HIGH
    ],
    defaultInvitationReward: "20000000000", // 200 IXT
    lessThanMinimumStake: "99900000000",  //  999 IXT
    // There are 8 decimals in the IXT ERC20 token
    IXTDecimals: "8"
  };
  const ErrorReasons = {
    onlyValidator: "This function can only be called by a validator.",
    userNotAuthorised: "Member is already authorised.",
    userIsAuthorised: "Member is not authorised.",
    userNotJoined: "Member has already joined.",
    userIsJoined: "Member has not joined.",
    cannotDeposit: "Unable to deposit IXT - check allowance and balance.",
    minStakePeriodNotComplete: "Minimum stake period is not complete.",
    withdrawInsufficientBalance: "Unable to withdraw this value of IXT.",
    onlyOwner: "Only the owner can call this function.",
    invalidOpcode: "Returned error: VM Exception while processing transaction: invalid opcode",
    onlyPauser: "Can only be called by pauser.",
    whenNotPaused: "Cannot call when paused.",
    whenPaused: "Can only call this when paused.",
    isValidStakeLevel: "Is not valid a staking level.",
    isValidLoyaltyAmount: "Loyalty reward amount must be between 0 and 100.",
    noRewardsToClaim: "You have no rewards to claim.",
    poolBalanceTooLow: "Pool balance not sufficient to withdraw rewards."
  };
  const lessDaysThanMinimumStakePeriod = parseInt(defaultLoyaltyPeriodDays) - 1;
  const moreDaysThanMinimumStakePeriod = parseInt(defaultLoyaltyPeriodDays) + 1;

  function authoriseUser(instance, member, referralInvitationCode, sender) {
    return instance.authoriseUser(
      member.membershipNumber,
      member.memberAddress,
      member.invitationCode,
      referralInvitationCode,
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
    return IxtProtect.new(
      validator,
      defaultLoyaltyPeriodDays,
      tokenAddress,
      TokenAmounts.defaultInvitationReward,
      defaultLoyaltyAmount,
      TokenAmounts.stakingLevels,
      { from: deployer }
    ).then(instance => {
      ixtProtect = instance;
    });
  }

  function prepContracts(member, referralInvitationCode, userBalance, approvalAmount, shouldAuthorise, validatorAddress = validator) {
    return createNewToken().then(() => {
      return giveUserBalanceOfTokens(member.memberAddress, userBalance);
    }).then(() => {
      return giveUserBalanceOfTokens(deployer, userBalance);
    }).then(() => {
      return deployIxtProtect(validatorAddress, token.address, { from: deployer });
    }).then(() => {
      return setUserTokenApproval(member.memberAddress, ixtProtect.address, approvalAmount);
    }).then(() => {
      return setUserTokenApproval(deployer, ixtProtect.address, approvalAmount);
    }).then(() => {
      if (shouldAuthorise) return authoriseUser(ixtProtect, member, referralInvitationCode, validatorAddress);
    });
  }

  function balanceCheck(beforeBalance, afterBalance, expectedDifference) {
    const bef = new BN(beforeBalance);
    const aft = new BN(afterBalance);
    const expected = new BN(expectedDifference);
    const expectedAfter = bef.add(expected);
    return aft.eq(expectedAfter);
  }

  function getBlockTimestamp(tx) {
    return web3.eth.getBlock(tx.receipt.blockHash).then(b => b.timestamp);
  }

  async function newMemberJoins(member, referralInvitationCode) {
    await giveUserBalanceOfTokens(member.memberAddress, TokenAmounts.stakingLevels[LOW]);
    await setUserTokenApproval(member.memberAddress, ixtProtect.address, TokenAmounts.stakingLevels[LOW]);
    await authoriseUser(ixtProtect, member, referralInvitationCode, validator);
    await ixtProtect.join(LOW, { from: member.memberAddress });
  }
  async function recordBalances(userAddress) {
    const balances = {};
    balances.poolBalance = await returnsZeroOnThrow(ixtProtect.totalPoolBalance());
    balances.totalMemberBalance = await returnsZeroOnThrow(ixtProtect.totalMemberBalance());
    balances.userTokenBalance = await returnsZeroOnThrow(token.balanceOf(userAddress));
    balances.deployerTokenBalance = await returnsZeroOnThrow(token.balanceOf(deployer));
    balances.userAccountBalance = await returnsZeroOnThrow(ixtProtect.getAccountBalance(userAddress));
    balances.userStakeBalance = await returnsZeroOnThrow(ixtProtect.getStakeBalance(userAddress));
    balances.userRewardBalance = await returnsZeroOnThrow(ixtProtect.getRewardBalance(userAddress));

    return balances;

    async function returnsZeroOnThrow(promise) {
      let result;
      try {
        result = await promise; 
      } catch (error) {
        return "0";
      }
      return result;
    }
  }

  function passTimeinDays(daysToPass) {
    return TimeHelper.increase(TimeHelper.duration.days(daysToPass));
  }

  function passTimeinHours(hoursToPass) {
    return TimeHelper.increase(TimeHelper.duration.hours(hoursToPass));
  }

  function getLoyaltyRewardAmount(_stakingAmount, _loyaltyRewardAmount, _numPeriods) {
    const stakingAmount = new BN(_stakingAmount);
    const amount = new BN(_loyaltyRewardAmount);
    const oneHundred = new BN("100");
    const numPeriods = new BN(_numPeriods);
    return stakingAmount.mul(amount).div(oneHundred).mul(numPeriods).toString();
  }
  function toIXT(inputString) {
    const input = new BN(inputString);
    const multiplier = new BN("10").pow(new BN(TokenAmounts.IXTDecimals));
    return input.mul(multiplier).toString();
  }

  beforeEach(async () => {
    await deployIxtProtect(validator, ixtTokenAddress);
  });

  describe("General functionality",  () => {
    it("should inherit the Ownable contract", async () => {
      const owner =  await ixtProtect.owner();
      assert.equal(owner, deployer);
    });

    it("should hold the correct ixtToken address", async () => {
      const addressInContract =  await ixtProtect.ixtToken();
      assert.equal(addressInContract, ixtTokenAddress);
    });

    it("total member balance should initially be zero.", async () => {
      const totalMemberBalance =  await ixtProtect.totalMemberBalance();
      assert.equal(totalMemberBalance, "0");
    });

    it("total pool balance should initially be zero.", async () => {
      const totalPoolBalance =  await ixtProtect.totalPoolBalance();
      assert.equal(totalPoolBalance, "0");
    });

    it("validator should be set correctly.", async () => {
      const isValidator =  await ixtProtect.isValidator(validator);
      assert.equal(isValidator, true);
    });

    it("should expose a public getter for members mapping.", async () => {
      const randomMember = await ixtProtect.members(randomAddress);
      assert.equal(randomMember.authorisedTimestamp, "0");
      assert.equal(randomMember.joinedTimestamp, "0");
    });

    it("should expose a public getter for members array.", () => {
      assert(ixtProtect.hasOwnProperty("membersArray"));
    });

    it("should not initially contain any entries in the members array.", async () => {
      await expectThrow(ixtProtect.membersArray(0));
    });

    it("invitationReward should be correct.", async () => {
      const invitationReward =  await ixtProtect.invitationReward();
      assert.equal(invitationReward, TokenAmounts.defaultInvitationReward);
    });

    it("loyaltyRewardAmount should be correct.", async () => {
      const loyaltyRewardAmount =  await ixtProtect.loyaltyRewardAmount();
      assert.equal(loyaltyRewardAmount.toString(), defaultLoyaltyAmount);
    });

    it("should not allow loyaltyRewardAmount that is too high.", async () => {
      await expectRevert(deploy(-1), ErrorReasons.isValidLoyaltyAmount);
      await expectRevert(deploy(101), ErrorReasons.isValidLoyaltyAmount);
      await expectRevert(deploy(41322131), ErrorReasons.isValidLoyaltyAmount);
      function deploy(testAmount) {
        return IxtProtect.new(
          validator,
          defaultLoyaltyPeriodDays,
          ixtTokenAddress,
          TokenAmounts.defaultInvitationReward,
          testAmount,
          TokenAmounts.stakingLevels,
          { from: deployer }
        );
      }
    });

    it("loyaltyPeriod should be correct.", async () => {
      const loyaltyPeriodDays =  await ixtProtect.loyaltyPeriodDays();
      assert.equal(loyaltyPeriodDays, defaultLoyaltyPeriodDays);
    });

    it("staking levels should be correct.", async () => {
      const lowStakingLevel =  await ixtProtect.ixtStakingLevels(LOW).then(v => v.toString());
      const mediumStakingLevel =  await ixtProtect.ixtStakingLevels(MEDIUM).then(v => v.toString());
      const highStakingLevel =  await ixtProtect.ixtStakingLevels(HIGH).then(v => v.toString());
      assert.equal(lowStakingLevel, TokenAmounts.stakingLevels[LOW]);
      assert.equal(mediumStakingLevel, TokenAmounts.stakingLevels[MEDIUM]);
      assert.equal(highStakingLevel, TokenAmounts.stakingLevels[HIGH]);
    });

    it("should only allow you to get three staking levels.", async () => {
      await expectThrow(ixtProtect.ixtStakingLevels(HIGH + 1));
    });
  });

  describe("AuthoriseUser function", () => {
    it("should allow a validator to authorise a new user", async () => {
      const blockTimestamp = await authoriseUser(ixtProtect, memberData[0], zeroedBytes32, validator).then((tx) => getBlockTimestamp(tx));
      const newMember = await ixtProtect.members(memberData[0].memberAddress);
      assert.equal(newMember.authorisedTimestamp, blockTimestamp);
      assert.equal(newMember.joinedTimestamp, "0");
      assert.equal(newMember.startOfLoyaltyRewardEligibility, "0");
      assert.equal(newMember.previouslyAppliedLoyaltyBalance, "0");
      assert.equal(newMember.membershipNumber, memberData[0].membershipNumber);
      assert.equal(newMember.invitationCode, memberData[0].invitationCode);
      assert.equal(newMember.stakeBalance, "0");
      assert.equal(newMember.invitationRewards, "0");
    });

    it("should not allow a validator to authorise an authorised user", async () => {
      await authoriseUser(ixtProtect, memberData[0], zeroedBytes32, validator);
      await expectRevert(
        authoriseUser(ixtProtect, memberData[0], zeroedBytes32, validator),
        ErrorReasons.userNotAuthorised
      );
    });

    it("should not allow a non-validator to authorise a new user", async () => {
      await expectRevert(
        authoriseUser(ixtProtect, memberData[0], zeroedBytes32, unusedAccount),
        ErrorReasons.onlyValidator
      );
    });

    it("should not allow a non-validator to authorise an authorised user", async () => {
      await authoriseUser(ixtProtect, memberData[0], zeroedBytes32, validator);
      await expectRevert(
        authoriseUser(ixtProtect, memberData[0], zeroedBytes32, unusedAccount),
        ErrorReasons.onlyValidator
      );
    });
  }); 

  describe("Join function", () => {
    let code = memberData[1].invitationCode;
    it("should not allow a non-valid staking level.", async () => {
      await prepContracts(memberData[0], code, TokenAmounts.stakingLevels[LOW], TokenAmounts.stakingLevels[LOW], true);
      await expectThrow(ixtProtect.join(LOW - 1, { from: memberData[0].memberAddress }));
      await expectThrow(ixtProtect.join(HIGH + 1, { from: memberData[0].memberAddress }));
      await expectThrow(ixtProtect.join(999, { from: memberData[0].memberAddress }));
    });
    describe("when the allowance has been set to a correct level.", () => {
      describe("and the validator has authorised the user.", () => {
        it("should allow join to be called if the allowance is equal to or above the minimum stake.", async () => {
          await prepContracts(memberData[0], code, TokenAmounts.stakingLevels[LOW], TokenAmounts.stakingLevels[LOW], true);
          let blockTimestamp = await ixtProtect.join(LOW, { from: memberData[0].memberAddress }).then((tx) => getBlockTimestamp(tx));
          let newMember = await ixtProtect.members(memberData[0].memberAddress);
          assert.equal(newMember.joinedTimestamp, blockTimestamp);
          assert.equal(newMember.stakeBalance, TokenAmounts.stakingLevels[LOW]);

          await prepContracts(memberData[0], code, TokenAmounts.stakingLevels[MEDIUM], TokenAmounts.stakingLevels[MEDIUM], true);
          blockTimestamp = await ixtProtect.join(LOW, { from: memberData[0].memberAddress }).then((tx) => getBlockTimestamp(tx));
          newMember = await ixtProtect.members(memberData[0].memberAddress);
          assert.equal(newMember.joinedTimestamp, blockTimestamp);
          assert.equal(newMember.stakeBalance, TokenAmounts.stakingLevels[LOW]);

          await prepContracts(memberData[0], code, TokenAmounts.stakingLevels[MEDIUM], TokenAmounts.stakingLevels[MEDIUM], true);
          blockTimestamp = await ixtProtect.join(MEDIUM, { from: memberData[0].memberAddress }).then((tx) => getBlockTimestamp(tx));
          newMember = await ixtProtect.members(memberData[0].memberAddress);
          assert.equal(newMember.joinedTimestamp, blockTimestamp);
          assert.equal(newMember.stakeBalance, TokenAmounts.stakingLevels[MEDIUM]);

          await prepContracts(memberData[0], code, TokenAmounts.stakingLevels[HIGH], TokenAmounts.stakingLevels[HIGH], true);
          blockTimestamp = await ixtProtect.join(HIGH, { from: memberData[0].memberAddress }).then((tx) => getBlockTimestamp(tx));
          newMember = await ixtProtect.members(memberData[0].memberAddress);
          assert.equal(newMember.joinedTimestamp, blockTimestamp);
          assert.equal(newMember.stakeBalance, TokenAmounts.stakingLevels[HIGH]);
        });
        it("should add the members personal invitation code to the mapping.", async () => {
          await prepContracts(memberData[0], code, TokenAmounts.stakingLevels[HIGH], TokenAmounts.stakingLevels[HIGH], true);
          await ixtProtect.join(HIGH, { from: memberData[0].memberAddress });
          const addr = await ixtProtect.registeredInvitationCodes(memberData[0].invitationCode);
          assert.equal(addr, memberData[0].memberAddress);
        });
        it("should apply the reward to the invitationCodeToClaim's corresponding member address.", async () => {
          await prepContracts(memberData[0], zeroedBytes32, TokenAmounts.stakingLevels[HIGH], TokenAmounts.stakingLevels[HIGH], true);
          const beforeInvitationRewards = await ixtProtect.members(memberData[0].memberAddress).then(m => m.invitationRewards);

          await newMemberJoins(memberData[1], memberData[0].invitationCode);
          await ixtProtect.join(HIGH, { from: memberData[0].memberAddress });

          const afterInvitationRewards = await ixtProtect.members(memberData[0].memberAddress).then(m => m.invitationRewards);
          const shouldBeZero = await ixtProtect.members(memberData[1].memberAddress).then(m => m.invitationRewards);

          assert.equal(beforeInvitationRewards, "0");
          assert.equal(shouldBeZero, "0");
          assert.equal(afterInvitationRewards, TokenAmounts.defaultInvitationReward);

        });
        describe("but the balance is not sufficient.", () => {
          it("should not allow join to be called.", async () => {
            await prepContracts(memberData[0], code, TokenAmounts.stakingLevels[LOW], TokenAmounts.stakingLevels[LOW], true);
            // Reduce the user balance so an unsufficient amount is available
            await token.transfer(randomAddress, "200", { from: memberData[0].memberAddress });
            await expectRevert(
              ixtProtect.join(LOW, { from: memberData[0].memberAddress }),
              ErrorReasons.cannotDeposit
            );
          });
        });
      });
      describe("and the validator has not authorised the user.", () => {
        it("should not allow join to be called.", async () => {
          await prepContracts(memberData[0], code, TokenAmounts.stakingLevels[LOW], TokenAmounts.stakingLevels[LOW], false);
          await expectRevert(
            ixtProtect.join(LOW, { from: memberData[0].memberAddress }),
            ErrorReasons.userIsAuthorised
          );
        });
      });
    });
    describe("when the allowance has not been set to a correct level.", () => {
      describe("and the validator has authorised the user.", () => {
        beforeEach(async () => {
          await prepContracts(memberData[0], code, TokenAmounts.stakingLevels[LOW], TokenAmounts.noTokens, true);
        });
        it("should not allow join to be called (no allowance set).", async () => {
          await expectRevert(
            ixtProtect.join(LOW, { from: memberData[0].memberAddress }),
            ErrorReasons.cannotDeposit
          );
        });
        it("should not allow join to be called (allowance set, but lower than minimum stake).", async () => {
          await token.approve(ixtProtect.address, TokenAmounts.lessThanMinimumStake);
          await expectRevert(
            ixtProtect.join(LOW, { from: memberData[0].memberAddress }),
            ErrorReasons.cannotDeposit
          );
        });
      });
      describe("and the validator has not authorised the user.", () => {
        it("should not allow join to be called.", async () => {
          await prepContracts(memberData[0], code, TokenAmounts.stakingLevels[LOW], TokenAmounts.stakingLevels[LOW], false);
          await expectRevert(
            ixtProtect.join(LOW, { from: memberData[0].memberAddress }),
            ErrorReasons.userIsAuthorised
          );
        });
      });
    });
  });

  describe("Balance getter functions", () => {
    it("should get correct balance from getStakeBalance.", async () => {
      await prepContracts(memberData[0], zeroedBytes32, TokenAmounts.stakingLevels[LOW], TokenAmounts.stakingLevels[LOW], true);
      await ixtProtect.join(LOW, { from: memberData[0].memberAddress });
      const stakeBalance = await ixtProtect.getStakeBalance(memberData[0].memberAddress);
      assert.equal(stakeBalance, TokenAmounts.stakingLevels[LOW]);
    });
    it("should get correct balance from getRewardBalance.", async () => {
      await prepContracts(memberData[0], zeroedBytes32, TokenAmounts.stakingLevels[LOW], TokenAmounts.stakingLevels[LOW], true);
      await ixtProtect.join(LOW, { from: memberData[0].memberAddress });
      const mem0BalanceBefore = await ixtProtect.getRewardBalance(memberData[0].memberAddress);
      await newMemberJoins(memberData[1], memberData[0].invitationCode);
      await newMemberJoins(memberData[2], memberData[0].invitationCode);
      const mem0BalanceAfter = await ixtProtect.getRewardBalance(memberData[0].memberAddress);
      const mem1Balance = await ixtProtect.getRewardBalance(memberData[1].memberAddress);
      const mem2Balance = await ixtProtect.getRewardBalance(memberData[2].memberAddress);
      let expectedReward = (parseInt(TokenAmounts.defaultInvitationReward) * 2).toString();
      assert.equal(mem0BalanceBefore, "0");
      assert.equal(mem1Balance, "0");
      assert.equal(mem2Balance, "0");
      assert.equal(mem0BalanceAfter, expectedReward);
      await passTimeinDays("200");
      const numPeriods = "2";
      let rewardBalance = await ixtProtect.getRewardBalance(memberData[0].memberAddress);
      expectedReward = (parseInt(getLoyaltyRewardAmount(TokenAmounts.stakingLevels[LOW], defaultLoyaltyAmount, numPeriods)) +
        + parseInt(expectedReward)).toString();
      assert.equal(rewardBalance, expectedReward);
    });
    describe("when getting invitation reward balances", () => {
      beforeEach(async () => {
        await prepContracts(memberData[0], zeroedBytes32, TokenAmounts.stakingLevels[LOW], TokenAmounts.stakingLevels[LOW], true);
        await ixtProtect.join(LOW, { from: memberData[0].memberAddress });
      });
      it("should get an initial invitation reward balance value of zero immediately after joining.", async () => {
        const rewardBalance = await ixtProtect.getInvitationRewardBalance(memberData[0].memberAddress);
        assert.equal(rewardBalance, "0");
      });
      it("should get invitation reward balances when they are added.", async () => {
        const mem0BalanceBefore = await ixtProtect.getInvitationRewardBalance(memberData[0].memberAddress);
        await newMemberJoins(memberData[1], memberData[0].invitationCode);
        await newMemberJoins(memberData[2], memberData[0].invitationCode);
        const mem0BalanceAfter = await ixtProtect.getInvitationRewardBalance(memberData[0].memberAddress);
        const mem1Balance = await ixtProtect.getInvitationRewardBalance(memberData[1].memberAddress);
        const mem2Balance = await ixtProtect.getInvitationRewardBalance(memberData[2].memberAddress);
        assert.equal(mem0BalanceBefore, "0");
        assert.equal(mem1Balance, "0");
        assert.equal(mem2Balance, "0");
        assert.equal(mem0BalanceAfter, (parseInt(TokenAmounts.defaultInvitationReward) * 2).toString());
      });
    });
    describe("when getting loyalty reward balances", () => {
      beforeEach(async () => {
        await prepContracts(memberData[0], zeroedBytes32, TokenAmounts.stakingLevels[LOW], TokenAmounts.stakingLevels[LOW], true);
        await ixtProtect.join(LOW, { from: memberData[0].memberAddress });
      });
      it("should get an initial loyalty reward balance value of zero immediately after joining.", async () => {
        const rewardBalance = await ixtProtect.getLoyaltyRewardBalance(memberData[0].memberAddress);
        assert.equal(rewardBalance, "0");
      });
      it("should get a loyalty reward balance value of zero less than 90 days after joining.", async () => {
        await passTimeinDays("88");
        let rewardBalance = await ixtProtect.getLoyaltyRewardBalance(memberData[0].memberAddress);
        assert.equal(rewardBalance, "0");
        await passTimeinDays("1");
        rewardBalance = await ixtProtect.getLoyaltyRewardBalance(memberData[0].memberAddress);
        assert.equal(rewardBalance, "0");
      });
      it("should get correct loyalty reward after 90 days.", async () => {
        await passTimeinDays("90");
        await passTimeinHours("1");
        const numPeriods = "1";
        let rewardBalance = await ixtProtect.getLoyaltyRewardBalance(memberData[0].memberAddress);
        assert.equal(rewardBalance, getLoyaltyRewardAmount(TokenAmounts.stakingLevels[LOW], defaultLoyaltyAmount, numPeriods));
      });
      it("should get correct loyalty rewards after 200 days.", async () => {
        await passTimeinDays("200");
        const numPeriods = "2";
        let rewardBalance = await ixtProtect.getLoyaltyRewardBalance(memberData[0].memberAddress);
        assert.equal(rewardBalance, getLoyaltyRewardAmount(TokenAmounts.stakingLevels[LOW], defaultLoyaltyAmount, numPeriods));
      });
      it("should get correct loyalty in a more complex scenario where rewards are changed.", async () => {
        const stakeLevel = TokenAmounts.stakingLevels[LOW];
        await passTimeinDays("100"); // 1 Period passed since join (100 days total)
        let numPeriodsSinceJoin = "1";
        let numPeriodsSinceRewardChanged = numPeriodsSinceJoin;

        let rewardBalance = await ixtProtect.getLoyaltyRewardBalance(memberData[0].memberAddress);
        assert.equal(rewardBalance, getLoyaltyRewardAmount(stakeLevel, defaultLoyaltyAmount, numPeriodsSinceJoin));

        await passTimeinDays("200"); // 3 Periods passed since join (300 days total)
        numPeriodsSinceJoin = "3";
        numPeriodsSinceRewardChanged = numPeriodsSinceJoin;

        rewardBalance = await ixtProtect.getLoyaltyRewardBalance(memberData[0].memberAddress);
        let expectedRewardUntilNow = getLoyaltyRewardAmount(stakeLevel, defaultLoyaltyAmount, numPeriodsSinceJoin);
        assert.equal(rewardBalance, expectedRewardUntilNow);

        let newLoyaltyRewardAmount = "20";
        await ixtProtect.setLoyaltyRewardAmount(newLoyaltyRewardAmount, { from: deployer });
        numPeriodsSinceRewardChanged = "0";

        rewardBalance = await ixtProtect.getLoyaltyRewardBalance(memberData[0].memberAddress);
        assert.equal(rewardBalance, expectedRewardUntilNow);

        await passTimeinDays("200"); // 5 Periods passed since join (500 days total)
        numPeriodsSinceJoin = "5";
        numPeriodsSinceRewardChanged = "2";

        rewardBalance = await ixtProtect.getLoyaltyRewardBalance(memberData[0].memberAddress);
        let expectedRewardSinceUpdated = getLoyaltyRewardAmount(stakeLevel, newLoyaltyRewardAmount, numPeriodsSinceRewardChanged);
        expectedRewardUntilNow = new BN(expectedRewardUntilNow) .add(new BN(expectedRewardSinceUpdated));
        assert.equal(rewardBalance.toString(), expectedRewardUntilNow.toString());

        await passTimeinDays("100"); // 6 Periods passed since join (600 days total)
        numPeriodsSinceJoin = "6";
        numPeriodsSinceRewardChanged = "3";

        rewardBalance = await ixtProtect.getLoyaltyRewardBalance(memberData[0].memberAddress);
        expectedRewardUntilNow = expectedRewardUntilNow.add(new BN(getLoyaltyRewardAmount(stakeLevel, newLoyaltyRewardAmount, "1")));
        assert.equal(rewardBalance.toString(), expectedRewardUntilNow.toString());

        newLoyaltyRewardAmount = "50";
        await ixtProtect.setLoyaltyRewardAmount(newLoyaltyRewardAmount, { from: deployer });

        rewardBalance = await ixtProtect.getLoyaltyRewardBalance(memberData[0].memberAddress);
        assert.equal(rewardBalance.toString(), expectedRewardUntilNow.toString());

        await passTimeinDays("100"); // 6 Periods passed since join (600 days total)
        numPeriodsSinceJoin = "7";
        numPeriodsSinceRewardChanged = "1";

        rewardBalance = await ixtProtect.getLoyaltyRewardBalance(memberData[0].memberAddress);
        expectedRewardUntilNow = expectedRewardUntilNow.add(new BN(getLoyaltyRewardAmount(stakeLevel, newLoyaltyRewardAmount, "1")));
        assert.equal(rewardBalance.toString(), expectedRewardUntilNow.toString());
      });
    });
    it("should get correct balance from getAccountBalance.", async () => {
      await prepContracts(memberData[0], zeroedBytes32, TokenAmounts.stakingLevels[LOW], TokenAmounts.stakingLevels[LOW], true);
      await ixtProtect.join(LOW, { from: memberData[0].memberAddress });
      const accountBalance = await ixtProtect.getAccountBalance(memberData[0].memberAddress);
      assert.equal(accountBalance, TokenAmounts.stakingLevels[LOW]);
    });
  });

  describe("CancelMembership function", () => {
    beforeEach(async () => {
      await prepContracts(memberData[0], zeroedBytes32, TokenAmounts.stakingLevels[LOW], TokenAmounts.stakingLevels[LOW], true);
    });
    it("should not allow a member to cancel if they are not joined.", async () => {
      expectRevert(
        ixtProtect.cancelMembership(),
        ErrorReasons.userIsJoined
      );
    });
    it("should allow a member to cancel if they are joined.", async () => {
      await ixtProtect.join(LOW, { from: memberData[0].memberAddress } );
      await ixtProtect.cancelMembership({ from: memberData[0].memberAddress });
      const joinedTimestamp = await ixtProtect.members(memberData[0].memberAddress).then(m => m.joinedTimestamp);
      assert.equal(joinedTimestamp, "0");
    });
    it("should refund a member their stake and rewards if they cancel their membership.", async () => {
      await ixtProtect.join(LOW, { from: memberData[0].memberAddress } );
      let expectedRefund = new BN(TokenAmounts.stakingLevels[LOW]);

      await ixtProtect.depositPool(TokenAmounts.stakingLevels[LOW], { from: deployer });
      await giveUserBalanceOfTokens(memberData[1].memberAddress, TokenAmounts.stakingLevels[LOW]);
      await setUserTokenApproval(memberData[1].memberAddress, ixtProtect.address, TokenAmounts.stakingLevels[LOW]);

      await authoriseUser(ixtProtect, memberData[1], memberData[0].invitationCode, validator);

      await ixtProtect.join(LOW, { from: memberData[1].memberAddress } );
      expectedRefund = expectedRefund.add(new BN(TokenAmounts.defaultInvitationReward));
      
      await passTimeinDays("100"); // 1 Period passed since join (100 days total)

      const beforeBalances = await recordBalances(memberData[0].memberAddress);

      const loyaltyAmount = await getLoyaltyRewardAmount(TokenAmounts.stakingLevels[LOW], defaultLoyaltyAmount, "1");
      expectedRefund = expectedRefund.add(new BN(loyaltyAmount));
      assert.equal(beforeBalances.userAccountBalance.toString(), expectedRefund.toString());

      await ixtProtect.cancelMembership({ from: memberData[0].memberAddress });


      const afterBalances = await recordBalances(memberData[0].memberAddress);
      assert.equal(balanceCheck(beforeBalances.userTokenBalance, afterBalances.userTokenBalance, expectedRefund), true);
      assert.equal(afterBalances.userAccountBalance, "0");
    });
  });

  describe("ClaimRewards function", () => {
    beforeEach(async () => {
      await prepContracts(memberData[0], zeroedBytes32, toIXT("10000000000000"), toIXT("10000000000000"), true);
      await ixtProtect.join(HIGH, { from: memberData[0].memberAddress } );
    });
    it("should not allow claims there is no balance to claim.", async () => {
      const before = await token.balanceOf(memberData[0].memberAddress);
      await ixtProtect.claimRewards({from: memberData[0].memberAddress});
      const after = await token.balanceOf(memberData[0].memberAddress);
      assert.equal(before.toString(), after.toString());
    });
    it("should not allow claims when the pool balance is too low.", async () => {
      await passTimeinDays("100"); // 1 Period passed since join (100 days total)
      expectRevert(
        ixtProtect.claimRewards({from: memberData[0].memberAddress}),
        ErrorReasons.poolBalanceTooLow
      );
    });
    it("should reduce the pool balance after claiming.", async () => {
      await passTimeinDays("100"); // 1 Period passed since join (100 days total)
      await ixtProtect.depositPool(toIXT("10000"), { from: deployer });
      const beforeBalances = await recordBalances(memberData[0].memberAddress);
      await ixtProtect.claimRewards({from: memberData[0].memberAddress});
      const expectedLoyaltyReward = getLoyaltyRewardAmount(TokenAmounts.stakingLevels[HIGH], defaultLoyaltyAmount, "1");
      const afterBalances = await recordBalances(memberData[0].memberAddress);
      assert.equal(balanceCheck(beforeBalances.poolBalance, afterBalances.poolBalance, "-" + expectedLoyaltyReward), true);
    });
    it("should work as expected in a complex scenario.", async () => {
      await ixtProtect.depositPool(toIXT("100000"), { from: deployer });
      const beforeBalances = await recordBalances(memberData[0].memberAddress);

      const stakeLevel = TokenAmounts.stakingLevels[HIGH];
      await passTimeinDays("100"); // 1 Period passed since join (100 days total)
      let numPeriodsSinceJoin = "1";
      let numPeriodsSinceRewardChanged = numPeriodsSinceJoin;

      let rewardBalance = await ixtProtect.getLoyaltyRewardBalance(memberData[0].memberAddress);
      assert.equal(rewardBalance, getLoyaltyRewardAmount(stakeLevel, defaultLoyaltyAmount, numPeriodsSinceJoin));

      await passTimeinDays("200"); // 3 Periods passed since join (300 days total)
      numPeriodsSinceJoin = "3";
      numPeriodsSinceRewardChanged = numPeriodsSinceJoin;

      rewardBalance = await ixtProtect.getLoyaltyRewardBalance(memberData[0].memberAddress);
      let expectedRewardUntilNow = getLoyaltyRewardAmount(stakeLevel, defaultLoyaltyAmount, numPeriodsSinceJoin);
      assert.equal(rewardBalance, expectedRewardUntilNow);

      let newLoyaltyRewardAmount = "20";
      await ixtProtect.setLoyaltyRewardAmount(newLoyaltyRewardAmount, { from: deployer });
      numPeriodsSinceRewardChanged = "0";

      rewardBalance = await ixtProtect.getLoyaltyRewardBalance(memberData[0].memberAddress);
      assert.equal(rewardBalance, expectedRewardUntilNow);

      await passTimeinDays("200"); // 5 Periods passed since join (500 days total)
      numPeriodsSinceJoin = "5";
      numPeriodsSinceRewardChanged = "2";

      rewardBalance = await ixtProtect.getLoyaltyRewardBalance(memberData[0].memberAddress);
      let expectedRewardSinceUpdated = getLoyaltyRewardAmount(stakeLevel, newLoyaltyRewardAmount, numPeriodsSinceRewardChanged);
      expectedRewardUntilNow = new BN(expectedRewardUntilNow) .add(new BN(expectedRewardSinceUpdated));
      assert.equal(rewardBalance.toString(), expectedRewardUntilNow.toString());

      await passTimeinDays("100"); // 6 Periods passed since join (600 days total)
      numPeriodsSinceJoin = "6";
      numPeriodsSinceRewardChanged = "3";

      rewardBalance = await ixtProtect.getLoyaltyRewardBalance(memberData[0].memberAddress);
      expectedRewardUntilNow = expectedRewardUntilNow.add(new BN(getLoyaltyRewardAmount(stakeLevel, newLoyaltyRewardAmount, "1")));
      assert.equal(rewardBalance.toString(), expectedRewardUntilNow.toString());

      newLoyaltyRewardAmount = "50";
      await ixtProtect.setLoyaltyRewardAmount(newLoyaltyRewardAmount, { from: deployer });

      rewardBalance = await ixtProtect.getLoyaltyRewardBalance(memberData[0].memberAddress);
      assert.equal(rewardBalance.toString(), expectedRewardUntilNow.toString());

      await passTimeinDays("100"); // 6 Periods passed since join (600 days total)
      numPeriodsSinceJoin = "7";
      numPeriodsSinceRewardChanged = "1";

      rewardBalance = await ixtProtect.getLoyaltyRewardBalance(memberData[0].memberAddress);
      expectedRewardUntilNow = expectedRewardUntilNow.add(new BN(getLoyaltyRewardAmount(stakeLevel, newLoyaltyRewardAmount, "1")));
      assert.equal(rewardBalance.toString(), expectedRewardUntilNow.toString());

      await ixtProtect.claimRewards({from: memberData[0].memberAddress});

      const afterBalances = await recordBalances(memberData[0].memberAddress);
      assert.equal(balanceCheck(beforeBalances.userTokenBalance, afterBalances.userTokenBalance, expectedRewardUntilNow), true);
      assert.equal(afterBalances.userRewardBalance, "0");
      assert.equal(afterBalances.userStakeBalance, TokenAmounts.stakingLevels[HIGH]);
      assert.equal(afterBalances.userAccountBalance, TokenAmounts.stakingLevels[HIGH]);
    });
  });

  describe("DepositPool and WithdrawPool functions", () => {
    let depositAmount = "1";
    beforeEach(async () => {
      await prepContracts(memberData[0], zeroedBytes32, TokenAmounts.stakingLevels[HIGH], TokenAmounts.stakingLevels[HIGH], true);
      await ixtProtect.join(HIGH, { from: memberData[0].memberAddress } );
    });
    it("should allow the contract owner to deposit into the pool.", async () => {
      const before = await recordBalances(deployer);
      await ixtProtect.depositPool(depositAmount, { from: deployer });
      const after = await recordBalances(deployer);

      assert(balanceCheck(before.poolBalance, after.poolBalance, depositAmount));
      assert(balanceCheck(before.userTokenBalance, after.userTokenBalance, "-" + depositAmount));
    });
    it("should allow the contract owner to withdraw from the pool.", async () => {
      await ixtProtect.depositPool(depositAmount, { from: deployer });
      const before = await recordBalances(deployer);
      await ixtProtect.withdrawPool(depositAmount, { from: deployer });
      const after = await recordBalances(deployer);

      assert(balanceCheck(before.poolBalance, after.poolBalance, "-" + depositAmount));
      assert(balanceCheck(before.userTokenBalance, after.userTokenBalance, depositAmount));
    });
    it("should not allow the contract owner to withdraw more funds from the pool than are available.", async () => {
      await expectRevert(ixtProtect.withdrawPool(depositAmount, { from: deployer }), ErrorReasons.withdrawInsufficientBalance);
    });
    it("should not allow a non-owner account to deposit into the pool.", async () => {
      await expectRevert(ixtProtect.depositPool(depositAmount, { from: memberData[0].memberAddress }), ErrorReasons.onlyOwner);
    });
    it("should not allow a non-owner account to withdraw from the pool.", async () => {
      await expectRevert(ixtProtect.withdrawPool(depositAmount, { from: memberData[0].memberAddress }), ErrorReasons.onlyOwner);
    });
  });
  describe("RemoveMember function", () => {
    beforeEach(async () => {
      await prepContracts(memberData[0], zeroedBytes32, TokenAmounts.stakingLevels[HIGH], TokenAmounts.stakingLevels[HIGH], true);
      await ixtProtect.join(HIGH, { from: memberData[0].memberAddress } );
    });
    describe("when called by an owner", () => {
      it("should remove all data about a member.", async () => {
        const addedMember = await ixtProtect.members(memberData[0].memberAddress);
        assert.notEqual(addedMember.joinedTimestamp, "0");
      
        await ixtProtect.removeMember(memberData[0].memberAddress, { from: deployer });

        const removedMember = await ixtProtect.members(memberData[0].memberAddress);
        expectThrow(ixtProtect.membersArray("0"));
        assert.equal(removedMember.authorisedTimestamp.toString(), "0");
        assert.equal(removedMember.joinedTimestamp.toString(), "0");
        assert.equal(removedMember.membershipNumber.toString(), zeroedBytes32);
        assert.equal(removedMember.invitationCode.toString(), zeroedBytes32);
      });
      it("should refund all stake and reward balance back to the removed user, but other balances remain the same.", async () => {
        await giveUserBalanceOfTokens(memberData[1].memberAddress, TokenAmounts.stakingLevels[HIGH]);
        await setUserTokenApproval(memberData[1].memberAddress, ixtProtect.address, TokenAmounts.stakingLevels[HIGH]);
        await authoriseUser(ixtProtect, memberData[1], zeroedBytes32, validator);
        await ixtProtect.join(HIGH, { from: memberData[1].memberAddress } );

        const beforeBalancesUser1 = await recordBalances(memberData[0].memberAddress);
        const beforeBalancesUser2 = await recordBalances(memberData[1].memberAddress);
        await ixtProtect.removeMember(memberData[0].memberAddress, { from: deployer });
        const afterBalancesUser1 = await recordBalances(memberData[0].memberAddress);
        const afterBalancesUser2 = await recordBalances(memberData[1].memberAddress);

        assert(balanceCheck(beforeBalancesUser1.totalMemberBalance, afterBalancesUser1.totalMemberBalance, "-" + TokenAmounts.stakingLevels[HIGH]));
        assert(balanceCheck(beforeBalancesUser1.userAccountBalance, afterBalancesUser1.userAccountBalance, "-" + TokenAmounts.stakingLevels[HIGH]));
        assert(balanceCheck(beforeBalancesUser1.userStakeBalance, afterBalancesUser1.userStakeBalance, "-" + TokenAmounts.stakingLevels[HIGH]));
        assert(balanceCheck(beforeBalancesUser1.userTokenBalance, afterBalancesUser1.userTokenBalance, TokenAmounts.stakingLevels[HIGH]));

        assert(balanceCheck(beforeBalancesUser2.userAccountBalance, afterBalancesUser2.userAccountBalance, "0"));
        assert(balanceCheck(beforeBalancesUser2.userStakeBalance, afterBalancesUser2.userStakeBalance, "0"));
        assert(balanceCheck(beforeBalancesUser2.userTokenBalance, afterBalancesUser2.userTokenBalance, "0"));
      });
    });
  });
  describe("Drain function", () => {
    let poolDeposit = TokenAmounts.lessThanMinimumStake;
    let beforeBalancesUser1;
    let afterBalancesUser1;
    let beforeBalancesUser2;
    let afterBalancesUser2;
    beforeEach(async () => {
      await prepContracts(memberData[0], zeroedBytes32, TokenAmounts.stakingLevels[HIGH], TokenAmounts.stakingLevels[HIGH], true);
      await ixtProtect.join(HIGH, { from: memberData[0].memberAddress } );

      await giveUserBalanceOfTokens(memberData[1].memberAddress, TokenAmounts.stakingLevels[HIGH]);
      await setUserTokenApproval(memberData[1].memberAddress, ixtProtect.address, TokenAmounts.stakingLevels[HIGH]);
      await authoriseUser(ixtProtect, memberData[1], zeroedBytes32, validator);
      await ixtProtect.join(HIGH, { from: memberData[1].memberAddress } );

      await ixtProtect.depositPool(poolDeposit, { from: deployer });
      beforeBalancesUser1 = await recordBalances(memberData[0].memberAddress);
      beforeBalancesUser2 = await recordBalances(memberData[1].memberAddress);
    });
    describe("when called by a non-owner", () => {
      it("should revert with the correct message.", async () => {
        expectRevert(
          ixtProtect.drain({ from: memberData[0].memberAddress }),
          ErrorReasons.onlyOwner
        );
      });
    });
    describe("when called by the contract owner", () => {
      const memberAddresses = [memberData[0].memberAddress, memberData[1].memberAddress];
      beforeEach(async () => {
        await ixtProtect.drain({ from: deployer });
        afterBalancesUser1 = await recordBalances(memberData[0].memberAddress);
        afterBalancesUser2 = await recordBalances(memberData[1].memberAddress);
      });
      it("should refund all user balances back to the respective accounts.", async () => {
        assert(balanceCheck(beforeBalancesUser1.userAccountBalance, afterBalancesUser1.userAccountBalance, "-" + TokenAmounts.stakingLevels[HIGH]));
        assert(balanceCheck(beforeBalancesUser1.userStakeBalance, afterBalancesUser1.userStakeBalance, "-" + TokenAmounts.stakingLevels[HIGH]));
        assert(balanceCheck(beforeBalancesUser1.userTokenBalance, afterBalancesUser1.userTokenBalance, TokenAmounts.stakingLevels[HIGH]));

        assert(balanceCheck(beforeBalancesUser2.userAccountBalance, afterBalancesUser2.userAccountBalance, "-" + TokenAmounts.stakingLevels[HIGH]));
        assert(balanceCheck(beforeBalancesUser2.userStakeBalance, afterBalancesUser2.userStakeBalance, "-" + TokenAmounts.stakingLevels[HIGH]));
        assert(balanceCheck(beforeBalancesUser2.userTokenBalance, afterBalancesUser2.userTokenBalance, TokenAmounts.stakingLevels[HIGH]));
      });
      it("should reduce total member balance to zero.", async () => {
        assert.equal(afterBalancesUser1.totalMemberBalance.toString(), "0");
      });
      it("should refund pool balances back to the owner.", async () => {
        assert.equal(afterBalancesUser1.poolBalance.toString(), "0");
        assert(balanceCheck(beforeBalancesUser1.deployerTokenBalance, afterBalancesUser1.deployerTokenBalance, poolDeposit));
      });
      it("should remove all member data.", async () => {
        for (const i in memberAddresses) {
          const memberAddress = memberAddresses[i];
          const removedMember = await ixtProtect.members(memberAddress);
          expectThrow(ixtProtect.membersArray("0"));
          assert.equal(removedMember.authorisedTimestamp.toString(), "0");
          assert.equal(removedMember.joinedTimestamp.toString(), "0");
          assert.equal(removedMember.membershipNumber.toString(), zeroedBytes32);
          assert.equal(removedMember.invitationCode.toString(), zeroedBytes32);
        }
      });
    });
  });
  describe("Pause and Unpause functions", () => {
    describe("when not called by the contract owner", () => {
      beforeEach(async () => {
        await prepContracts(memberData[0], zeroedBytes32, TokenAmounts.stakingLevels[HIGH], TokenAmounts.stakingLevels[HIGH], true);
        await ixtProtect.join(HIGH, { from: memberData[0].memberAddress } );
      });
      describe("when pause is called", () => {
        it("should revert with the correct message.", async () => {
          await expectRevert(
            ixtProtect.pause({ from: memberData[0].memberAddress }),
            ErrorReasons.onlyPauser 
          );
        });
      });
      describe("when unpause is called", () => {
        it("should revert with the correct message.", async () => {
          await ixtProtect.pause({ from: deployer });
          await expectRevert(
            ixtProtect.unpause({ from: memberData[0].memberAddress }),
            ErrorReasons.onlyPauser 
          );
        });
      });
    });
    describe("when called by the contract owner", () => {
      beforeEach(async () => {
        await prepContracts(memberData[0], zeroedBytes32, TokenAmounts.stakingLevels[HIGH], TokenAmounts.stakingLevels[HIGH], true);
      });
      describe("when pause is called", () => {
        it("should pause join function.", async () => {
          await ixtProtect.pause({ from: deployer });
          await expectRevert(
            ixtProtect.join(HIGH, { from: memberData[0].memberAddress } ),
            ErrorReasons.whenNotPaused 
          );
        });
        it("should not pause any other functions.", async () => {
          await ixtProtect.join(HIGH, { from: memberData[0].memberAddress } );
          await ixtProtect.pause({ from: deployer });
          await authoriseUser(ixtProtect, memberData[1], zeroedBytes32, validator);
          await ixtProtect.removeMember(memberData[0].memberAddress, { from: deployer });
          await ixtProtect.depositPool("42", { from: deployer });
          await ixtProtect.withdrawPool("42", { from: deployer });
          await ixtProtect.drain({ from: deployer });
        });
        it("should revert with the correct message if pause is called again.", async () => {
          await ixtProtect.pause({ from: deployer });
          await expectRevert(
            ixtProtect.pause({ from: deployer }),
            ErrorReasons.whenNotPaused 
          );
        });
      });
      describe("when unpause is called", () => {
        it("should revert with the correct message if not already paused.", async () => {
          await expectRevert(
            ixtProtect.unpause({ from: deployer }),
            ErrorReasons.whenPaused 
          );
        });
        it("should revert with the correct message if unpause is called again.", async () => {
          await ixtProtect.pause({ from: deployer });
          await ixtProtect.unpause({ from: deployer });
          await expectRevert(
            ixtProtect.unpause({ from: deployer }),
            ErrorReasons.whenPaused 
          );
        });
        it("should unpause join function.", async () => {
          await ixtProtect.pause({ from: deployer });
          await ixtProtect.unpause({ from: deployer });
          await ixtProtect.join(HIGH, { from: memberData[0].memberAddress } );
        });
      });
    });
  });
  describe("setInvitationReward function", () => {
    const newReward = "42";
    it("should work when called by the owner account.", async () => {
      const oldReward =  await ixtProtect.invitationReward();
      assert.equal(oldReward, TokenAmounts.defaultInvitationReward);
      await ixtProtect.setInvitationReward(newReward, { from: deployer });
      const invitationReward =  await ixtProtect.invitationReward();
      assert.equal(invitationReward, newReward);
    });
    it("should revert with correct message if not called by owner account.", async () => {
      await expectRevert(
        ixtProtect.setInvitationReward(newReward, { from: memberData[1].memberAddress }),
        ErrorReasons.onlyOwner 
      );
    });
  });
  describe("setLoyaltyRewardAmount function", () => {
    const newRewardAmount = "42";
    it("should work when called by the owner account.", async () => {
      const oldRewardAmount =  await ixtProtect.loyaltyRewardAmount();
      assert.equal(oldRewardAmount, defaultLoyaltyAmount);
      await ixtProtect.setLoyaltyRewardAmount(newRewardAmount, { from: deployer });
      const loyaltyRewardAmount =  await ixtProtect.loyaltyRewardAmount();
      assert.equal(loyaltyRewardAmount, newRewardAmount);
    });
    it("should revert with correct message if not called by owner account.", async () => {
      await expectRevert(
        ixtProtect.setLoyaltyRewardAmount(newRewardAmount, { from: memberData[0].memberAddress }),
        ErrorReasons.onlyOwner 
      );
    });
  });
  describe("loyaltyPeriodDays function", () => {
    it("should return the correct value.", async () => {
      const loyaltyPeriodDays =  await ixtProtect.loyaltyPeriodDays();
      assert.equal(loyaltyPeriodDays, defaultLoyaltyPeriodDays);
    });
  });
});

function initialSetup() {
  // assert.fail() not displaying error messages, so replacing
  assert.fail = message => assert(false, message);

  // Workaround for curent web3v1 issue, see:
  // https://github.com/trufflesuite/truffle-contract/issues/57#issuecomment-331300494
  if (typeof web3.currentProvider.sendAsync !== "function") {
    web3.currentProvider.sendAsync = function() {
      return web3.currentProvider.send.apply(
        web3.currentProvider,
        arguments
      );
    };
  }
}

async function shouldFailWithMessage(promise, failType, message = "") {
  try {
    await promise;
  } catch (error) {
    assert.include(error.message, failType, `Wrong failure type, expected '${failType}'`);
    switch (failType) {
    case "revert":
      if (message !== "") assert.equal(error.reason, message);
      break;
    case "invalid opcode":
      if (message !== "") {
        assert.include(error.message, message, `Wrong failure type, expected '${message}'`);
      }
      break;
    default:
      assert.fail(`Failure type '${failType}' not recognised.`);
      break;
    }
    return;
  }

  const failureString = failType + (message === "" ? "" : (": " + message));
  assert.fail(`Expected failure '${failureString}' failure not received`);
}

async function expectRevert(promise, message = "") {
  await shouldFailWithMessage(promise, "revert", message);
}

async function expectThrow(promise, message = "") {
  await shouldFailWithMessage(promise, "invalid opcode", message);
}

async function expectOutOfGas(promise, message = "") {
  await shouldFailWithMessage(promise, "out of gas", message);
}
