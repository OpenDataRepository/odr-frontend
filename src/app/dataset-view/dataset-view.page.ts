import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { of, switchMap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { DatasetService } from '../api/dataset.service';
import { PermissionService } from '../api/permission.service';
import { AuthService } from '../auth.service';
import { ViewPluginMap } from 'src/app/shared/plugin-map';

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
      next: (dataset: any) => {
        this.addPluginMapToDataset(dataset);
        this.dataset = dataset;
      },
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
          next: (dataset: any) => {
            this.addPluginMapToDataset(dataset);
            this.dataset = dataset;
          },
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
      switchMap(() => {return this.datasetService.fetchLatestDatasetAndTemplate(this.uuid)})
    ).subscribe((new_dataset) => {
      this.addPluginMapToDataset(new_dataset);
      this.dataset = new_dataset;
      this.has_persisted_version = true;
    });
  }

  get persisted(): boolean {
    return !!this.dataset?.dataset_persist_date;
  }

  private addPluginMapToDataset(dataset: any) {
    // fields
    let template_plugin_object = dataset.template_plugins;
    let dataset_plugin_object = dataset.dataset_plugins;
    dataset.plugins = new ViewPluginMap(template_plugin_object.object_plugins, dataset_plugin_object.object_plugins);

    let template_field_plugin_map: any = {};
    if(template_plugin_object  && "field_plugins" in template_plugin_object) {
      for(let field_uuid in template_plugin_object.field_plugins) {
        template_field_plugin_map[field_uuid] = template_plugin_object.field_plugins[field_uuid];
      }
    }
    let dataset_field_plugin_map: any = {};
    if(dataset_plugin_object && "field_plugins" in dataset_plugin_object) {
      for(let field_uuid in dataset_plugin_object.field_plugins) {
        dataset_field_plugin_map[field_uuid] = dataset_plugin_object.field_plugins[field_uuid];
      }
    }

    for(let field of dataset.fields) {
      let field_uuid = field.uuid;
      let field_template_plugins = field_uuid in template_field_plugin_map ? template_field_plugin_map[field_uuid] : {};
      let field_dataset_plugins = field_uuid in dataset_field_plugin_map ? dataset_field_plugin_map[field_uuid] : {};
      field.plugins = new ViewPluginMap(field_template_plugins, field_dataset_plugins);
    }

    for(let related_dataset of dataset.related_datasets) {
      this.addPluginMapToDataset(related_dataset);
    }

  }

}
