import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from '../utils/apiservice';

@Component({
    selector: 'device',
    templateUrl: './device.component.html',
    styleUrls: ['./device.component.css']
})

export class DeviceComponent implements OnInit {
    constructor(private apiService: APIService, private router: Router, private route: ActivatedRoute) {
        this.route.params.subscribe(params => this.setCurrentDevice(params['deviceName']));
    }

    private currentUser: any;
    private currentDevice: any;
    private date = new Date();

    ngOnInit(): void {
        if (!this.apiService.isLoggedIn) {
            this.router.navigate(['/login']);
        }
        this.currentUser = this.apiService.currentUser;
    }

    setCurrentDevice(deviceName) {
        if (this.apiService.token !== '') {
            this.currentDevice = this.apiService.devices[0];
        }
    }

    back() {
        this.router.navigate(['/dashboard']);
    }

    logout() {
        this.apiService.isLoggedIn = false;
        this.router.navigate(['/login']);
    }
}
