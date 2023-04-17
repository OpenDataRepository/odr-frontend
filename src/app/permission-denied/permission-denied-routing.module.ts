import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PermissionDeniedPage } from './permission-denied.page';

const routes: Routes = [
  {
    path: '',
    component: PermissionDeniedPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PermissionDeniedPageRoutingModule {}
