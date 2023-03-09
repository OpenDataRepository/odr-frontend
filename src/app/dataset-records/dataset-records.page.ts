import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, ViewWillEnter } from '@ionic/angular';
import { catchError, EMPTY } from 'rxjs';
import { ApiService } from '../api/api.service';

@Component({
  selector: 'app-dataset-records',
  templateUrl: './dataset-records.page.html',
  styleUrls: ['./dataset-records.page.scss'],
})
export class DatasetRecordsPage implements OnInit, ViewWillEnter {

  dataset_uuid: string = "";
  records: any = [];

  constructor(private route: ActivatedRoute, private router: Router,
    private api: ApiService, private toastController: ToastController) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    let uuid = this.route.snapshot.paramMap.get('uuid');
    if(!uuid) {
      this.router.navigateByUrl('/404', {skipLocationChange: true})
    }
    this.dataset_uuid = uuid as string;

    this.api.datasetRecords(uuid as string).subscribe(records => {this.records = records;})
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
            throw err;
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
