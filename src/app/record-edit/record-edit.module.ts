import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecordEditPageRoutingModule } from './record-edit-routing.module';

import { RecordEditPage } from './record-edit.page';
import { RecordComponent } from './record/record.component';
import { HeaderModule } from '../header/header.module';
import { FieldComponent } from './field/field.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModule } from '../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GridstackModule } from 'gridstack/dist/angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecordEditPageRoutingModule,
    ReactiveFormsModule,
    HeaderModule,
    MatProgressSpinnerModule,
    SharedModule,
    NgbModule,
    GridstackModule
  ],
  declarations: [RecordEditPage, RecordComponent, FieldComponent]
})
export class RecordEditPageModule {}
