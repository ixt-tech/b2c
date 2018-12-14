import Web3 from "web3";

const fromBn = (num) => {
  if(Web3.utils.isBN(num)) {
    return num.toNumber() / 10E7;
  } else {
    return num / 10E7;
  }
}

const toBn = (num) => {

}

export { fromBn, toBn };
