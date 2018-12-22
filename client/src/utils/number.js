import Web3 from "web3";

const fromBn = (num) => {
  if(!num) return 0;
  if(Web3.utils.isBN(num)) {
    return num.toNumber() / 10E7;
  } else {
    return num / 10E7;
  }
}

const asNum = (num) => {
  return num.toNumber();
}

const toBn = (num) => {

}

export { fromBn, toBn, asNum };
