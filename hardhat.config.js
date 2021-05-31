// ethers plugin required to interact with the contract
require('@nomiclabs/hardhat-ethers');

// private key from the pre-funded Moonbase Alpha testing account
const { privateKey } = require('./secrets.json');

module.exports = {
  // latest Solidity version
  solidity: "0.8.1",

  networks: {
    // Moonbase Alpha network specification
    moonbase: {
      url: `https://rpc.testnet.moonbeam.network`,
      chainId: 1287,
      accounts: [privateKey]
    },
    matic: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [privateKey]
    }
  }
};