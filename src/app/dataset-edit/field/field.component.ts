import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PermissionService } from 'src/app/api/permission.service';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent implements OnInit, OnChanges {

  @Input()
  form: FormGroup|any;

  @Input()
  disabled: boolean = false;

  @Output()
  remove: EventEmitter<void> = new EventEmitter<void>();

  edit_permission = false;

  constructor(private permissionService: PermissionService) {}

  ngOnInit() {}

  ngOnChanges() {
    if(!this.disabled && this.uuid) {
      this.permissionService.hasPermission(this.uuid.value, 'edit').subscribe(result => {this.edit_permission = result as boolean;});
      // this.permission_checked = true;
    }
  }

  get name() { return this.form.get('name'); }

  get uuid() { return this.form.get('uuid'); }

  get public_date() { return this.form.get('public_date'); }

  get updated_at() { return this.form.get('updated_at'); }

  get may_edit() { return !this.uuid || (!this.disabled && this.edit_permission); }

  makePublic() {
    this.form.addControl('public_date', new FormControl((new Date()).toISOString()));
  }

  makePrivate() {
    this.form.removeControl('public_date');
  }

}
