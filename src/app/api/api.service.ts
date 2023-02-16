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

}
