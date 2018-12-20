/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like truffle-hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura API
 * keys are available for free at: infura.io/register
 *
 *   > > Using Truffle V5 or later? Make sure you install the `web3-one` version.
 *
 *   > > $ npm install truffle-hdwallet-provider@web3-one
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

const path = require("path");

const HDWalletProvider = require("truffle-hdwallet-provider");
const infuraKey = "af12ea4b3ec64a09bbfd67f9e1156fc7";

const fs = require("fs");
let fileContent = fs.readFileSync(".secret").toString().trim();
const privateKeys = [];
fileContent.split(/\n/).forEach(function(key) {
  privateKeys.push(key);
});

console.log(privateKeys);

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    //
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 9545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },

    live: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://mainnet.infura.io/v3/af12ea4b3ec64a09bbfd67f9e1156fc7", 0)
      },
      network_id: 1,       // Live's id
    },

    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
    ropsten: {
      provider: function() {
        return new HDWalletProvider(privateKeys, "https://ropsten.infura.io/v3/af12ea4b3ec64a09bbfd67f9e1156fc7", 0, 10)
      },
      network_id: 2,       // Ropsten's id
    },

  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.5.1",    // Fetch exact version from solc-bin (default: truffle's version)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "byzantium"
      }
    }
  },
  contracts_build_directory: path.join(__dirname, "client/src/contracts")
};
