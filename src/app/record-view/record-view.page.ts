import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, of, last } from 'rxjs';
import { ApiService } from '../api/api.service';
import { DatasetService } from '../api/dataset.service';
import { RecordService } from '../api/record.service';

@Component({
  selector: 'app-record-view',
  templateUrl: './record-view.page.html',
  styleUrls: ['./record-view.page.scss'],
})
export class RecordViewPage implements OnInit {

  uuid: string = "";
  record: any = {};
  has_persisted_version = false;

  constructor(private route: ActivatedRoute, private router: Router,
    private recordService: RecordService, private api: ApiService) { }

  ngOnInit(): void {
  }

  ionViewWillEnter() {
    let uuid = this.route.snapshot.paramMap.get('uuid');
    if(!uuid) {
      this.router.navigateByUrl('/404', {skipLocationChange: true})
    }
    this.uuid = uuid as string;

    this.recordService.fetchLatestRecord(this.uuid).subscribe({
      next: (record: any) => { this.record = record; },
      error: (err: any) => {
        if(err.status == 404) {
          this.router.navigateByUrl('/404', {skipLocationChange: true})
          return;
        }
      }
    });

    this.api.fetchRecordLatestPersisted(this.uuid).subscribe({
      next: () => { this.has_persisted_version = true; },
      error: () => { this.has_persisted_version = false; }
    })
  }

  persist() {
    this.api.persistRecordDraft(this.record.uuid, this.recordUpdatedAt(this.record)).pipe(
      switchMap(() => {return this.recordService.fetchLatestRecord(this.uuid)}),
      switchMap((new_record) => {this.record = new_record; return of({});})
    ).subscribe();
  }

  private recordUpdatedAt(record: any) {
    let updated_at = record.updated_at;
    for(let related_record of record.related_records) {
      let related_updated_at = this.recordUpdatedAt(related_record);
      if(this.compareTime(related_updated_at, updated_at)) {
        updated_at = related_updated_at;
      }
    }
    return updated_at;
  }

  private compareTime(a: string, b: string): boolean {
    return ((new Date(a)).getTime() - (new Date(b)).getTime()) > 0;
  }
}
