pragma solidity ^0.4.4;

contract DeviceMetaData {

  struct Device {
    address _where;
    string _name;
    uint deviceId;
    string deviceSerialId;
    string firmwareVersion;

  }
  address public deviceOwner;
  Device[] public devices;
  //mapping(address => Device) public devices;
  function DeviceMetaData() public {}

  function addDeviceData(string _name, uint deviceId, string deviceSerialId, string firmwareVersion) public {
    deviceOwner = msg.sender;
    devices.push(Device(deviceOwner, _name, deviceId, deviceSerialId, firmwareVersion));
  }
  function getDeviceData() public returns (string, uint, string, string) {
      deviceOwner = msg.sender;
      return (devices[0]._name, devices[0].deviceId, devices[0].deviceSerialId, devices[0].firmwareVersion);
  }
}
