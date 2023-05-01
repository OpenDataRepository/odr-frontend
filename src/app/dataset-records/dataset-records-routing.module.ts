import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth.guard';

import { DatasetRecordsPage } from './dataset-records.page';

const routes: Routes = [
  {
    path: ':uuid',
    component: DatasetRecordsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatasetRecordsPageRoutingModule {}
