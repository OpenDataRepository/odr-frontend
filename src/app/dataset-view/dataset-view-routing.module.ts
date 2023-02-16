import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth.guard';

import { DatasetViewPage } from './dataset-view.page';

const routes: Routes = [
  {
    path: ':uuid',
    component: DatasetViewPage,
    canMatch: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatasetViewPageRoutingModule {}
