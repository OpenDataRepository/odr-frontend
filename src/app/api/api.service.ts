import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private auth: AuthService) { }

  // TODO: switch to using an interceptor to add headers: https://angular.io/guide/http#setting-default-headers

  newDatasetForTemplate(template_uuid: string) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .get(
          environment.backend_url +  '/dataset/new_dataset_for_template/' + template_uuid,
          { headers: reqHeader }
        );
      })
    )
  }

  createDataset(dataset: any) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .post(
          environment.backend_url +  '/dataset',
          dataset,
          { headers: reqHeader }
        );
      })
    )
  }

  updateDataset(dataset: any) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .put(
          environment.backend_url +  '/dataset/' + dataset.uuid,
          dataset,
          { headers: reqHeader }
        );
      })
    )
  }

  fetchDatasetDraft(uuid: string) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .get(
          environment.backend_url +  '/dataset/' + uuid + '/draft',
          { headers: reqHeader }
        );
      })
    )
  }

  userDatasets() {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .get(
          environment.backend_url +  '/account/datasets',
          { headers: reqHeader }
        );
      })
    )
  }

  deleteDatasetDraft(uuid: string) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .delete(
          environment.backend_url +  '/dataset/' + uuid + '/draft',
          { headers: reqHeader }
        );
      })
    )
  }

  persistDatasetDraft(uuid: string, last_update: string) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Authorization': token
        });
        return this.http
        .post(
          environment.backend_url +  '/dataset/' + uuid + '/persist',
          {last_update},
          { headers: reqHeader }
        );
      })
    )
  }

  fetchDatasetLatestPersisted(uuid: string) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .get(
          environment.backend_url +  '/dataset/' + uuid + '/latest_persisted',
          { headers: reqHeader }
        );
      })
    )
  }

  datasetDraftExisting(uuid: string) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .get(
          environment.backend_url +  '/dataset/' + uuid + '/draft_existing',
          { headers: reqHeader }
        );
      })
    )
  }



  createTemplate(template: any) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .post(
          environment.backend_url +  '/template',
          template,
          { headers: reqHeader }
        );
      })
    )
  }

  updateTemplate(template: any) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .put(
          environment.backend_url +  '/template/' + template.uuid,
          template,
          { headers: reqHeader }
        );
      })
    )
  }

  fetchTemplateDraft(uuid: string) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .get(
          environment.backend_url +  '/template/' + uuid + '/draft',
          { headers: reqHeader }
        );
      })
    )
  }

  fetchTemplateVersion(id: string) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .get(
          environment.backend_url +  '/template/version/' + id,
          { headers: reqHeader }
        );
      })
    )
  }

  deleteTemplateDraft(uuid: string) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .delete(
          environment.backend_url +  '/template/' + uuid + '/draft',
          { headers: reqHeader }
        );
      })
    )
  }

  persistTemplateDraft(uuid: string, last_update: string) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Authorization': token
        });
        return this.http
        .post(
          environment.backend_url +  '/template/' + uuid + '/persist',
          {last_update},
          { headers: reqHeader }
        );
      })
    )
  }

  templateDraftExisting(uuid: string) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .get(
          environment.backend_url +  '/template/' + uuid + '/draft_existing',
          { headers: reqHeader }
        );
      })
    )
  }

  fetchTemplateLatestPersisted(uuid: string) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .get(
          environment.backend_url +  '/template/' + uuid + '/latest_persisted',
          { headers: reqHeader }
        );
      })
    )
  }



  datasetRecords(dataset_uuid: string) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .get(
          environment.backend_url +  '/dataset/' + dataset_uuid + '/records',
          { headers: reqHeader }
        );
      })
    )
  }

  // newRecordForDataset(dataset_uuid: string) {
  //   return this.auth.token
  //   .pipe(
  //     switchMap((token: any) => {
  //       var reqHeader = new HttpHeaders({
  //         'Content-Type': 'application/json',
  //         'Authorization': token
  //       });
  //       return this.http
  //       .get(
  //         environment.backend_url +  '/record/new_record_for_dataset/' + dataset_uuid,
  //         { headers: reqHeader }
  //       );
  //     })
  //   )
  // }

  createRecord(record: any) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .post(
          environment.backend_url +  '/record',
          record,
          { headers: reqHeader }
        );
      })
    )
  }

  updateRecord(record: any) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .put(
          environment.backend_url +  '/record/' + record.uuid,
          record,
          { headers: reqHeader }
        );
      })
    )
  }

  fetchRecordDraft(uuid: string) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .get(
          environment.backend_url +  '/record/' + uuid + '/draft',
          { headers: reqHeader }
        );
      })
    )
  }

  fetchRecordLatestPersisted(uuid: string) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .get(
          environment.backend_url +  '/record/' + uuid + '/latest_persisted',
          { headers: reqHeader }
        );
      })
    )
  }

  deleteRecordDraft(uuid: string) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .delete(
          environment.backend_url +  '/record/' + uuid + '/draft',
          { headers: reqHeader }
        );
      })
    )
  }

  recordDraftExisting(uuid: string) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
        });
        return this.http
        .get(
          environment.backend_url +  '/record/' + uuid + '/draft_existing',
          { headers: reqHeader }
        );
      })
    )
  }

  persistRecordDraft(uuid: string, last_update: string) {
    return this.auth.token
    .pipe(
      switchMap((token: any) => {
        var reqHeader = new HttpHeaders({
          'Authorization': token
        });
        return this.http
        .post(
          environment.backend_url +  '/record/' + uuid + '/persist',
          {last_update},
          { headers: reqHeader }
        );
      })
    )
  }

}
