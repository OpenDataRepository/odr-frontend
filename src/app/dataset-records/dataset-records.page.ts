import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, ViewWillEnter } from '@ionic/angular';
import { catchError, EMPTY, throwError } from 'rxjs';
import { ApiService } from '../api/api.service';
import { AuthService } from '../auth.service';
import { PermissionService } from '../api/permission.service';

@Component({
  selector: 'app-dataset-records',
  templateUrl: './dataset-records.page.html',
  styleUrls: ['./dataset-records.page.scss'],
})
export class DatasetRecordsPage implements OnInit, ViewWillEnter {

  dataset_uuid: string = "";
  records: any = [];
  has_edit_permission = false;

  constructor(private route: ActivatedRoute, private router: Router,
    private api: ApiService, private toastController: ToastController,
    private auth: AuthService, private permissionService: PermissionService) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    let uuid = this.route.snapshot.paramMap.get('uuid');
    if(!uuid) {
      this.router.navigateByUrl('/404', {skipLocationChange: true})
    }
    this.dataset_uuid = uuid as string;

    this.api.datasetRecords(uuid as string).subscribe({
      next: (records: any) => { this.records = records; },
      error: (err: any) => {
        if(err.status == 404) {
          this.router.navigateByUrl('/404', {skipLocationChange: true})
          return;
        }
        if(err.status == 401) {
          this.auth.send401OrRedirectToLogin();
          return;
        }
        console.error('HTTP Error', err)
      }
    })

    this.permissionService.hasPermission(uuid as string, ApiService.PermissionType.Edit).subscribe(result => {
      if(result) {
        this.has_edit_permission = true;
      }
    })
  }

  deleteDraft(index: number) {
    let record = this.records[index];
    this.api.deleteRecordDraft(record.uuid).subscribe(() => {
      this.presentToast();
      this.api.fetchRecordLatestPersisted(record.uuid).pipe(
        catchError(err => {
          if(err.status == 404) {
            this.records.splice(index, 1);
            return EMPTY;
          } else {
            return throwError(() => err);
          }
        })
      ).subscribe(new_record => {
        this.records[index] = new_record;
      });
    })
  }

  private async presentToast() {
    const toast = await this.toastController.create({
      message: 'Draft Deleted',
      duration: 2000,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ],
    });

    await toast.present();
  }

}
