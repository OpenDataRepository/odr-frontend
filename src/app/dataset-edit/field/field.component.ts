import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent implements OnInit {

  @Input()
  form: FormGroup|any;

  @Output()
  remove: EventEmitter<void> = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {}

  get name() { return this.form.get('name'); }

  get uuid() { return this.form.get('uuid'); }

  get public_date() { return this.form.get('public_date'); }

  makePublic() {
    this.form.addControl('public_date', new FormControl((new Date()).toISOString()));
  }

  makePrivate() {
    this.form.removeControl('public_date');
  }

}
