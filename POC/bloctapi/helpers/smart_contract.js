var express = require('express'),
    fs = require('fs'),
    solc = require('solc'),
    Web3 = require('web3'),
    config = require('../config.js');
const web3 = new Web3(new Web3.providers.HttpProvider(config.web3Url));
const input = fs.readFileSync('contracts/devicemetadata.sol');
const output = solc.compile(input.toString(), 1);
const bytecode = output.contracts[':DeviceMetaData'].bytecode;
const abi = JSON.parse(output.contracts[':DeviceMetaData'].interface)
const contract = web3.eth.contract(abi);
const contractInstance = contract.new({
    data: '0x' + bytecode,
    from: web3.eth.coinbase,
    gas: 3000000
}, (err, res) => {
    if (err) {
        console.log(err);
        return;
    }
    // If we have an address property, the contract was deployed
    if (res.address) {
        exports.deployedAddress = res.address;
        exports.contract = contract;
        exports.web3 = web3;
    }
});