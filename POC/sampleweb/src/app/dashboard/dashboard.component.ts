import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { APIService } from '../utils/apiservice';
import { Popup } from 'ng2-opd-popup';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
    constructor(private apiService: APIService, private router: Router, private popup: Popup) { }

    private currentUser: any;
    private deviceTypes: any;
    private selectedDeviceType: any;
    private deviceName: string;
    private username: string;
    private password: string;
    private lat = 51.673858;
    private lng = 7.815982;

    markers = [
        {
            lat: 51.673858,
            lng: 7.815982,
            label: 'A',
            draggable: true
        },
        {
            lat: 51.373858,
            lng: 7.215982,
            label: 'B',
            draggable: false
        },
        {
            lat: 51.723858,
            lng: 7.895982,
            label: 'C',
            draggable: true
        }
    ];

    ngOnInit(): void {
        this.apiService.devices = [];
        if (!this.apiService.isLoggedIn) {
            this.router.navigate(['/login']);
        }
        this.currentUser = this.apiService.currentUser;
        if (this.apiService.token !== '') {
            this.apiService.getDeviceTypes().then(data => {
                if (data.success) {
                    this.deviceTypes = data.deviceTypes;
                    this.selectedDeviceType = this.deviceTypes[0];
                }
            });
            this.apiService.getNestcamDevices().then(data => {
                if (data.success) {
                    this.apiService.devices.push(data.nestcamDevice);
                }
            });
        }
    }

    addDevice() {
        this.clearFormData();
        this.popup.options = {
            header: 'Add Device',
            color: '#5cb85c',
            widthProsentage: 30,
            animationDuration: 1,
            showButtons: true,
            confirmBtnContent: 'Save',
            cancleBtnContent: 'Cancel',
            confirmBtnClass: 'btn btn-default',
            cancleBtnClass: 'btn btn-default',
            animation: 'fadeInLeft',
        };
        this.popup.show();
    }

    saveNewDevice() {
        const body = {
            selectedDeviceType: this.selectedDeviceType,
            deviceName: this.deviceName,
            username: this.username,
            password: this.password
        };
        switch (this.selectedDeviceType.id) {
            case 3:
                console.log(body);
                this.apiService.addNestcamDevices(body).then(data => {
                    if (data.success) {
                        this.apiService.devices.push(data.nestcamDevice);
                    }
                });
                break;
        }
        this.popup.hide();
        this.clearFormData();
    }

    clearFormData() {
        this.deviceName = '';
        this.username = '';
        this.password = '';
        this.selectedDeviceType = this.deviceTypes[0];
    }

    onDeviceSelect(device) {
        this.lat = 51.673858;
        this.lng = 7.815982;
        this.router.navigate(['/device',  device.deviceName]);
    }

    logout() {
        this.apiService.isLoggedIn = false;
        this.router.navigate(['/login']);
    }
}
