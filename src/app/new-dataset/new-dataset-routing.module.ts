import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth.guard';

import { NewDatasetPage } from './new-dataset.page';

const routes: Routes = [
  {
    path: '',
    component: NewDatasetPage,
    canMatch: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewDatasetPageRoutingModule {}
