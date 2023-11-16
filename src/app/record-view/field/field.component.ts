import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from 'src/app/api/api.service';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent implements OnInit {

  @Input()
  field: any = {};

  constructor(private api: ApiService) { }

  ngOnInit() {}

  get may_view(): boolean {
    return this.field && this.field.name !== undefined;
  }

  downloadFile(file_uuid: string, file_name: string) {
    this.api.fetchFile(file_uuid).subscribe((response: any) => {
      // https://www.youtube.com/watch?v=tAIxMGUEMqE
      let blob: Blob = new Blob([response]);
      let a = document.createElement('a');
      a.download=file_name;
      a.href = window.URL.createObjectURL(blob);
      a.click();
    });

    // TODO: switch to better alternative:
    // this.api.fetchFile(file_uuid).subscribe(file_data => {
    //   saveAs(file_data, file_name);
    // })
  }

}
