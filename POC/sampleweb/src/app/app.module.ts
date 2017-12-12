import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PopupModule } from 'ng2-opd-popup';
import { AppRoutingModule } from './app-routing.module';
import { GridModule } from '@progress/kendo-angular-grid';
import { AgmCoreModule } from '@agm/core';
import { DropdownModule } from 'ngx-dropdown';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DeviceComponent } from './device/device.component';
import { APIService } from './utils/apiservice';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    PopupModule.forRoot(),
    AppRoutingModule,
    GridModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCpRyKFezhM8zRMABqR451RvplCKXnf4Wg'
    }),
    DropdownModule
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    DeviceComponent
  ],
  providers: [APIService],
  bootstrap: [AppComponent]
})
export class AppModule { }
platformBrowserDynamic().bootstrapModule(AppModule);
