import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth.guard';

import { RecordEditPage } from './record-edit.page';

const routes: Routes = [
  {
    path: 'new/:dataset_uuid',
    component: RecordEditPage,
    canMatch: [AuthGuard]
  },
  {
    path: ':uuid',
    component: RecordEditPage,
    canMatch: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecordEditPageRoutingModule {}
