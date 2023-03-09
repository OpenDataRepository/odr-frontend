import { Injectable } from '@angular/core';
import { catchError, switchMap } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class RecordService {

  constructor(private api: ApiService) { }

  fetchLatestRecord(uuid: string) {
    return this.api.fetchRecordDraft(uuid).pipe(
      catchError(err => {
        if(err.status == 404) {
          return this.api.fetchRecordLatestPersisted(uuid);
        } else {
          throw err;
        }
      })
    )
  }
}
