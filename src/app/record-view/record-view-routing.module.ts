import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth.guard';

import { RecordViewPage } from './record-view.page';

const routes: Routes = [
  {
    path: ':uuid',
    component: RecordViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecordViewPageRoutingModule {}
