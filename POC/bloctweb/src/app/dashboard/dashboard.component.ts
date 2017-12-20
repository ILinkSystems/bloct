import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from '@angular/router';
import { APIService } from '../utils/apiservice';

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
    private selectedIdx: number;
    private oldIndex = -1;
    private showMap = false;
    private showIframe = false;
    private arloSiteUrl;
    private isNewiTraq = true;
    private isNewArlo = true;

    ngOnInit(): void {
        if (!this.apiService.isLoggedIn) {
            this.router.navigate(['/login']);
        }
        this.arloSiteUrl = this.domSanitizer.bypassSecurityTrustResourceUrl('https://www.arlo.com/en-us/');
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

    getDevices() {
        this.apiService.devices = [];
        this.apiService.getiTraqDevices().then(data => {
            if (data.success) {
                if (data.itraqDevice !== null) {
                    this.apiService.devices.push(data.itraqDevice);
                }
            }
        });
        this.apiService.getArloDevices().then(data => {
            if (data.success) {
                if (data.arloDevice !== null) {
                    this.apiService.devices.push(data.arloDevice);
                }
            }
        });
    }

    addDevice() {
        this.clearFormData();
        this.isNewArlo = true;
        this.isNewiTraq = true;
        this.showPopup = true;
    }

    saveNewDevice() {
        const body = {
            selectedDeviceType: this.selectedDeviceType,
            deviceName: this.deviceName,
            username: this.username,
            password: this.password,
            apiKey: this.apiKey
        };
        switch (this.selectedDeviceType.id) {
            case 1:
                this.apiService.addiTraqDevices(this.isNewiTraq, body).then(data => {
                    if (data.success) {
                        this.getDevices();
                    }
                });
                break;
            case 3:
                this.apiService.addArloDevices(this.isNewArlo, body).then(data => {
                    if (data.success) {
                        this.getDevices();
                    }
                });
                break;
        }
        this.showPopup = false;
        this.clearFormData();
    }

    getiTraqBlockchain(deviceId, apiDetails) {
        this.apiService.getiTraqBlockchain(deviceId).then(data => {
            if (data.success) {
                console.log(data.itraqDevice);
            }
        }).catch(error => {
            if (error.status === 500) {
                for (let i = 0, len = apiDetails.length; i < len; i++) {
                    if (apiDetails[i].selectedDeviceType.id === 1) {
                        this.isNewiTraq = false;
                        this.selectedDeviceType = apiDetails[i].selectedDeviceType;
                        this.deviceName = apiDetails[i].deviceName;
                        this.username = apiDetails[i].username;
                        this.password = apiDetails[i].password;
                        this.apiKey = apiDetails[i].apiKey;
                        this.saveNewDevice();
                    }
                }
            }
        });
    }

    getArloBlockchain(deviceId, apiDetails) {
        this.apiService.getArloBlockchain(deviceId).then(data => {
            if (data.success) {
                console.log(data.arloDevice);
            }
        }).catch(error => {
            if (error.status === 500) {
                for (let i = 0, len = apiDetails.length; i < len; i++) {
                    if (apiDetails[i].selectedDeviceType.id === 3) {
                        this.isNewArlo = false;
                        this.selectedDeviceType = apiDetails[i].selectedDeviceType;
                        this.deviceName = apiDetails[i].deviceName;
                        this.username = apiDetails[i].username;
                        this.password = apiDetails[i].password;
                        this.saveNewDevice();
                    }
                }
            }
        });
    }

    clearFormData() {
        this.deviceName = '';
        this.username = '';
        this.password = '';
        this.selectedDeviceType = this.deviceTypes[0];
    }

    selectDevice(index, selectedDevice) {
        if (this.oldIndex === index) {
            this.selectedIdx = -1;
            this.oldIndex = -1;
        } else {
            this.selectedIdx = index;
            this.oldIndex = index;
        }
        this.showMap = selectedDevice.deviceTypeId !== 3;
        this.showIframe = selectedDevice.deviceTypeId === 3;
        if (selectedDevice.deviceTypeId !== 3) {
            this.lat = selectedDevice.location.lat;
            this.lng = selectedDevice.location.lon;
        }
    }

    onLocateOnMap(device) {
        this.lat = device.location.lat;
        this.lng = device.location.lon;
    }

    onViewDetails(device) {
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

    logout() {
        this.apiService.isLoggedIn = false;
        this.router.navigate(['/login']);
    }
}
