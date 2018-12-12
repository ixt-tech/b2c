import Web3 from "web3";
import IxtProtect from "../contracts/IxtProtect.json";
import truffleContract from "truffle-contract";

const getContract = (web3) => async() => {
  const Contract = truffleContract(IxtProtect);
  Contract.setProvider(web3.currentProvider);
  const instance = await Contract.deployed();
  return instance;
};

export default getContract;
