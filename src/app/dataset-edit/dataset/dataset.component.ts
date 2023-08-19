import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { from, of, switchMap } from 'rxjs';
import { DatasetService } from '../../api/dataset.service';
import { PermissionService } from '../../api/permission.service';
import { ApiService } from 'src/app/api/api.service';
import { AlertController, IonModal } from '@ionic/angular';
import { FieldService } from 'src/app/api/field.service';
import { EditPluginMap } from 'src/app/shared/plugin-map';
import { PluginsService } from 'src/app/shared/plugins.service';

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

  @ViewChild('link_dataset_modal') link_dataset_modal!: IonModal;

  @ViewChild('link_field_modal') link_field_modal!: IonModal;

  @ViewChild('add_plugin_modal') add_plugin_modal!: IonModal;

  user_datasets_loaded = false;
  public_datasets_loaded = false;
  user_datasets_to_link: any = [];
  public_datasets_to_link: any = [];

  user_fields_loaded = false;
  public_fields_loaded = false;
  user_fields_to_link: any = [];
  public_fields_to_link: any = [];

  edit_permission = false;

  constructor(private _fb: FormBuilder, private datasetService: DatasetService, private api: ApiService,
    private alertController: AlertController, private permissionService: PermissionService,
    private fieldService: FieldService, private pluginsService: PluginsService) {}

  ngOnInit() {
  }

  ngOnChanges() {
    if(!this.disabled && this.uuid) {
      this.permissionService.hasPermission(this.uuid.value, 'edit').subscribe(result => {this.edit_permission = result as boolean;});
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
      description: new FormControl(null),
      type: new FormControl('none')
    }));
  }

  loadFieldsAvailableToLink(){
    this.user_fields_loaded = false;
    this.user_fields_to_link = [];
    this.api.userTemplateFields().subscribe((fields: any) => {
      this.user_fields_to_link = fields;
      this.user_fields_loaded = true;
    });

    this.public_fields_loaded = false;
    this.public_fields_to_link = [];
    this.api.publicTemplateFields().subscribe((fields: any) => {
      this.public_fields_to_link = fields;
      this.public_fields_loaded = true;
    });
  }

  cancelLinkFieldModal() {
    this.link_field_modal.dismiss(null, 'cancel');
  }
  confirmLinkFieldModal(uuid: string) {
    this.linkExistingField(uuid);
    this.link_field_modal.dismiss(null, 'confirm');
  }

  linkExistingField(uuid: string) {
    this.fieldService.fetchLatestField(uuid).pipe(
      switchMap((related_field: any) => {
        if(this.datasetHasField(uuid)) {
          return from(this.presentAlert('Cannot link the chosen field as it is already linked'));
        } else {
          this.fields_form_array.push(this.convertFieldObjectToForm(related_field));
          return this.saveDraft();
        }
      })
    ).subscribe();
  }

  private datasetHasField(uuid: string) {
    let dataset_object = this.convertFormToDatasetObject(this.form);
    for(let field of dataset_object.fields) {
      if(field.uuid == uuid) {
        return true;
      }
    }
    return false;
  }

  deleteRelatedDataset(index: number) {
    this.related_datasets_form_array.removeAt(index);
  }

  addRelatedDataset() {
    this.datasetService.newEmptyDatasetAndTemplate().pipe(
      switchMap((related_dataset_object: any) => {
        this.related_datasets_form_array.push(
          this._fb.group({
            dataset_uuid: related_dataset_object.dataset_uuid,
            template_uuid: related_dataset_object.template_uuid,
            template_id: related_dataset_object.template_id,
            name: new FormControl(null, [Validators.required]),
            group_uuid: this.form.get('group_uuid').value,
            fields: this._fb.array([]),
            related_datasets: this._fb.array([]),
            template_plugins: {field_plugins: {}, object_plugins: {}},
            dataset_plugins: {field_plugins: {}, object_plugins: {}}
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
        if(this.datasetHasChild(uuid)) {
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

  get related_fields_form_array(): FormArray {
    return this.form.get("related_fields") as FormArray;
  }

  get name() { return this.form.get('name'); }

  get uuid() { return this.form.get('dataset_uuid'); }

  get template_uuid() { return this.form.get('template_uuid'); }

  get public_date() { return this.form.get('public_date'); }

  get public(): boolean {
    return !!this.public_date;
  }

  get hasViewPermission(): boolean {
    return !!this.form.get('updated_at');
  }

  get may_edit() { return !this.disabled && this.edit_permission; }

  get all_object_plugins(): Record<string, number[]> {
    return this.pluginsService.all_dataset_plugins;
  }

  get all_object_plugin_keys(): string[] {
    return this.pluginsService.all_dataset_plugins_keys;
  }

  get current_plugins(): EditPluginMap {
    return this.form.get('plugins')?.value;
  }

  get current_plugin_keys(): string[] {
    return this.current_plugins ? this.current_plugins.keys : [];
  }

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
    let dataset_object: Record<string, any> = {
      dataset_uuid: form.get('dataset_uuid')?.value,
      template_uuid: form.get('template_uuid')?.value,
      template_id: form.get('template_id')?.value,
      name: form.get('name') ? form.get('name')?.value : "",
      group_uuid: form.get('group_uuid') ? form.get('group_uuid')?.value: undefined,
      public_date: form.get('public_date') ? form.get('public_date')?.value : undefined,
      fields,
      related_datasets,
    };
    this.addPluginsFromFormToDatasetObject(form, dataset_object);
    return dataset_object;
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
    if(form.get('type')) {
      let type = form.get('type')?.value;
      if(type != 'none') {
        field.type = type;
      }
    }
    return field;
  }

  private convertFieldObjectToForm(field: any) {
    if(field.no_permissions) {
      return this._fb.group({
        uuid: new FormControl(field.uuid),
        no_permissions: new FormControl(true)
      });
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
    if(field.type) {
      field_form.addControl('type', new FormControl(field.type));
    } else {
      field_form.addControl('type', new FormControl('none'));
    }
    return field_form;
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
      related_datasets: this._fb.array([]),
      template_plugins: dataset_object.template_plugins ? dataset_object.template_plugins : {field_plugins: {}, object_plugins: {}},
      dataset_plugins: dataset_object.dataset_plugins ? dataset_object.dataset_plugins : {field_plugins: {}, object_plugins: {}}
    })
    if(dataset_object.group_uuid) {
      form.addControl('group_uuid', new FormControl(dataset_object.group_uuid));
    }
    if(dataset_object.public_date) {
      form.addControl('public_date', new FormControl(dataset_object.public_date));
    }
    if(dataset_object.dataset_updated_at) {
      form.addControl('updated_at', new FormControl(dataset_object.dataset_updated_at));
    }
    if(dataset_object.fields) {
      for(let field of dataset_object.fields) {
        let field_form = this.convertFieldObjectToForm(field);
        (form.get("fields") as FormArray).push(field_form);
      }
    }
    if(dataset_object.related_datasets) {
      for(let related_dataset of dataset_object.related_datasets) {
        (form.get("related_datasets") as FormArray).push(this.convertDatasetObjectToForm(related_dataset));
      }
    }
    this.addPluginsToForm(form);
    return form;
  }

  private copyOptionalFieldToComponentForm(field_name: string, new_form: FormGroup) {
    if(new_form.contains(field_name)) {
      if(this.form.contains(field_name)) {
        this.form.controls[field_name].setValue(new_form.get(field_name)?.value);
      } else {
        this.form.addControl(field_name, new FormControl(new_form.get(field_name)?.value))
      }
    } else {
      try {
        this.form.removeControl(field_name);
      } catch (err) {}
    }
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

    this.copyOptionalFieldToComponentForm('public_date', new_form);
    this.copyOptionalFieldToComponentForm('type', new_form);

    this.form.removeControl('fields');
    this.form.addControl('fields', new_form.get('fields'));

    this.form.removeControl('related_datasets');
    this.form.addControl('related_datasets', new_form.get('related_datasets'));
  }

  private addPluginsToForm(form: FormGroup) {
    // fields
    let template_plugin_object = form.get('template_plugins')?.value;
    let dataset_plugin_object = form.get('dataset_plugins')?.value;
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

    this.permissionService.hasPermission(form.get('template_uuid')?.value, 'edit').subscribe(has_template_edit_permission => {
      form.addControl('plugins', new FormControl(new EditPluginMap(template_plugin_object.object_plugins, dataset_plugin_object.object_plugins, has_template_edit_permission as boolean)));
      for(let field_form of (form.get("fields") as FormArray).controls) {
        let field_uuid = field_form.get('uuid')?.value;
        let field_template_plugins = field_uuid in template_field_plugin_map ? template_field_plugin_map[field_uuid] : {};
        let field_dataset_plugins = field_uuid in dataset_field_plugin_map ? dataset_field_plugin_map[field_uuid] : {};
        (field_form as FormGroup).addControl('template_plugins', new FormControl(field_template_plugins));
        (field_form as FormGroup).addControl('dataset_plugins', new FormControl(field_dataset_plugins));
        (field_form as FormGroup).addControl('plugins', new FormControl(new EditPluginMap(field_template_plugins, field_dataset_plugins, has_template_edit_permission as boolean)))
      }
    })

  }

  private addPluginsFromFormToDatasetObject(form: FormGroup, existing_dataset_object: Record<string, any>) {
    let template_plugin_object = form.get('template_plugins')?.value;
    let dataset_plugin_object = form.get('dataset_plugins')?.value;

    let template_plugins: any = {
      object_plugins: template_plugin_object.object_plugins,
      field_plugins: {}
    };
    let dataset_plugins: any = {
      object_plugins: dataset_plugin_object.object_plugins,
      field_plugins: {}
    };

    for(let field_form of (form.get("fields") as FormArray).controls) {
      let field_uuid = field_form.get('uuid')?.value;
      let field_template_plugins = field_form.get('template_plugins')?.value;
      let field_dataset_plugins = field_form.get('dataset_plugins')?.value;
      template_plugins.field_plugins[field_uuid] = field_template_plugins;
      dataset_plugins.field_plugins[field_uuid] = field_dataset_plugins;
    }
    existing_dataset_object['template_plugins'] = template_plugins;
    existing_dataset_object['dataset_plugins'] = dataset_plugins;
  }

  addPlugin(name: string, version: number) {
    this.editPlugin(name, version);
  }

  editPlugin(name: string, version: number) {
    this.current_plugins.set(name, {version});
  }

  removePlugin(name: string) {
    this.current_plugins.delete(name);
  }

  cancelAddPluginModal() {
    this.add_plugin_modal.dismiss(null, 'cancel');
  }

  confirmAddPluginModal(name: string) {
    let version = this.latestPluginVersion(name);
    this.addPlugin(name, version);
    this.add_plugin_modal.dismiss(null, 'confirm');
  }

  private latestPluginVersion(plugin_name: string) {
    let versions = this.all_object_plugins[plugin_name];
    return versions[versions.length-1];
  }

  changePluginVersion(name: string, event: Event) {
    let version = (<any>event).detail.value;
    this.editPlugin(name, version);
  }

  getExistingPluginVersionOrLatest(plugin_name: string) {
    let current_plugin = this.current_plugins.get(plugin_name);
    if(current_plugin) {
      return current_plugin.version;
    }
    return this.latestPluginVersion(plugin_name);
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
