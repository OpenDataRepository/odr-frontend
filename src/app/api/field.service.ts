import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FieldService {

  constructor(private api: ApiService) { }

  fetchLatestField(uuid: string) {
    return this.api.fetchTemplateFieldDraft(uuid).pipe(
      catchError(err => {
        if(err.status == 404 || err.status == 401) {
          return this.api.fetchTemplateFieldLatestPersisted(uuid);
        } else {
          return throwError(() => err);
        }
      })
    )
  }
}
