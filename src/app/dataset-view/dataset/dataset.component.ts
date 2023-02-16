import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'dataset-view',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss'],
})
export class DatasetComponent implements OnInit {

  @Input()
  dataset: any = {};

  constructor() { }

  ngOnInit() {}

}
