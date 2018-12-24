import Web3 from "web3";
import moment from 'moment';

const fromTimestamp = (timestamp) => {
  if(timestamp.toString() == 0) {
    return '';
  } else {
    return moment.unix(timestamp.toString()).format('DD MMM YYYY HH:mm');
  }
}

const fromDate = (date) => {
  return moment(date).format('DD MMM YYYY HH:mm');
}
export { fromTimestamp, fromDate };
