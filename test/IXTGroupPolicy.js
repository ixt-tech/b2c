const IXTGroupPolicy = artifacts.require("IXTGroupPolicy")

contract("IXT Group Policy", async (accounts) => {

    it("Should inherit the Ownable contract", async () => {
        const instance = await IXTGroupPolicy.deployed()
        const owner =  await instance.owner()
        assert.equal(owner, accounts[0])
    })

})