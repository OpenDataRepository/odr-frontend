import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss'],
})
export class DatasetComponent implements OnInit {

  @Input()
  is_top_level_dataset: boolean = false;

  @Output()
  remove: EventEmitter<void> = new EventEmitter<void>();

  form: FormGroup;

  constructor(private _fb: FormBuilder) {

    this.form = this._fb.group({
      fields: this._fb.array([]),
      related_datasets: this._fb.array([])
    });

  }

  ngOnInit() {}

  deleteField(index: number) {
    this.fields_form_array.removeAt(index);
  }

  addField() {
    this.fields_form_array.push(this._fb.control({
      name: null,
      description: null
    }));
  }

  deleteRelatedDataset(index: number) {
    this.related_datasets_form_array.removeAt(index);
  }

  addRelatedDataset() {
    this.related_datasets_form_array.push(
      this._fb.control({
        conditions: [],
        groups: []
      })
    );
  }

  get fields_form_array(): FormArray {
    return this.form.get("fields") as FormArray;
  }

  get related_datasets_form_array(): FormArray {
    return this.form.get("related_datasets") as FormArray;
  }

}
