var express = require('express'),
    router = express.Router(),
    jwt = require('jsonwebtoken'),
    connection = require('../helpers/mongo_connections.js'),
    smart_contract = require('../helpers/smart_contract.js'),
    https = require('https'),
    schedule = require('node-schedule'),
    config = require('../config.js');

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
});

router.post('/:isNew', function (req, res) {
    var tiveDeviceId = '';
    var tiveDeviceName = '';
    var options = {
        host: 'api2.prod1.tive.co',
        path: '/api/v2/device',
        method: 'GET',
        headers: {
            TiveApiKey: req.body.apiKey,
            accept: 'application/json'
        }
    };

    var tiveReq = https.request(options, function (tiveRes) {
        var data = [];
        var tiveDeviceId = '';
        var tiveDeviceName = '';
        tiveRes.on('data', function (chunk) {
            data.push(chunk);
        }).on('end', function () {
            var buffer = Buffer.concat(data);
            var resJson = JSON.parse(buffer.toString());
            if (resJson.status === "OK") {
                tiveDeviceId = resJson.result[0].id;
                tiveDeviceName = resJson.result[0].name;
                var options = {
                    host: 'api2.prod1.tive.co',
                    path: '/api/v2/device/' + tiveDeviceId + '/status',
                    method: 'GET',
                    headers: {
                        TiveApiKey: req.body.apiKey,
                        accept: 'application/json'
                    }
                };

                var tiveReq = https.request(options, function (tiveRes) {
                    data = [];
                    tiveRes.on('data', function (chunk) {
                        data.push(chunk);
                    }).on('end', function () {
                        buffer = Buffer.concat(data);
                        resJson = JSON.parse(buffer.toString());
                        if (resJson.status === "OK") {
                            device = resJson.result;
                            var tiveDevice = {
                                deviceName: tiveDeviceName,
                                deviceId: tiveDeviceId,
                                serialNumber: '',
                                firmwareVersion: '',
                                batteryLevel: device.batteryPowerPercent,
                                location: {
                                    lat: device.currentLocation.latitude,
                                    lon: device.currentLocation.longitude
                                },
                                deviceTypeId: req.body.selectedDeviceType.id,
                                loginName: req.body.loginName
                            }
                            var contractInstance = smart_contract.contract.at(smart_contract.deployedAddress);
                            contractInstance.addDeviceData(tiveDevice.deviceName, tiveDevice.deviceId, tiveDevice.serialNumber, tiveDevice.firmwareVersion, {
                                from: smart_contract.web3.eth.coinbase,
                                gas: 900000
                            }, (err, transactionHash) => {
                                req.body.transactionHash = transactionHash;
                                req.body.deviceId = tiveDevice.deviceId;
                                if (req.params.isNew === 'true') {
                                    connection.db.collection('apidetails').insertOne(req.body, function (err, result) {
                                        if (err) throw err;
                                        connection.db.collection('devices').insertOne(tiveDevice, function (err, result) {
                                            if (err) throw err;
                                            res.json({
                                                success: true,
                                                tiveDevice: tiveDevice
                                            });
                                        });
                                    });
                                } else {
                                    connection.db.collection('apidetails').updateOne({
                                        $and: [{
                                            "selectedDeviceType.id": 2
                                        }, {
                                            loginName: req.body.loginName
                                        }]
                                    }, req.body, function (err, result) {
                                        if (err) throw err;
                                        connection.db.collection('devices').updateOne({
                                            $and: [{
                                                deviceId: tiveDevice.deviceId
                                            }, {
                                                loginName: tiveDevice.loginName
                                            }]
                                        }, tiveDevice, function (err, result) {
                                            if (err) throw err;
                                            res.json({
                                                success: true,
                                                tiveDevice: tiveDevice
                                            });
                                        });
                                    });
                                }
                            });
                        }
                    });
                });
                tiveReq.end();
            }
        });
    });
    tiveReq.end();
});

router.get('/blockchain/:deviceId', function (req, res) {
    var contractInstance = smart_contract.contract.at(smart_contract.deployedAddress);
    var device = contractInstance.getDeviceData.call(req.params.deviceId);
    if (device[0] == '') throw new Error('Not Found');
    tiveDevice = {
        deviceName: device[0],
        deviceId: device[1],
        serialNumber: device[2],
        firmwareVersion: device[3]
    }
    res.json({
        success: true,
        tiveDevice: tiveDevice
    });
});

router.get('/:loginName', function (req, res) {
    connection.db.collection('devices').findOne({
        $and: [{
            deviceTypeId: 2
        }, {
            loginName: req.params.loginName
        }]
    }, function (err, tiveDevice) {
        if (err) throw err;
        res.json({
            success: true,
            tiveDevice: tiveDevice
        });
    });
});


module.exports = router;