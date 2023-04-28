import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { from, of, switchMap } from 'rxjs';
import { DatasetService } from '../../api/dataset.service';
import { PermissionService } from '../../api/permission.service';
import { ApiService } from 'src/app/api/api.service';
import { AlertController, IonModal } from '@ionic/angular';

@Component({
  selector: 'dataset-edit',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss'],
})
export class DatasetComponent implements OnInit, OnChanges {

  @Input()
  is_top_level_dataset: boolean = false;

  @Input()
  form: FormGroup|any = new FormGroup({name: new FormControl(), fields: new FormArray([]),
    related_datasets: new FormArray([])});

  @Input()
  disabled: boolean = false;

  @Output()
  remove: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild(IonModal) link_dataset_modal!: IonModal;

  user_datasets_loaded = false;
  public_datasets_loaded = false;
  user_datasets_to_link: any = [];
  public_datasets_to_link: any = [];
  edit_permission = false;
  // permission_checked = false;

  constructor(private _fb: FormBuilder, private datasetService: DatasetService, private api: ApiService,
    private alertController: AlertController, private permissionService: PermissionService) {}

  ngOnInit() {
  }

  ngOnChanges() {
    if(!this.disabled && this.uuid) {
      this.permissionService.hasPermission(this.uuid.value, 'edit').subscribe(result => {this.edit_permission = result as boolean;});
      // this.permission_checked = true;
    }
  }

  makePublic() {
    this.form.addControl('public_date', new FormControl((new Date()).toISOString()));
  }

  makePrivate() {
    this.form.removeControl('public_date');
  }

  deleteField(index: number) {
    this.fields_form_array.removeAt(index);
  }

  addField() {
    this.fields_form_array.push(this._fb.group({
      name: new FormControl(null, [Validators.required]),
      description: new FormControl(null)
    }));
  }

  deleteRelatedDataset(index: number) {
    this.related_datasets_form_array.removeAt(index);
  }

  addRelatedDataset() {
    // TODO: creating the template/dataset independently like this will mess with the duplicate functionality
    // When the time comes, the new dataset/template should be created along with everything else so duplciate works

    this.datasetService.newEmptyDatasetAndTemplate().pipe(
      switchMap((related_dataset_object: any) => {
        this.related_datasets_form_array.push(
          this._fb.group({
            dataset_uuid: related_dataset_object.dataset_uuid,
            template_uuid: related_dataset_object.template_uuid,
            template_id: related_dataset_object.template_id,
            name: new FormControl(null, [Validators.required]),
            fields: this._fb.array([]),
            related_datasets: this._fb.array([])
          })
        )
        return this.saveDraft();
      })
    ).subscribe();
  }

  loadDatasetsAvailableToLink(){
    this.user_datasets_loaded = false;
    this.user_datasets_to_link = [];
    this.api.userDatasets().subscribe(datasets => {
      // TODO: consider removing dataset and decendant datasets
      this.user_datasets_to_link = datasets;
      this.user_datasets_loaded = true;
    });

    this.public_datasets_loaded = false;
    this.public_datasets_to_link = [];
    this.api.publicDatasets().subscribe(datasets => {
      // TODO: consider removing dataset and decendant datasets
      this.public_datasets_to_link = datasets;
      this.public_datasets_loaded = true;
    });
  }

  cancelLinkDatasetModal() {
    this.link_dataset_modal.dismiss(null, 'cancel');
  }
  confirmLinkDatasetModal(uuid: string) {
    this.linkExistingDataset(uuid);
    this.link_dataset_modal.dismiss(null, 'confirm');
  }

  linkExistingDataset(uuid: string) {
    this.datasetService.fetchLatestDatasetAndTemplate(uuid).pipe(
      switchMap((related_dataset_object: any) => {
        if(this.datasetHasChild(this.uuid.value)) {
          return from(this.presentAlert('Cannot link the chosen dataset as it is already linked'));
        }else if(DatasetComponent.hasCircularDependency(related_dataset_object, this.uuid.value)) {
          return from(this.presentAlert('Cannot link the chosen dataset as it would cause a circular dependency'));
        } else {
          this.related_datasets_form_array.push(this.convertDatasetObjectToForm(related_dataset_object));
          return this.saveDraft();
        }
      })
    ).subscribe();
  }

  private datasetHasChild(uuid: string) {
    let dataset_object = this.convertFormToDatasetObject(this.form);
    for(let related_dataset_object of dataset_object.related_datasets) {
      if(related_dataset_object.dataset_uuid == uuid) {
        return true;
      }
    }
    return false;
  }

  private static hasCircularDependency(dataset_object: any, uuid: string) {
    if(dataset_object.dataset_uuid == uuid) {
      return true;
    }
    // If user doesn't have view permissions to the dataset and attaching it creates a circular dependency, the backend will through an error
    // This is a bug but will only come up in rare circumstances.
    if(dataset_object.related_datasets){
      for(let related_dataset_object of dataset_object.related_datasets) {
        if(DatasetComponent.hasCircularDependency(related_dataset_object, uuid)) {
          return true;
        }
      }
    }
    return false;
  }

  get fields_form_array(): FormArray {
    return this.form.get("fields") as FormArray;
  }

  get related_datasets_form_array(): FormArray {
    return this.form.get("related_datasets") as FormArray;
  }

  get name() { return this.form.get('name'); }

  get uuid() { return this.form.get('dataset_uuid'); }

  get public_date() { return this.form.get('public_date'); }

  get public(): boolean {
    return !!this.public_date;
  }

  get hasViewPermission(): boolean {
    return !!this.form.get('updated_at');
  }

  get may_edit() { return !this.disabled && this.edit_permission; }

  saveDraft() {
    let dataset_object = this.convertFormToDatasetObject(this.form as FormGroup);
    return this.datasetService.updateDatasetAndTemplate(dataset_object).pipe(
      switchMap(() => {
        return this.datasetService.fetchLatestDatasetAndTemplate(this.uuid.value);
      }),
      switchMap((updated_dataset_object) => {
          let new_form = this.convertDatasetObjectToForm(updated_dataset_object);
          this.copyNewFormToComponentForm(new_form);
          return of({});
        }
      )
    )
  }

  private convertFormToDatasetObject(form: FormGroup): any {
    if(form.contains('no_permissions')) {
      // No view permissions
      return {
        dataset_uuid: form.get('dataset_uuid')?.value,
        template_uuid: form.get('template_uuid')?.value,
        template_id: form.get('template_id')?.value,
        no_permissions: true
      };
    }

    let fields = [];
    for(let field_form of (form.get("fields") as FormArray).controls) {
      fields.push(this.convertFormToFieldObject(field_form as FormGroup));
    }
    let related_datasets = [];
    for(let related_dataset_form of (form.get("related_datasets") as FormArray).controls) {
      related_datasets.push(this.convertFormToDatasetObject(related_dataset_form as FormGroup));
    }
    return {
      dataset_uuid: form.get('dataset_uuid')?.value,
      template_uuid: form.get('template_uuid')?.value,
      template_id: form.get('template_id')?.value,
      name: form.get('name') ? form.get('name')?.value : "",
      public_date: form.get('public_date') ? form.get('public_date')?.value : undefined,
      fields,
      related_datasets
    };
  }

  private convertFormToFieldObject(form: FormGroup) {
    if(form.contains('no_permissions')) {
      return {
        uuid: form.get('uuid')?.value,
        no_permissions: true
      }
    }

    let field: any = {
      name: form.get('name') ? form.get('name')?.value : "",
      description: form.get('description') ? form.get('description')?.value : "",
    };
    if(form.get('uuid')) {
      field.uuid = form.get('uuid')?.value;
    }
    if(form.get('public_date')) {
      field.public_date = form.get('public_date')?.value;
    }
    return field;
  }

  public convertDatasetObjectToForm(dataset_object: any) {
    if(dataset_object.no_permissions) {
      // No view permissions
      return this._fb.group({
        dataset_uuid: dataset_object.dataset_uuid,
        template_uuid: dataset_object.template_uuid,
        template_id: dataset_object.template_id,
        no_permissions: true
      });
    }
    let form: FormGroup = this._fb.group({
      dataset_uuid: dataset_object.dataset_uuid,
      template_uuid: dataset_object.template_uuid,
      template_id: dataset_object.template_id,
      name: [dataset_object.name, Validators.required],
      fields: this._fb.array([]),
      related_datasets: this._fb.array([])
    })
    if(dataset_object.public_date) {
      form.addControl('public_date', new FormControl(dataset_object.public_date));
    }
    if(dataset_object.dataset_updated_at) {
      form.addControl('updated_at', new FormControl(dataset_object.dataset_updated_at));
    }
    if(dataset_object.fields) {
      for(let field of dataset_object.fields) {
        if(field.no_permissions) {
          (form.get("fields") as FormArray).push(this._fb.group({
            uuid: new FormControl(field.uuid),
            no_permissions: new FormControl(true)
          }));
          continue;
        }
        let field_form: FormGroup = this._fb.group({
          uuid: new FormControl(field.uuid),
          name: new FormControl(field.name, [Validators.required]),
          description: new FormControl(field.description),
        });
        if(field.public_date) {
          field_form.addControl('public_date', new FormControl(field.public_date));
        }
        if(field.updated_at) {
          field_form.addControl('updated_at', new FormControl(field.updated_at));
        }
        (form.get("fields") as FormArray).push(field_form);
      }
    }
    if(dataset_object.related_datasets) {
      for(let related_dataset of dataset_object.related_datasets) {
        (form.get("related_datasets") as FormArray).push(this.convertDatasetObjectToForm(related_dataset));
      }
    }
    return form;
  }

  private copyNewFormToComponentForm(new_form: FormGroup) {

    this.form.controls['dataset_uuid'].setValue(new_form.get('dataset_uuid')?.value);
    this.form.controls['template_uuid'].setValue(new_form.get('template_uuid')?.value);
    this.form.controls['template_id'].setValue(new_form.get('template_id')?.value);

    if(new_form.contains('no_permissions')) {
      // No view permissions
      if(!this.form.contains('no_permissions')) {
        this.form.addControl('no_permissions', new FormControl(true))
      }
      return;
    } else {
      try {
        this.form.removeControl('no_permissions');
      } catch (err) {}
    }

    this.form.controls['name'].setValue(new_form.get('name')?.value);

    if(new_form.contains('public_date')) {
      if(this.form.contains('public_date')) {
        this.form.controls['public_date'].setValue(new_form.get('public_date')?.value);
      } else {
        this.form.addControl('public_date', new FormControl(new_form.get('public_date')?.value))
      }
    } else {
      try {
        this.form.removeControl('public_date');
      } catch (err) {}
    }

    this.form.removeControl('fields');
    this.form.addControl('fields', new_form.get('fields'));

    this.form.removeControl('related_datasets');
    this.form.addControl('related_datasets', new_form.get('related_datasets'));
  }

  private async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Alert',
      subHeader: '',
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
