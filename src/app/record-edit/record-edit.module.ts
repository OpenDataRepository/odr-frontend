import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecordEditPageRoutingModule } from './record-edit-routing.module';

import { RecordEditPage } from './record-edit.page';
import { RecordComponent } from './record/record.component';
import { HeaderModule } from '../header/header.module';
import { FieldComponent } from './field/field.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecordEditPageRoutingModule,
    ReactiveFormsModule,
    HeaderModule
  ],
  declarations: [RecordEditPage, RecordComponent, FieldComponent]
})
export class RecordEditPageModule {}
