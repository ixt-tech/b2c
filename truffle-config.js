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

const HDWalletProvider = require("truffle-hdwallet-provider")
const infuraKey = "af12ea4b3ec64a09bbfd67f9e1156fc7"

const fs = require("fs")
const mnemonic = fs.readFileSync(".secret").toString().trim()

const privateKeys = [
  "e3317f2d3fefbef0cc57d683239ccfa2bb7bb01e3a4e7985659830977941aa07",
  "4b2d989a66fe41ad81b1f3b3812e8b6e0a75657e6f3fe906a5425dc97c183304",
  "8f73351cbd4689f2e48f3ec2a4a8135f6dd3a56bfa21e3dca71f0464ea5cdd5a",
  "5e46142e136e95f7d5c1dcaf6d255abf2035b55fcf03a9e4eeef0933e34960d1",
  "817177bbad7dd496fa8078b15791054e1f0964609aedbba748d90b682a7e6979",
  "3b9fab24e9815c86a12a741a42cd391edf0aa6d85534a3ed275b93ec89a4f9ea",
  "9140d5b2162580615f2672e235adc5d458b2f8626d98ce49325267bdcf8dba1d",
  "45225d0f4d1a2d5c4ccfb07843453306193db0cdb97d2678fb9346100745b292",
  "a9f02278735c17098cebc8ff67507ffd3dbcc276f4295b618e92cff1621ae8aa",
  "5f318c03e0cca55b4a55769131308d7135b8981f057aab5db1e49b33dbd54413"
];

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
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/af12ea4b3ec64a09bbfd67f9e1156fc7", 0)
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
