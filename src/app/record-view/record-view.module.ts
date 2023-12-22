import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecordViewPageRoutingModule } from './record-view-routing.module';

import { RecordViewPage } from './record-view.page';
import { HeaderModule } from '../header/header.module';
import { RecordComponent } from './record/record.component';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GridstackModule } from 'gridstack/dist/angular';
import { FieldComponent } from './field/field.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecordViewPageRoutingModule,
    HeaderModule,
    SharedModule,
    NgbModule,
    GridstackModule
  ],
  declarations: [RecordViewPage, RecordComponent, FieldComponent]
})
export class RecordViewPageModule {}
