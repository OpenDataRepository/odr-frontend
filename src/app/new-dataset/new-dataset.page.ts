import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Field } from './field/field.model';

@Component({
  selector: 'app-new-dataset',
  templateUrl: './new-dataset.page.html',
  styleUrls: ['./new-dataset.page.scss'],
})
export class NewDatasetPage implements OnInit {

  // public fields: Field[] = [];

  new_dataset_form = this.fb.group({
    fields: this.fb.array([]),
    related_datasets: this.fb.array([])
  });

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
  }

  // TODO: add method to add a related_dataset form to a dataset form

  addField() {
    const form = this.fb.group({
        name: ['', Validators.required],
        description: ['']
    });

    this.fields.push(form);
  }


  deleteField(index: number) {
    this.fields.removeAt(index);
  }

  get fields() {
    return this.new_dataset_form.controls["fields"] as FormArray;
  }

  addDataset() {
    const form = this.fb.group({

    });

    this.related_datasets.push(form);
  }


  deleteDataset(index: number) {
    this.related_datasets.removeAt(index);
  }

  get related_datasets() {
    return this.new_dataset_form.controls["related_datasets"] as FormArray;
  }

  castTo<T>(): (x: any) => T {
    return (x) => x as T
  }
  $castToFieldGroup = this.castTo<FormGroup>();

}
