import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent implements OnInit {

  @Output()
  remove: EventEmitter<void> = new EventEmitter<void>();

  form: FormGroup;

  constructor(private _fb: FormBuilder) {
    this.form = this._fb.group({
      name: null,
      description: null
    });
  }

  ngOnInit() {}

}
