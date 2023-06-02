import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from 'src/app/api/api.service';

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

  get private(): boolean {
    return this.record?.public_date;
  }

  get hasViewPermission(): boolean {
    return !this.record?.no_permissions;
  }

  constructor(private api: ApiService) { }

  ngOnInit() {}

  downloadFile(file_uuid: string, file_name: string) {
    this.api.fetchFile(file_uuid).subscribe((response: any) => {
      // https://www.youtube.com/watch?v=tAIxMGUEMqE
      let blob: Blob = new Blob([response]);
      let a = document.createElement('a');
      a.download=file_name;
      a.href = window.URL.createObjectURL(blob);
      a.click();
    });
  }

}
