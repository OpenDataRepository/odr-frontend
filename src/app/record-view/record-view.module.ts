import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecordViewPageRoutingModule } from './record-view-routing.module';

import { RecordViewPage } from './record-view.page';
import { HeaderModule } from '../header/header.module';
import { RecordComponent } from './record/record.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecordViewPageRoutingModule,
    HeaderModule
  ],
  declarations: [RecordViewPage, RecordComponent]
})
export class RecordViewPageModule {}
