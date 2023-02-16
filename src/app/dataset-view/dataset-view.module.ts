import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DatasetViewPageRoutingModule } from './dataset-view-routing.module';

import { DatasetViewPage } from './dataset-view.page';
import { HeaderModule } from '../header/header.module';
import { DatasetComponent } from './dataset/dataset.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DatasetViewPageRoutingModule,
    HeaderModule
  ],
  declarations: [DatasetViewPage, DatasetComponent]
})
export class DatasetViewPageModule {}
