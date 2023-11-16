import { HttpEventType } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AlertController, IonModal } from '@ionic/angular';
import { GridstackComponent, NgGridStackOptions } from 'gridstack/dist/angular';
import { switchMap, of, from, forkJoin, take, Observable, catchError, throwError } from 'rxjs';
import { ApiService } from 'src/app/api/api.service';
import { PermissionService } from 'src/app/api/permission.service';
import { RecordService } from 'src/app/api/record.service';
import { gridHeight, static_sub_grid_options, static_top_grid_options } from 'src/app/shared/gridstack-settings';
import { PluginsService } from 'src/app/shared/plugins.service';
import { graphCsvBlob } from 'src/plugins/dataset_plugins/graph/0.1/plugin';
import { FieldComponent } from '../field/field.component';

@Component({
  selector: 'record-edit',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss'],
})
export class RecordComponent implements OnInit, OnChanges {

  @Input()
  is_top_level_record: boolean = false;

  @Input()
  form: FormGroup = new FormGroup({name: new FormControl(), fields: new FormArray([]),
    related_records: new FormArray([])});

  @Input()
  disabled: boolean = false;

  @Output()
  remove: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild(IonModal) link_record_modal!: IonModal;

  @ViewChild('graph_plugin') graphPluginRef!: ElementRef

  @ViewChild(GridstackComponent) grid_comp!: GridstackComponent;

  graphed: boolean = false;

  records_available = false;
  records_to_link: any = [];

  edit_permission: boolean|undefined = undefined;

  data_available = false;

  name_field_form: AbstractControl|undefined;

  constructor(private _fb: FormBuilder, private api: ApiService, private recordService: RecordService,
    private alertController: AlertController, private permissionService: PermissionService,
    private pluginsService: PluginsService, private cdr: ChangeDetectorRef, private viewContainerRef: ViewContainerRef) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {

    let loadGridstackItemsCallback = () => {
      this.data_available = true;
      this.cdr.detectChanges();
      this.loadGridstackItems();
    }

    if ('form' in changes) {
      if(this.name_field_form == undefined) {
        // Get name from fields
        if('fields' in this.form.value) {
          for(let field_form of (this.form.get('fields') as FormArray).controls) {
            if(field_form.value.name == 'name') {
              this.name_field_form = field_form;
              break;
            }
          }
        }
      }

      this.handleGraphPlugin();

      if('combined_dataset_template' in this.form.value) {
        if(!this.disabled && this.edit_permission === undefined && this.dataset_uuid) {
          this.permissionService.hasPermission(this.dataset_uuid, 'edit').subscribe(result => {
            this.edit_permission = result as boolean;
            loadGridstackItemsCallback();
          });
        } else {
          loadGridstackItemsCallback();
        }
      }
    }
  }

  private handleGraphPlugin(){
    if(this.form && this.form.get('plugins') && 'graph' in this.form.get('plugins')!.value) { // initially setter gets called with undefined
      let graph_plugin_element = this.graphPluginRef;
      if(!this.graphed) {
        // let file = 'assets/test/cma_404470826rda00790050104ch11503p1.csv';
        let file = this.findGraphFile();
        if(!file) {
          return;
        }
        let file_name = file.name;
        let file_uuid = file.uuid;
        this.api.fetchFile(file_uuid).subscribe(file_data => {
          graphCsvBlob(graph_plugin_element.nativeElement, file_data, file_name);
          this.graphed = true;
        })
      }
    }
  }

  makePrivate() {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1000);
    this.form.addControl('public_date', new FormControl(futureDate.toISOString()));
  }

  undoPrivate() {
    this.form.removeControl('public_date');
  }

  deleteRelatedRecord(index: number) {
    this.related_records_form_array.removeAt(index);
  }

  addRelatedRecord(dataset_uuid: string) {
    this.api.createRecord({dataset_uuid, related_records: []}).pipe(
      catchError(error => {
        if(error.status == 401) {
          // Show a popup indicating that the user doesn't have permission to add this related record
          this.presentAlert('You do not have permission to add a record to this dataset');
        }
        return throwError(() => error);
      }),
      switchMap((response: any) => {
        let related_record_object = response.record;
        let form_fields_array = this._fb.array([]);
        for(let field of related_record_object.fields) {
          (form_fields_array as FormArray).push(this._fb.group({
            name: field.name,
            description: field.description,
            uuid: field.uuid,
            value: field.value ? field.value : ""
          }));
        }
        this.related_records_form_array.push(
          this._fb.group({
            uuid: related_record_object.uuid,
            dataset_uuid: related_record_object.dataset_uuid,
            fields: form_fields_array,
            related_records: this._fb.array([])
          })
        )
        return this.saveDraft();
      })
    ).subscribe();
  }

  loadRecordsAvailableToLink(){
    this.records_available = false;
    this.records_to_link = [];

    let observables = this.related_datasets.map((dataset_template: any) => this.api.datasetRecords(dataset_template.dataset_uuid).pipe(take(1)))
    forkJoin(observables).subscribe((results: any) => {
      // TODO: consider removing related_records already on the record
      this.records_to_link = results.flat(1);
      this.records_available = true;
    })

  }

  cancelLinkRecordModal() {
    this.link_record_modal.dismiss(null, 'cancel');
  }
  confirmLinkRecordModal(uuid: string) {
    this.linkExistingRecord(uuid);
    this.link_record_modal.dismiss(null, 'confirm');
  }

  linkExistingRecord(uuid: string) {
    this.recordService.fetchLatestRecord(uuid).pipe(
      switchMap((related_record_object: any) => {
        if(this.recordHasChild(uuid)) {
          return from(this.presentAlert('Cannot link the chosen record as it is already linked'));
        } else {
          let dataset_template;
          for(let related_dataset_template of this.related_datasets) {
            if(related_record_object.dataset_uuid == related_dataset_template.dataset_uuid) {
              dataset_template = related_dataset_template;
              break;
            }
          }
          if(!dataset_template) {
            throw new Error('Cannot find dataset for record ' + uuid)
          }
          this.related_records_form_array.push(this.convertRecordObjectToForm(related_record_object, dataset_template, this.form.get('file_upload_progress_map')?.value));
          return this.saveDraft();
        }
      })
    ).subscribe();
  }

  private recordHasChild(uuid: string) {
    let record_object = this.convertFormToRecordObject(this.form);
    for(let related_record_object of record_object.related_records) {
      if(related_record_object.uuid == uuid) {
        return true;
      }
    }
    return false;
  }

  get fields_form_array(): FormArray {
    return this.form.get("fields") as FormArray;
  }

  get related_records_form_array(): FormArray {
    return this.form.get("related_records") as FormArray;
  }

  get uuid() { return this.form.get('uuid'); }

  get dataset_uuid(): string { return this.form.get('dataset_uuid')?.value; }

  private get combined_dataset_template() { return this.form.get('combined_dataset_template')?.value;}

  get name() { return this.name_field_form && this.name_field_form.value.value ? this.name_field_form.value.value : this.dataset_name; }

  get dataset_name() { return this.combined_dataset_template?.name; }

  get related_datasets(): any[] { return this.combined_dataset_template?.related_datasets; }

  get may_edit() { return !this.disabled && (this.edit_permission === undefined || this.edit_permission) }

  get may_view() { return this.hasViewPermission }

  get record_private() {
    return this.form.get('public_date')
  }

  get public(): boolean {
    return !!this.combined_dataset_template.public_date && !this.record_private;
  }

  get hasViewPermission(): boolean {
    return !this.form.get('no_permissions');
  }

  get top_grid_options(): NgGridStackOptions {
    return static_top_grid_options;
  }

  private get grid() { return this.grid_comp?.grid; }

  castToFormGroup(f: AbstractControl) {
    return f as FormGroup;
  }

  getRelatedDatasetForRelatedForm(form: any) {
    let dataset_uuid = form.get('dataset_uuid')?.value;
    for(let related_dataset_template of this.related_datasets) {
      if(related_dataset_template.dataset_uuid == dataset_uuid) {
        return related_dataset_template;
      }
    }
    throw "Related dataset not found";
  }

  private static buildUuidFileMapFromForm(form: FormGroup, map: Record<string, any>) {
    for(let field_form of (form.get("fields") as FormArray).controls){
      if((field_form as FormGroup).contains('file')) {
        let file_object = field_form.get('file')?.value;
        if(file_object.uuid && file_object.uuid == "new") {
          map[file_object.front_end_uuid] = file_object.file_to_upload;
        }
      }
    }
    for(let related_record of (form.get("related_records") as FormArray).controls){
      RecordComponent.buildUuidFileMapFromForm(related_record as FormGroup, map);
    }
  }

  private uploadAllFiles(front_end_uuid_to_back_end_uuid_map: Record<string, string>) {
    let uuid_to_file_map: Record<string, any> = {};
    RecordComponent.buildUuidFileMapFromForm(this.form, uuid_to_file_map);
    let file_upload_progress_map = this.form.get('file_upload_progress_map')?.value;
    for(const front_end_uuid of Object.keys(uuid_to_file_map)) {
      const file = uuid_to_file_map[front_end_uuid];
      if(!(front_end_uuid in front_end_uuid_to_back_end_uuid_map)) {
        throw new Error('Front end uuid not found in uuid map returned from create/update call')
      }
      const back_end_uuid = front_end_uuid_to_back_end_uuid_map[front_end_uuid];
      this.api.uploadFileDirect(back_end_uuid, file).subscribe(
        (res: any) => {
          if(res.type == 'canceled'){
            return;
          }
          if (res.type === HttpEventType.UploadProgress) {
            let upload_percent = Math.round((100 * res.loaded) / res.total);
            file_upload_progress_map[back_end_uuid] = upload_percent;
          }
        }
      );
    }
  }

  saveDraft() {
    let record_object = this.convertFormToRecordObject(this.form as FormGroup);
    return this.api.updateRecord(record_object).pipe(
      switchMap((response: any) => {
        if(response.record) {
          let file_uuid_map = response.upload_file_uuids;
          this.uploadAllFiles(file_uuid_map);
          return of(response.record);
        } else {
          return this.api.fetchRecordLatestPersisted(this.uuid?.value);
        }
      }),
      switchMap((record: any) => {
        let new_form = this.convertRecordObjectToForm(record, this.form.get('combined_dataset_template')?.value, this.form.get('file_upload_progress_map')?.value);
        this.copyNewFormToComponentForm(new_form);
        return of({});
      })
    )
  }

  private convertFormToRecordObject(form: FormGroup): any {
    if(form.contains('no_permissions')) {
      // No view permissions
      return {
        uuid: form.get('uuid')?.value,
        dataset_uuid: form.get('dataset_uuid')?.value,
      };
    }
    let record_object: any = {
      uuid: form.get('uuid')?.value,
      dataset_uuid: form.get('dataset_uuid')?.value,
      fields: [],
      related_records: []
    };
    if(form.contains('public_date')) {
      record_object.public_date = form.get('public_date')?.value;
    }
    for(let field_form of (form.get("fields") as FormArray).controls) {
      record_object.fields.push(this.convertFormToFieldObject(field_form as FormGroup));
    }
    for(let related_record_form of (form.get("related_records") as FormArray).controls) {
      record_object.related_records.push(this.convertFormToRecordObject(related_record_form as FormGroup));
    }
    return record_object;
  }

  private convertFormToFieldObject(form: FormGroup) {
    let field: Record<string, any> = {
      uuid: form.get('uuid')?.value,
      name: form.get('name') ? form.get('name')?.value : "",
      description: form.get('description') ? form.get('description')?.value : "",
    };
    if(form.contains('file')) {
      let file = (form.get('file') as FormControl).value;
      let file_uuid = file.uuid;
      field['file'] = {
        uuid: file_uuid ? file_uuid : "new",
        name: file.name,
        front_end_uuid: file.front_end_uuid
      }
    } else {
      field['value'] = form.get('value') ? form.get('value')?.value : ""
    }
    return field;
  }

  public convertRecordObjectToForm(record_object: any, combined_dataset_template: any, file_upload_progress_map: Record<string, number>): FormGroup {
    if(!combined_dataset_template) {
      throw new Error('record-edit.convertRecordObjectToForm: combined_dataset_template is undefined');
    }
    if(record_object.no_permissions) {
      // No view permissions
      return this._fb.group({
        uuid: record_object.uuid,
        dataset_uuid: record_object.dataset_uuid,
        no_permissions: true
      });
    }
    let form: any = this._fb.group({
      uuid: record_object.uuid,
      dataset_uuid: record_object.dataset_uuid,
      fields: this._fb.array([]),
      related_records: this._fb.array([]),
      combined_dataset_template,
      file_upload_progress_map
    })
    if(record_object.public_date) {
      form.addControl('public_date', new FormControl(record_object.public_date));
    }
    if(record_object.fields) {
      for(let field of record_object.fields) {
        let new_field: FormGroup = this._fb.group({
          uuid: [field.uuid],
          name: [field.name],
          description: [field.description],
          value: [field.value ? field.value : "", {validators: [this.generateFieldValueValidator(field.plugins)]}]
        });
        if(field.type) {
          new_field.addControl("type", new FormControl(field.type))
        }
        if(field.file) {
          new_field.addControl("file", this._fb.control({
            uuid: field.file.uuid,
            name: field.file.name
          }))
          new_field.addControl("file_upload_progress_map", new FormControl(file_upload_progress_map));
        }
        if(field.plugins) {
          new_field.addControl("plugins", new FormControl(field.plugins))
        }
        form.get("fields").push(new_field);
      }
    }
    let dataset_map: any = {};
    if(combined_dataset_template && 'related_datasets' in combined_dataset_template) {
      for(let related_dataset of combined_dataset_template.related_datasets) {
        dataset_map[related_dataset.dataset_uuid] = related_dataset;
      }
    }
    if(record_object && 'related_records' in record_object) {
      for(let related_record of record_object.related_records) {
        (form.get("related_records") as FormArray)
          .push(this.convertRecordObjectToForm(related_record, dataset_map[related_record.dataset_uuid], file_upload_progress_map));
      }
    }
    if(record_object.plugins) {
      form.addControl("plugins", new FormControl(record_object.plugins))
    }
    return form;
  }

  private copyNewFormToComponentForm(new_form: FormGroup) {
    this.form.controls['uuid'].setValue(new_form.get('uuid')?.value);
    this.form.controls['dataset_uuid'].setValue(new_form.get('dataset_uuid')?.value);

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

    this.form.removeControl('related_records');
    this.form.addControl('related_records', new_form.get('related_records'));

    this.form.controls['combined_dataset_template'].setValue(new_form.get('combined_dataset_template')?.value);
  }

  public castControlToGroup(form: AbstractControl) {
    return form as FormGroup;
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

  private generateFieldValueValidator(plugins: any): ValidatorFn {
    if(!plugins) {
      return (control: AbstractControl): ValidationErrors | null => {
        return null;
      };
    }
    plugins = this.fetchPlugins(plugins);
    let getValidationError = (value: any, plugins: any): string|null => {
      for(let plugin of plugins) {
        if(plugin.instanceOfDataValidator()) {
          let error_string = plugin.validateData(value);
          if(error_string) {
            return error_string;
          }
        }
      }
      return null;
    }
    return (control: AbstractControl): ValidationErrors | null => {
      if(!control.value) {
        return null;
      }
      let error = getValidationError(control.value, plugins);
      if (error) {
        return { pluginError: error };
      }
      return null; // Return null if validation passes
    };
  }

  private fetchPlugins(plugins: any) {
    if(!plugins) {
      return [];
    }
    let result_plugins = [];
    for(let plugin_name in plugins) {
      let plugin_version = plugins[plugin_name].version;
      let plugin_options = plugins[plugin_name].options;
      let plugin = this.pluginsService.getFieldPlugin(plugin_name, plugin_version);
      result_plugins.push(new plugin(plugin_options));
    }
    return result_plugins;
  }

  private findGraphFile() {
    let graph_file;
    for(let field of this.fields_form_array?.controls) {
      if(field.get('file')) {
        if(field.get('file')?.value.name.endsWith('.csv')) {
          graph_file = field.get('file')?.value;
          break;
        }
      }
    }
    return graph_file;
  }

  private loadGridstackItems() {
    this.grid?.removeAll();

    this.grid?.batchUpdate();

    let view_settings = (this.combined_dataset_template && 'view_settings' in this.combined_dataset_template) ? this.combined_dataset_template.view_settings : {};
    let fields_grid = view_settings.fields_grid;
    let field_uuids = this.form.value.fields.map((field: any) => field.uuid);
    let field_uuids_not_in_grid = new Set(field_uuids);

    if(fields_grid) {
      for(let child of fields_grid.children) {
        if(child.children) {
          let grandchild_list = [];
          for(let grandchild of child.children) {
            let field_uuid = grandchild.uuid;
            let field = this.appFieldSelectorFromUUID(field_uuid);
            grandchild_list.push({x: grandchild.x, y: grandchild.y, w: grandchild.w, h: grandchild.h, el: field});
            field_uuids_not_in_grid.delete(field_uuid);
          }
          this.grid?.addWidget({x: child.x, y: child.y, w: child.w, h: child.h, subGridOpts: {children: grandchild_list, ...static_sub_grid_options}});
        } else {
          let field_uuid = child.uuid;
          let field = this.appFieldSelectorFromUUID(field_uuid);
          this.grid?.addWidget(field, {x: child.x, y: child.y, w: child.w, h: child.h})
          field_uuids_not_in_grid.delete(field_uuid);
        }
      }
    }

    for(let field_uuid of field_uuids_not_in_grid.values()) {
      let field = this.appFieldSelectorFromUUID(field_uuid as string);
      this.grid!.addWidget(field, {x:0, y: gridHeight(this.grid!)});
    }

    this.grid?.commit();
  }

  private appFieldSelectorFromUUID(uuid: string) {
    const field_form = this.fieldFormFromUuid(uuid);
    return this.appFieldSelectorFromForm(field_form);
  }

  private appFieldSelectorFromForm(form: FormGroup|undefined) {
    const component = this.viewContainerRef.createComponent(FieldComponent);
    component.setInput('form', form);
    component.setInput('disabled', !this.may_edit);
    component.setInput('record_uuid', this.uuid?.value);
    return component.location.nativeElement;
  }

  private fieldFormFromUuid(uuid: string): FormGroup|undefined {
    for(let field_form of (this.form.get('fields') as any).controls) {
      if(field_form.get('uuid').value == uuid) {
        return field_form;
      }
    }
    return undefined;
  }
}
