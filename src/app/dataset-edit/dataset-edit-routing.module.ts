import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth.guard';

import { DatasetEditPage } from './dataset-edit.page';

const routes: Routes = [
  {
    path: ':uuid',
    component: DatasetEditPage,
    canMatch: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatasetEditPageRoutingModule {}
