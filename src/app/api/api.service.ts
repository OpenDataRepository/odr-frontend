import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private auth: AuthService) {

   }

  private reqHeader() {
    return this.auth.token
    .pipe(
      switchMap(token => {
        var header_options: any = {
          'Content-Type': 'application/json'
        };
        if(token) {
          header_options['Authorization'] = token;
        }
        return of(new HttpHeaders(header_options));
      })
    );
  }

  private authHeader() {
    return this.auth.token
    .pipe(
      switchMap(token => {
        var header_options: any = {};
        if(token) {
          header_options['Authorization'] = token;
        }
        return of(new HttpHeaders(header_options));
      })
    );
  }

  newDatasetForTemplate(template_uuid: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .get(
          environment.backend_url +  '/dataset/new_dataset_for_template/' + template_uuid,
          { headers }
        );
      })
    )
  }

  createDataset(dataset: any) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .post(
          environment.backend_url +  '/dataset',
          dataset,
          { headers }
        );
      })
    )
  }

  updateDataset(dataset: any) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .put(
          environment.backend_url +  '/dataset/' + dataset.uuid,
          dataset,
          { headers }
        );
      })
    )
  }

  fetchDatasetDraft(uuid: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .get(
          environment.backend_url +  '/dataset/' + uuid + '/draft',
          { headers }
        );
      })
    )
  }

  userDatasets() {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .get(
          environment.backend_url +  '/account/datasets',
          { headers }
        );
      })
    )
  }

  publicDatasets() {
    var reqHeader = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http
    .get(
      environment.backend_url +  '/dataset/all_public_datasets',
      { headers: reqHeader }
    );
  }

  deleteDatasetDraft(uuid: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .delete(
          environment.backend_url +  '/dataset/' + uuid + '/draft',
          { headers }
        );
      })
    )
  }

  persistDatasetDraft(uuid: string, last_update: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .post(
          environment.backend_url +  '/dataset/' + uuid + '/persist',
          {last_update},
          { headers }
        );
      })
    )
  }

  fetchDatasetLatestPersisted(uuid: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .get(
          environment.backend_url +  '/dataset/' + uuid + '/latest_persisted',
          { headers }
        );
      })
    )
  }

  datasetDraftExisting(uuid: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .get(
          environment.backend_url +  '/dataset/' + uuid + '/draft_existing',
          { headers }
        );
      })
    )
  }



  createTemplate(template: any) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .post(
          environment.backend_url +  '/template',
          template,
          { headers }
        );
      })
    )
  }

  updateTemplate(template: any) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .put(
          environment.backend_url +  '/template/' + template.uuid,
          template,
          { headers }
        );
      })
    )
  }

  fetchTemplateDraft(uuid: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .get(
          environment.backend_url +  '/template/' + uuid + '/draft',
          { headers }
        );
      })
    )
  }

  fetchTemplateVersion(id: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .get(
          environment.backend_url +  '/template/version/' + id,
          { headers }
        );
      })
    )
  }

  deleteTemplateDraft(uuid: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .delete(
          environment.backend_url +  '/template/' + uuid + '/draft',
          { headers }
        );
      })
    )
  }

  persistTemplateDraft(uuid: string, last_update: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .post(
          environment.backend_url +  '/template/' + uuid + '/persist',
          {last_update},
          { headers }
        );
      })
    )
  }

  templateDraftExisting(uuid: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .get(
          environment.backend_url +  '/template/' + uuid + '/draft_existing',
          { headers }
        );
      })
    )
  }

  fetchTemplateLatestPersisted(uuid: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .get(
          environment.backend_url +  '/template/' + uuid + '/latest_persisted',
          { headers }
        );
      })
    )
  }


  createTemplateField(template_field: any) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .post(
          environment.backend_url +  '/template_field',
          template_field,
          { headers }
        );
      })
    )
  }

  fetchTemplateFieldDraft(uuid: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .get(
          environment.backend_url +  '/template_field/' + uuid + '/draft',
          { headers }
        );
      })
    )
  }

  fetchTemplateFieldLatestPersisted(uuid: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .get(
          environment.backend_url +  '/template_field/' + uuid + '/latest_persisted',
          { headers }
        );
      })
    )
  }

  userTemplateFields() {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .get(
          environment.backend_url +  '/account/template_fields',
          { headers }
        );
      })
    )
  }

  publicTemplateFields() {
    var reqHeader = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http
    .get(
      environment.backend_url +  '/template_field/all_public_fields',
      { headers: reqHeader }
    );
  }




  datasetRecords(dataset_uuid: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .get(
          environment.backend_url +  '/dataset/' + dataset_uuid + '/records',
          { headers }
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
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .post(
          environment.backend_url +  '/record',
          record,
          { headers }
        );
      })
    )
  }

  updateRecord(record: any) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .put(
          environment.backend_url +  '/record/' + record.uuid,
          record,
          { headers }
        );
      })
    )
  }

  fetchRecordDraft(uuid: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .get(
          environment.backend_url +  '/record/' + uuid + '/draft',
          { headers }
        );
      })
    )
  }

  fetchRecordLatestPersisted(uuid: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .get(
          environment.backend_url +  '/record/' + uuid + '/latest_persisted',
          { headers }
        );
      })
    )
  }

  deleteRecordDraft(uuid: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .delete(
          environment.backend_url +  '/record/' + uuid + '/draft',
          { headers }
        );
      })
    )
  }

  recordDraftExisting(uuid: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .get(
          environment.backend_url +  '/record/' + uuid + '/draft_existing',
          { headers }
        );
      })
    )
  }

  persistRecordDraft(uuid: string, last_update: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .post(
          environment.backend_url +  '/record/' + uuid + '/persist',
          {last_update},
          { headers }
        );
      })
    )
  }

  currentUserHasPermission(uuid: string, level: string) {
    return this.reqHeader()
    .pipe(
      switchMap((headers: any) => {
        return this.http
        .get(
          environment.backend_url +  '/permission/current_user_has_permission/' + uuid + '/' + level,
          { headers }
        );
      })
    )
  }


  uploadFileDirect(uuid: string, file: any) {
    let headers: HttpHeaders;
    return this.authHeader()
    .pipe(
      switchMap((hdrs: HttpHeaders) => {
        console.log(`setting file size to ${file.size.toString()}`);
        headers = hdrs.append('size', file.size.toString())
        return this.http.get(environment.backend_url + "/file/" + uuid + "/directUploadStatus", { headers: headers })
      }),
      switchMap((res: any) => {
        if (res.status === "file is present") {
          console.error(`trying to upload to existing file ${uuid}`)
          return of({type: "canceled"});
        }
        let uploadedBytes = res.uploaded; //GET response how much file is uploaded
        headers = headers.append("x-start-byte", uploadedBytes.toString());
        // Useful for showing animation of Mat Spinner
        const req = new HttpRequest(
          "POST",
          environment.backend_url + "/file/" + uuid + "/direct",
          file.slice(uploadedBytes, file.size + 1),
          {
            headers,
            reportProgress: true //continously fetch data from server of how much file is uploaded
          }
        );
        return this.http.request(req);
      })
    )
  }

  fetchFile(uuid: string) {
    return this.authHeader()
    .pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http
        .get(
          environment.backend_url +  '/file/' + uuid,
          { headers, 'responseType': "blob" }
        );
      })
    )
  }
}

export namespace ApiService {
  export enum PermissionType {
    Admin = "admin",
    Edit = "edit",
    View = "view"
  }
}
