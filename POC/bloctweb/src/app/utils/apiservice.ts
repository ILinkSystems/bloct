import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class APIService {
  constructor(private http: HttpClient) { }

  private baseUrl: string;
  public isLoggedIn = false;
  public token = '';
  public currentUser: any;
  public devices: any;

  getConfiguration() {
    return this.http.get('./assets/config.json')
      .toPromise()
      .then(res => {
        this.baseUrl = res['API_URL'];
      });
  }

  authenticate(body): Promise<any> {
    return this.http.post(this.baseUrl + 'login/authenticate', body)
      .toPromise()
      .then(response => response);
  }

  getDeviceTypes(): Promise<any> {
    return this.http.get(this.baseUrl + 'device/deviceTypes', {
      headers: new HttpHeaders().set('x-access-token', this.token),
    })
      .toPromise()
      .then(response => response);
  }

  getApiDetails(): Promise<any> {
    return this.http.get(this.baseUrl + 'device/apiDetails', {
      headers: new HttpHeaders().set('x-access-token', this.token),
    })
      .toPromise()
      .then(response => response);
  }

  getiTraqDevices(loginName): Promise<any> {
    return this.http.get(this.baseUrl + 'device/itraq/' + loginName, {
      headers: new HttpHeaders().set('x-access-token', this.token),
    })
      .toPromise()
      .then(response => response);
  }

  addiTraqDevices(isNew, body): Promise<any> {
    return this.http.post(this.baseUrl + 'device/itraq/' + isNew, body, {
      headers: new HttpHeaders().set('x-access-token', this.token),
    })
      .toPromise()
      .then(response => response);
  }

  getiTraqBlockchain(deviceId): Promise<any> {
    return this.http.get(this.baseUrl + 'device/itraq/blockchain/' + deviceId, {
      headers: new HttpHeaders().set('x-access-token', this.token),
    })
      .toPromise()
      .then(response => response);
  }

  getiTraqTransactions(deviceId): Promise<any> {
    return this.http.get(this.baseUrl + 'device/itraq/transactions/' + deviceId, {
      headers: new HttpHeaders().set('x-access-token', this.token),
    })
      .toPromise()
      .then(response => response);
  }

  getTiveDevices(loginName): Promise<any> {
    return this.http.get(this.baseUrl + 'device/tive/' + loginName, {
      headers: new HttpHeaders().set('x-access-token', this.token),
    })
      .toPromise()
      .then(response => response);
  }

  addTiveDevices(isNew, body): Promise<any> {
    return this.http.post(this.baseUrl + 'device/tive/' + isNew, body, {
      headers: new HttpHeaders().set('x-access-token', this.token),
    })
      .toPromise()
      .then(response => response);
  }

  getTiveBlockchain(deviceId): Promise<any> {
    return this.http.get(this.baseUrl + 'device/tive/blockchain/' + deviceId, {
      headers: new HttpHeaders().set('x-access-token', this.token),
    })
      .toPromise()
      .then(response => response);
  }

  getArloDevices(loginName): Promise<any> {
    return this.http.get(this.baseUrl + 'device/arlo/' + loginName, {
      headers: new HttpHeaders().set('x-access-token', this.token),
    })
      .toPromise()
      .then(response => response);
  }

  addArloDevices(isNew, body): Promise<any> {
    return this.http.post(this.baseUrl + 'device/arlo/' + isNew, body, {
      headers: new HttpHeaders().set('x-access-token', this.token),
    })
      .toPromise()
      .then(response => response);
  }

  getArloBlockchain(deviceId): Promise<any> {
    return this.http.get(this.baseUrl + 'device/arlo/blockchain/' + deviceId, {
      headers: new HttpHeaders().set('x-access-token', this.token),
    })
      .toPromise()
      .then(response => response);
  }
}
