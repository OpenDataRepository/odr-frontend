import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DatasetRecordsPageRoutingModule } from './dataset-records-routing.module';

import { DatasetRecordsPage } from './dataset-records.page';
import { HeaderModule } from '../header/header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DatasetRecordsPageRoutingModule,
    HeaderModule
  ],
  declarations: [DatasetRecordsPage]
})
export class DatasetRecordsPageModule {}
