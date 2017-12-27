import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from '@angular/router';
import { APIService } from '../utils/apiservice';
import { State, process } from '@progress/kendo-data-query';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
    constructor(private apiService: APIService, private router: Router, private domSanitizer: DomSanitizer) { }

    private currentUser: any;
    private deviceTypes: any;
    private selectedDeviceType: any;
    private deviceName: string;
    private username: string;
    private password: string;
    private apiKey = '';
    private lat = 51.673858;
    private lng = 7.815982;
    private showPopup = false;
    private selectedDevice: any;
    private blockchainDevice: any;
    private selectedIdx: number;
    private oldIndex = -1;
    private showWelcome = true;
    private showMap = false;
    private showIframe = false;
    private showBlockchain = false;
    private showDevices = true;
    private showDeviceDetails = false;
    private showProfile = false;
    private arloSiteUrl;
    private allTransactions: any;
    private transactions: any;
    public gridState: State = {
        skip: 0,
        take: 10
    };

    ngOnInit(): void {
        if (!this.apiService.isLoggedIn) {
            this.router.navigate(['/login']);
        }
        this.arloSiteUrl = '';
        this.currentUser = this.apiService.currentUser;
        if (this.apiService.token !== '') {
            this.apiService.getDeviceTypes().then(data => {
                if (data.success) {
                    this.deviceTypes = data.deviceTypes;
                    this.selectedDeviceType = this.deviceTypes[0];
                    this.getDevices();
                }
            });
        }
    }

    public onStateChange(state: State) {
        console.log(state);
        this.gridState = state;
        this.transactions = process(this.allTransactions, this.gridState);
    }

    getDevices() {
        this.apiService.devices = [];
        this.apiService.getiTraqDevices(this.apiService.currentUser.loginName).then(data => {
            if (data.success) {
                if (data.itraqDevice !== null) {
                    data.itraqDevice.status = 'Safe';
                    this.apiService.devices.push(data.itraqDevice);
                }
            }
        });
        this.apiService.getArloDevices(this.apiService.currentUser.loginName).then(data => {
            if (data.success) {
                if (data.arloDevice !== null) {
                    data.arloDevice.status = 'At Risk';
                    data.arloDevice.location = {
                        lat: '',
                        lon: ''
                    };
                    this.apiService.devices.push(data.arloDevice);
                }
            }
        });
    }

    addDevice() {
        this.clearFormData();
        this.showPopup = true;
    }

    saveNewDevice() {
        const body = {
            selectedDeviceType: this.selectedDeviceType,
            deviceName: this.deviceName,
            username: this.username,
            password: this.password,
            apiKey: this.apiKey,
            loginName: this.apiService.currentUser.loginName
        };
        switch (this.selectedDeviceType.id) {
            case 1:
                this.apiService.addiTraqDevices(true, body).then(data => {
                    if (data.success) {
                        this.getDevices();
                    }
                });
                break;
            case 3:
                this.apiService.addArloDevices(true, body).then(data => {
                    if (data.success) {
                        this.getDevices();
                    }
                });
                break;
        }
        this.showPopup = false;
        this.clearFormData();
    }

    assignBlockchainDevice(device) {
        this.blockchainDevice = device;
        this.showWelcome = false;
        this.showMap = false;
        this.showIframe = false;
        this.showBlockchain = true;
    }

    getiTraqBlockchain(deviceId, apiDetails) {
        this.apiService.getiTraqBlockchain(deviceId).then(data => {
            if (data.success) {
                this.assignBlockchainDevice(data.itraqDevice);
                this.apiService.getiTraqTransactions(deviceId).then(res => {
                    if (res.success) {
                        console.log(res.transactions);
                        this.allTransactions = res.transactions;
                        this.transactions = process(this.allTransactions, this.gridState);
                    }
                });
            }
        }).catch(error => {
            if (error.status === 500) {
                for (let i = 0, len = apiDetails.length; i < len; i++) {
                    if (apiDetails[i].selectedDeviceType.id === 1 && apiDetails[i].loginName === this.apiService.currentUser.loginName) {
                        const body = {
                            selectedDeviceType: apiDetails[i].selectedDeviceType,
                            deviceName: apiDetails[i].deviceName,
                            username: apiDetails[i].username,
                            password: apiDetails[i].password,
                            apiKey: apiDetails[i].apiKey,
                            loginName: apiDetails[i].loginName
                        };
                        this.apiService.addiTraqDevices(false, body).then(data => {
                            if (data.success) {
                                this.apiService.getiTraqBlockchain(deviceId).then(result => {
                                    if (result.success) {
                                        this.assignBlockchainDevice(result.itraqDevice);
                                        this.apiService.getiTraqTransactions(deviceId).then(res => {
                                            if (res.success) {
                                                console.log(res.transactions);
                                                this.allTransactions = res.transactions;
                                                this.transactions = process(this.allTransactions, this.gridState);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
    }

    getArloBlockchain(deviceId, apiDetails) {
        this.apiService.getArloBlockchain(deviceId).then(data => {
            if (data.success) {
                this.assignBlockchainDevice(data.arloDevice);
            }
        }).catch(error => {
            if (error.status === 500) {
                for (let i = 0, len = apiDetails.length; i < len; i++) {
                    if (apiDetails[i].selectedDeviceType.id === 3 && apiDetails[i].loginName === this.apiService.currentUser.loginName) {
                        const body = {
                            selectedDeviceType: apiDetails[i].selectedDeviceType,
                            deviceName: apiDetails[i].deviceName,
                            username: apiDetails[i].username,
                            password: apiDetails[i].password,
                            apiKey: apiDetails[i].apiKey,
                            loginName: apiDetails[i].loginName
                        };
                        this.apiService.addArloDevices(false, body).then(data => {
                            if (data.success) {
                                this.apiService.getArloBlockchain(deviceId).then(result => {
                                    if (result.success) {
                                        this.assignBlockchainDevice(result.arloDevice);
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
    }

    clearFormData() {
        this.deviceName = '';
        this.username = '';
        this.password = '';
        this.apiKey = '';
        this.selectedDeviceType = this.deviceTypes[0];
    }

    selectDevice(index, selectedDevice) {
        this.selectedDevice = selectedDevice;
        if (this.oldIndex === index) {
            this.selectedIdx = -1;
            this.oldIndex = -1;
        } else {
            this.selectedIdx = index;
            this.oldIndex = index;
        }
    }

    onLocateOnMap(device) {
        this.showWelcome = false;
        this.showMap = true;
        this.lat = device.location.lat;
        this.lng = device.location.lon;
    }

    onViewDetails(device) {
        this.showDevices = false;
        this.showDeviceDetails = true;
    }

    backFromDeviceDetails() {
        this.showDeviceDetails = false;
        this.showDevices = true;
    }

    onViewBlockChain(device) {
        this.apiService.getApiDetails().then(data => {
            switch (device.deviceTypeId) {
                case 1:
                    this.getiTraqBlockchain(device.deviceId, data.apiDetails);
                    break;
                case 3:
                    this.getArloBlockchain(device.deviceId, data.apiDetails);
                    break;
            }
        });
    }

    backFromBlockchain() {
        this.showBlockchain = false;
        this.showWelcome = true;
    }

    menuClicked() {
        this.showDevices = false;
        this.showDeviceDetails = false;
        this.showProfile = true;
    }

    menuBackClicked() {
        this.showProfile = false;
        this.showDevices = true;
    }

    logout() {
        this.apiService.isLoggedIn = false;
        this.router.navigate(['/login']);
    }
}
