import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { switchMap, of } from 'rxjs';
import { ApiService } from 'src/app/api/api.service';

@Component({
  selector: 'record-edit',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss'],
})
export class RecordComponent implements OnInit {

  @Input()
  is_top_level_record: boolean = false;

  @Input()
  form: FormGroup|any = new FormGroup({name: new FormControl(), fields: new FormArray([]),
    related_records: new FormArray([])});

  @Input()
  dataset: any;

  @Output()
  remove: EventEmitter<void> = new EventEmitter<void>();

  constructor(private _fb: FormBuilder, private api: ApiService) {}

  ngOnInit() {
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

  get fields_form_array(): FormArray {
    return this.form.get("fields") as FormArray;
  }

  get related_records_form_array(): FormArray {
    return this.form.get("related_records") as FormArray;
  }

  get related_datasets(): any[] {
    return this.form.get('dataset')?.value.related_datasets;
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

  get name() { return this.form.get('name'); }

  get uuid() { return this.form.get('uuid'); }

  saveDraft() {
    let record_object = this.convertFormToRecordObject(this.form as FormGroup);
    return this.api.updateRecord(record_object).pipe(
      switchMap((response: any) => {
          let updated_record_object = response.record;
          let new_form = this.convertRecordObjectToForm(updated_record_object, this.form.get('dataset')?.value);
          this.copyNewFormToComponentForm(new_form);
          return of({});
        }
      )
    )
  }

  private convertFormToRecordObject(form: FormGroup): any {
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
    let form = this._fb.group({
      uuid: record_object.uuid,
      dataset_uuid: record_object.dataset_uuid,
      fields: this._fb.array([]),
      related_records: this._fb.array([]),
      dataset
    })
    for(let field of record_object.fields) {
      (form.get("fields") as FormArray).push(this._fb.group({
        uuid: new FormControl(field.uuid),
        name: new FormControl(field.name, [Validators.required]),
        description: new FormControl(field.description),
        value: new FormControl(field.value ? field.value : "")
      }));
    }
    let dataset_map: any = {};
    for(let related_dataset of dataset.related_datasets) {
      dataset_map[related_dataset.uuid] = related_dataset;
    }
    for(let related_record of record_object.related_records) {
      (form.get("related_records") as FormArray)
        .push(this.convertRecordObjectToForm(related_record, dataset_map[related_record.dataset_uuid]));
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


}
