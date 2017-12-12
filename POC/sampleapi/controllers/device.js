var express = require('express'),
    router = express.Router(),
    jwt = require('jsonwebtoken'),
    connection = require('../helpers/mongo_connections.js'),
    smart_contract = require('../helpers/smart_contract.js'),
    NestApi = require('nest-api');

router.use(function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, 'shhhhh', function (err, decoded) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });

    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
})

router.get('/deviceTypes', function (req, res) {
    connection.db.collection('devicetypes').find().toArray(function (err, deviceTypes) {
        if (err) throw err;
        res.json({
            success: true,
            deviceTypes: deviceTypes
        });
    });
});

router.post('/nestcamDevices', function (req, res) {
    nestApi = new NestApi(req.body.username, req.body.password)
    nestApi.login(function (data) {
        nestApi.get(function (data) {
            var quartz = data.quartz
            var device = data.quartz[Object.keys(data.quartz)[0]];
            var contractInstance = smart_contract.contract.at(smart_contract.deployedAddress);
            contractInstance.addDeviceData(device.description, 1, device.serial_number, device.software_version, {
                from: smart_contract.web3.eth.coinbase,
                gas: 900000
            }, (err, transactionHash) => {
                req.body.transactionHash = transactionHash;
                data = {
                    deviceName: device.description,
                    deviceId: 1,
                    serialNumber: device.serial_number,
                    firmwareVersion: device.software_version
                }
                connection.db.collection('apidetails').insertOne(req.body, function (err, result) {
                    if (err) throw err;
                    res.json({
                        success: true,
                        nestcamDevice: data
                    });
                });
            });
        });
    });
});

router.get('/nestcamDevices', function (req, res) {
    var contractInstance = smart_contract.contract.at(smart_contract.deployedAddress);
    var device = contractInstance.getDeviceData.call();
    data = {
        deviceName: device[0],
        deviceId: device[1],
        serialNumber: device[2],
        firmwareVersion: device[3]
    }
    res.json({
        success: true,
        nestcamDevice: data
    });
});

module.exports = router;