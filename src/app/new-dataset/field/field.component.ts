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

}
