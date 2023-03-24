import { Component, OnInit, ViewChild } from '@angular/core';
import { ViewWillEnter, ToastController } from '@ionic/angular';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../auth.service';
import { ApiService } from '../api/api.service';
import { DatasetService } from '../api/dataset.service';
import { catchError, EMPTY, Observable, of, switchMap, take, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, ViewWillEnter {

  @ViewChild(HeaderComponent) header: HeaderComponent|undefined;

  isLoggedIn = false;
  datasets: any = [];

  constructor(private api: ApiService, private auth: AuthService,
    private datasetService: DatasetService, private toastController: ToastController) {}

  ngOnInit(): void {

  }
  ionViewWillEnter() {
    this.header?.reloadAuthorized();
    this.auth.userIsAuthenticated.pipe(
      take(1),
      switchMap((isAuthenticated) => {
        if (!isAuthenticated) {
          return this.auth.autoLogin();
        } else {
          return of(isAuthenticated);
        }
      }),
      switchMap(isAuthenticated => {
        this.isLoggedIn = isAuthenticated;
        if (isAuthenticated) {
          return this.api.userDatasets();
        } else {
          return of([]);
        }
      })
    ).subscribe(datasets => {
      this.datasets = datasets;
    });
  }
  deleteDraft(index: number) {
    let dataset = this.datasets[index];
    this.datasetService.deleteDatasetTemplateDraft(dataset.uuid).subscribe(() => {
      this.presentToast();
      this.api.fetchDatasetLatestPersisted(dataset.uuid).pipe(
        catchError(err => {
          if(err.status == 404) {
            this.datasets.splice(index, 1);
            return EMPTY;
          } else {
            return throwError(() => err);
          }
        })
      ).subscribe(new_dataset => {
        this.datasets[index] = new_dataset;
      });
    })

    // console.log('alternate delete...');
    // new Observable(() => {throw 'error'}).pipe(
    //   catchError(err => {
    //     if(err == 'error') {
    //       return EMPTY;
    //     } else {
    //       throw err;
    //     }
    //   })
    // ).subscribe(() => {
    //   console.log('finished');
    // })

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
