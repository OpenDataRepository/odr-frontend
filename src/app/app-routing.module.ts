import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'dataset-edit',
    loadChildren: () => import('./dataset-edit/dataset-edit.module').then( m => m.DatasetEditPageModule)
  },
  {
    path: 'sign-up',
    loadChildren: () => import('./sign-up/sign-up.module').then( m => m.SignUpPageModule)
  },
  {
    path: 'log-in',
    loadChildren: () => import('./log-in/log-in.module').then( m => m.LogInPageModule)
  },
  {
    path: 'dataset-view',
    loadChildren: () => import('./dataset-view/dataset-view.module').then( m => m.DatasetViewPageModule)
  },
  {
    path: 'dataset-records',
    loadChildren: () => import('./dataset-records/dataset-records.module').then( m => m.DatasetRecordsPageModule)
  },
  {
    path: 'record-edit',
    loadChildren: () => import('./record-edit/record-edit.module').then( m => m.RecordEditPageModule)
  },
  {
    path: 'record-view',
    loadChildren: () => import('./record-view/record-view.module').then( m => m.RecordViewPageModule)
  },
  {
    path: 'permission-denied',
    loadChildren: () => import('./permission-denied/permission-denied.module').then( m => m.PermissionDeniedPageModule)
  },
  {
    path: '**',
    loadChildren: () => import('./not-found/not-found.module').then( m => m.NotFoundPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
