import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PermissionDeniedPageRoutingModule } from './permission-denied-routing.module';

import { PermissionDeniedPage } from './permission-denied.page';
import { HeaderModule } from '../header/header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PermissionDeniedPageRoutingModule,
    HeaderModule
  ],
  declarations: [PermissionDeniedPage]
})
export class PermissionDeniedPageModule {}
