import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AlertController, IonModal } from '@ionic/angular';
import { switchMap, of, from, forkJoin, take } from 'rxjs';
import { ApiService } from 'src/app/api/api.service';
import { PermissionService } from 'src/app/api/permission.service';
import { RecordService } from 'src/app/api/record.service';

@Component({
  selector: 'record-edit',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss'],
})
export class RecordComponent implements OnInit, OnChanges {

  @Input()
  is_top_level_record: boolean = false;

  @Input()
  form: FormGroup|any = new FormGroup({name: new FormControl(), fields: new FormArray([]),
    related_records: new FormArray([])});

  @Input()
  disabled: boolean = false;

  @Output()
  remove: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild(IonModal) link_record_modal!: IonModal;

  records_available = false;
  records_to_link: any = [];

  edit_permission = false;

  constructor(private _fb: FormBuilder, private api: ApiService, private recordService: RecordService,
    private alertController: AlertController, private permissionService: PermissionService) {}

  ngOnInit() {}

  ngOnChanges() {
    if(!this.disabled && this.dataset_uuid) {
      this.permissionService.hasPermission(this.dataset_uuid, 'edit').subscribe(result => {this.edit_permission = result as boolean;});
    }
  }

  deleteRelatedRecord(index: number) {
    this.related_records_form_array.removeAt(index);
  }

  addRelatedRecord(dataset_uuid: string) {
    this.api.createRecord({dataset_uuid, related_records: []}).pipe(
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

    let observables = this.related_datasets.map((d: any) => this.api.datasetRecords(d.uuid).pipe(take(1)))
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
          let dataset;
          for(let related_dataset of this.related_datasets) {
            if(related_record_object.dataset_uuid == related_dataset.uuid) {
              dataset = related_dataset;
              break;
            }
          }
          if(!dataset) {
            throw new Error('Cannot find dataset for record ' + uuid)
          }
          this.related_records_form_array.push(this.convertRecordObjectToForm(related_record_object, dataset));
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

  get dataset_uuid(): string {
    return this.form.get('dataset_uuid')?.value;
  }

  get dataset_name() { return this.form.get('dataset')?.value.name; }

  get related_datasets(): any[] {
    return this.form.get('dataset')?.value.related_datasets;
  }

  get may_edit() { return !this.disabled && this.edit_permission; }

  get public(): boolean {
    return !!this.form.get('dataset')?.value.public_date;
  }

  get hasViewPermission(): boolean {
    return !this.form.get('no_permissions');
  }

  getRelatedDatasetForRelatedForm(form: any) {
    let dataset_uuid = form.get('dataset_uuid')?.value;
    for(let related_dataset of this.related_datasets) {
      if(related_dataset.uuid == dataset_uuid) {
        return related_dataset;
      }
    }
    throw "Related dataset not found";
  }

  saveDraft() {
    let record_object = this.convertFormToRecordObject(this.form as FormGroup);
    return this.api.updateRecord(record_object).pipe(
      switchMap((response: any) => {
          let lastStepsCallback = (record: any) => {
            let new_form = this.convertRecordObjectToForm(record, this.form.get('dataset')?.value);
            this.copyNewFormToComponentForm(new_form);
            return of({});
          }
          if(response.record) {
            return lastStepsCallback(response.record);
          } else {
            return this.api.fetchRecordLatestPersisted(this.uuid.value).pipe(
              switchMap((record: any) => {
                return lastStepsCallback(record);
              })
            )
          }
        }
      )
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
    let fields = [];
    for(let field_form of (form.get("fields") as FormArray).controls) {
      fields.push(this.convertFormToFieldObject(field_form as FormGroup));
    }
    let related_records = [];
    for(let related_record_form of (form.get("related_records") as FormArray).controls) {
      related_records.push(this.convertFormToRecordObject(related_record_form as FormGroup));
    }
    return {
      uuid: form.get('uuid')?.value,
      dataset_uuid: form.get('dataset_uuid')?.value,
      fields,
      related_records
    };
  }

  private convertFormToFieldObject(form: FormGroup) {
    let field: any = {
      uuid: form.get('uuid')?.value,
      name: form.get('name') ? form.get('name')?.value : "",
      description: form.get('description') ? form.get('description')?.value : "",
      value: form.get('value') ? form.get('value')?.value : ""
    };
    return field;
  }

  public convertRecordObjectToForm(record_object: any, dataset: any) {
    if(record_object.no_permissions) {
      // No view permissions
      return this._fb.group({
        uuid: record_object.uuid,
        dataset_uuid: record_object.dataset_uuid,
        no_permissions: true
      });
    }
    let form = this._fb.group({
      uuid: record_object.uuid,
      dataset_uuid: record_object.dataset_uuid,
      fields: this._fb.array([]),
      related_records: this._fb.array([]),
      dataset
    })
    if(record_object.fields) {
      for(let field of record_object.fields) {
        (form.get("fields") as FormArray).push(this._fb.group({
          uuid: new FormControl(field.uuid),
          name: new FormControl(field.name),
          description: new FormControl(field.description),
          value: new FormControl(field.value ? field.value : "")
        }));
      }
    }
    let dataset_map: any = {};
    if(dataset.related_datasets) {
      for(let related_dataset of dataset.related_datasets) {
        dataset_map[related_dataset.uuid] = related_dataset;
      }
    }
    if(record_object.related_records) {
      for(let related_record of record_object.related_records) {
        (form.get("related_records") as FormArray)
          .push(this.convertRecordObjectToForm(related_record, dataset_map[related_record.dataset_uuid]));
      }
    }
    return form;
  }

  private copyNewFormToComponentForm(new_form: FormGroup) {
    this.form.controls['uuid'].setValue(new_form.get('uuid')?.value);
    this.form.controls['dataset_uuid'].setValue(new_form.get('dataset_uuid')?.value);

    this.form.removeControl('fields');
    this.form.addControl('fields', new_form.get('fields'));

    this.form.removeControl('related_records');
    this.form.addControl('related_records', new_form.get('related_records'));

    this.form.controls['dataset'].setValue(new_form.get('dataset')?.value);
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

}
