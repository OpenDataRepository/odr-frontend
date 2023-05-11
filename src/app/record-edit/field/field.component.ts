import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { PermissionService } from 'src/app/api/permission.service';

@Component({
  selector: 'record-field-edit',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent implements OnInit, OnChanges {

  @Input()
  form: FormGroup|any = new FormGroup({value: new FormControl("")});

  @Input()
  disabled: boolean = false;

  @Output()
  remove: EventEmitter<void> = new EventEmitter<void>();

  edit_permission = true;

  constructor(private permissionService: PermissionService) {}

  ngOnInit() {}

  ngOnChanges() {
    // TODO: figure out if field should even have it's own permissions. For now, just share the permissions of the record it's on
    // if(!this.disabled && this.uuid) {
    //   this.permissionService.hasPermission(this.uuid.value, 'edit').subscribe(result => {this.edit_permission = result as boolean;});
    //   // this.permission_checked = true;
    // }
  }

  get uuid() { return this.form.get('uuid'); }

  get may_edit() { return !this.disabled && this.edit_permission; }

}
