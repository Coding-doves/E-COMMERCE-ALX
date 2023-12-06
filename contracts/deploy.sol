const Dai = artifacts.require('dai.sol');
const ercPayment = artifacts.require('ercpayment.sol');
const Web3 = require('web3');

module.exports = async function(deployer, network, addresses){
    const [admin, payer, _] = addresses;

    if(network == 'develop'){
        await deployer.deploy(Dai);
        const dai = await Dai.deployed();
        await dai.faucet(payer, web3.utils.toWei('10000'));

        await deployer.deploy(ercPayment, admin, dai.address);
    } else {
        const ADMIN_ADDRESS = '';
        const DAI_ADDRESS = '';
        await deployer.deploy(ercPayment, ADMIN_ADDRESS, DAI_ADDRESS);
    }
} 
