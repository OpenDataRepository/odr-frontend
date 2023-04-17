import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { of, switchMap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { DatasetService } from '../api/dataset.service';
import { PermissionService } from '../api/permission.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-dataset-view',
  templateUrl: './dataset-view.page.html',
  styleUrls: ['./dataset-view.page.scss'],
})
export class DatasetViewPage implements OnInit, ViewWillEnter {

  uuid: string = "";
  dataset: any = {};
  has_persisted_version = false;
  has_edit_permission = false;

  constructor(private route: ActivatedRoute, private router: Router,
    private datasetService: DatasetService, private api: ApiService,
    private permissionService: PermissionService, private auth: AuthService) { }

  ngOnInit(): void {

  }

  ionViewWillEnter() {
    let uuid = this.route.snapshot.paramMap.get('uuid');
    if(!uuid) {
      this.router.navigateByUrl('/404', {skipLocationChange: true})
    }
    this.uuid = uuid as string;

    this.datasetService.fetchLatestDatasetAndTemplate(this.uuid).subscribe({
      next: (dataset: any) => { this.dataset = dataset; },
      error: (err: any) => {
        if(err.status == 404) {
          this.router.navigateByUrl('/404', {skipLocationChange: true})
          return;
        }
        if(err.status == 401) {
          this.auth.send401OrRedirectToLogin();
          return;
        }
        console.log('HTTP Error', err)
        this.datasetService.fetchLatestDatasetAndTemplate(this.uuid).subscribe({
          next: (dataset: any) => { this.dataset = dataset; },
          error: (err: any) => {
            if(err.status == 404) {
              this.router.navigateByUrl('/404', {skipLocationChange: true})
              return;
            }
            console.log('HTTP Error', err)
          }
        });
      }
    });

    this.api.fetchDatasetLatestPersisted(this.uuid).subscribe({
      next: () => { this.has_persisted_version = true; },
      error: () => { this.has_persisted_version = false; }
    })

    this.permissionService.hasPermission(this.uuid, ApiService.PermissionType.Edit).subscribe(result => {
      if(result) {
        this.has_edit_permission = true;
      }
    })
  }

  persist() {
    this.datasetService.persistDatasetAndTemplate(this.dataset).pipe(
      switchMap(() => {return this.datasetService.fetchLatestDatasetAndTemplate(this.uuid)}),
      switchMap((new_dataset) => {this.dataset = new_dataset; return of({});})
    ).subscribe();
  }

  get persisted(): boolean {
    return !!this.dataset?.dataset_persist_date;
  }

}
