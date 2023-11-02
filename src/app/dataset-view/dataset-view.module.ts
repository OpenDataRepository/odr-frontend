import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { GridstackModule } from 'gridstack/dist/angular';

import { DatasetViewPageRoutingModule } from './dataset-view-routing.module';

import { DatasetViewPage } from './dataset-view.page';
import { HeaderModule } from '../header/header.module';
import { DatasetComponent } from './dataset/dataset.component';
import { FieldComponent } from './field/field.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DatasetViewPageRoutingModule,
    HeaderModule,
    NgbModule,
    GridstackModule
  ],
  declarations: [DatasetViewPage, DatasetComponent, FieldComponent]
})
export class DatasetViewPageModule {}
