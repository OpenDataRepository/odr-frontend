import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DatasetViewPage } from './dataset-view.page';

// TODO: this route should take a uuid
const routes: Routes = [
  {
    path: ':uuid',
    component: DatasetViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatasetViewPageRoutingModule {}
