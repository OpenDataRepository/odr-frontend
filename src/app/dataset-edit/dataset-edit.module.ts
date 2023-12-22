import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DatasetEditPageRoutingModule } from './dataset-edit-routing.module';

import { DatasetEditPage } from './dataset-edit.page';
import { DatasetComponent } from './dataset/dataset.component';
import { FieldComponent } from './field/field.component';
import { HeaderModule } from '../header/header.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GridstackModule } from 'gridstack/dist/angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DatasetEditPageRoutingModule,
    ReactiveFormsModule,
    HeaderModule,
    NgbModule,
    DragDropModule,
    GridstackModule
  ],
  declarations: [DatasetEditPage, DatasetComponent, FieldComponent]
})
export class DatasetEditPageModule {}
