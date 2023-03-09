import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'record-view',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss'],
})
export class RecordComponent implements OnInit {

  @Input()
  record: any = {};

  get persisted(): boolean {
    return !!this.record?.persist_date;
  }

  constructor() { }

  ngOnInit() {}

}
