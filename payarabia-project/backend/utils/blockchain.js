const Web3 = require('web3');

// Initialize Web3
const web3 = new Web3(process.env.BSC_RPC_URL);

// USDT Contract ABI (simplified)
const USDT_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  }
];

// USDT Contract
const usdtContract = new web3.eth.Contract(
  USDT_ABI,
  process.env.USDT_CONTRACT_ADDRESS
);

// Generate new wallet
const generateWallet = () => {
  const account = web3.eth.accounts.create();
  return {
    address: account.address,
    privateKey: account.privateKey,
  };
};

// Get USDT balance
const getUSDTBalance = async (address) => {
  try {
    const balance = await usdtContract.methods.balanceOf(address).call();
    const decimals = await usdtContract.methods.decimals().call();
    return web3.utils.fromWei(balance, 'ether') * Math.pow(10, 18 - decimals);
  } catch (error) {
    console.error('Error getting USDT balance:', error);
    throw error;
  }
};

// Send USDT
const sendUSDT = async (fromPrivateKey, toAddress, amount) => {
  try {
    const account = web3.eth.accounts.privateKeyToAccount(fromPrivateKey);
    const decimals = await usdtContract.methods.decimals().call();
    const amountWei = web3.utils.toWei(
      (amount * Math.pow(10, decimals)).toString(),
      'wei'
    );

    const tx = {
      from: account.address,
      to: process.env.USDT_CONTRACT_ADDRESS,
      data: usdtContract.methods.transfer(toAddress, amountWei).encodeABI(),
      gas: 100000,
    };

    const gasPrice = await web3.eth.getGasPrice();
    tx.gasPrice = gasPrice;

    const signedTx = await web3.eth.accounts.signTransaction(tx, fromPrivateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    return {
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
    };
  } catch (error) {
    console.error('Error sending USDT:', error);
    throw error;
  }
};

// Get transaction details
const getTransactionDetails = async (txHash) => {
  try {
    const tx = await web3.eth.getTransaction(txHash);
    const receipt = await web3.eth.getTransactionReceipt(txHash);
    
    return {
      txHash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      gas: tx.gas,
      gasPrice: tx.gasPrice,
      blockNumber: receipt.blockNumber,
      status: receipt.status,
      gasUsed: receipt.gasUsed,
    };
  } catch (error) {
    console.error('Error getting transaction details:', error);
    throw error;
  }
};

// Get current gas price
const getGasPrice = async () => {
  try {
    const gasPrice = await web3.eth.getGasPrice();
    return web3.utils.fromWei(gasPrice, 'gwei');
  } catch (error) {
    console.error('Error getting gas price:', error);
    throw error;
  }
};

// Validate address
const isValidAddress = (address) => {
  return web3.utils.isAddress(address);
};

// Get block number
const getCurrentBlockNumber = async () => {
  try {
    return await web3.eth.getBlockNumber();
  } catch (error) {
    console.error('Error getting block number:', error);
    throw error;
  }
};

module.exports = {
  generateWallet,
  getUSDTBalance,
  sendUSDT,
  getTransactionDetails,
  getGasPrice,
  isValidAddress,
  getCurrentBlockNumber,
  web3,
};