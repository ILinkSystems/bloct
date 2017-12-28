pragma solidity ^0.4.4;

contract DeviceMetaData {

  struct Device {
    address _where;
    string _name;
    string deviceId;
    string deviceSerialId;
    string firmwareVersion;
  }

  struct Transaction {
    address _where;
    string deviceId;
    string transaction;
  }

  address public deviceOwner;
  Device[] public devices;
  Transaction[] public transactions;

  //mapping(address => Device) public devices;
  function DeviceMetaData() public {}

  function stringsEqual(string storage _a, string memory _b) internal returns (bool) {
		bytes storage a = bytes(_a);
		bytes memory b = bytes(_b);
		if (a.length != b.length)
			return false;
		// @todo unroll this loop
		for (uint i = 0; i < a.length; i ++) {
			if (a[i] != b[i]) {
				return false;
      }
    }
		return true;
	}

  function addDeviceData(string _name, string deviceId, string deviceSerialId, string firmwareVersion) public {
    deviceOwner = msg.sender;
    devices.push(Device(deviceOwner, _name, deviceId, deviceSerialId, firmwareVersion));
  }
  function getDeviceData(string deviceId) public returns (string, string, string, string) {
      deviceOwner = msg.sender;
      for (uint i = 0; i < devices.length; i++) {
        if (stringsEqual(devices[i].deviceId, deviceId)) {
          return (devices[i]._name, devices[i].deviceId, devices[i].deviceSerialId, devices[i].firmwareVersion);
        }
      }      
  }
  function addDeviceTransaction(string deviceId, string transaction) public {
    deviceOwner = msg.sender;
    transactions.push(Transaction(deviceOwner, deviceId, transaction));
  }
  function getDeviceTransaction(string deviceId) public returns (string, string) {
      deviceOwner = msg.sender;
      for (uint i = 0; i < transactions.length; i++) {
        if (stringsEqual(transactions[i].deviceId, deviceId)) {
          return (transactions[i].deviceId, transactions[i].transaction);
        }
      }      
  }
}
