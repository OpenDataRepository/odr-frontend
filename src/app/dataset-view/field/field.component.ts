import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent implements OnInit {

  @Input()
  field: any = {};

  @Input()
  template_uuid: string|undefined;

  constructor() { }

  ngOnInit() {}

  get public(): boolean {
    return !!this.field?.public_date;
  }

  private hasViewPermission(): boolean {
    return !!this.field?.updated_at;
  }

  get may_view(): boolean {
    return this.public || this.hasViewPermission();
  }

  objectKeys(object: any) {
    return Object.keys(object);
  }

}
