import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'dataset-view',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss'],
})
export class DatasetComponent implements OnInit {

  @Input()
  dataset: any = {};

  get persisted(): boolean {
    return !!this.dataset?.dataset_persist_date;
  }

  get public(): boolean {
    return !!this.dataset?.public_date;
  }

  constructor() { }

  ngOnInit() {}

}
