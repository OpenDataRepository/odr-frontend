import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewDatasetPageRoutingModule } from './new-dataset-routing.module';

import { NewDatasetPage } from './new-dataset.page';
import { DatasetComponent } from './dataset/dataset.component';
import { FieldComponent } from './field/field.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewDatasetPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [NewDatasetPage, DatasetComponent, FieldComponent]
})
export class NewDatasetPageModule {}
