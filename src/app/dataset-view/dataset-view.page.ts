import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { of, switchMap } from 'rxjs';
import { DatasetService } from '../api/dataset.service';

@Component({
  selector: 'app-dataset-view',
  templateUrl: './dataset-view.page.html',
  styleUrls: ['./dataset-view.page.scss'],
})
export class DatasetViewPage implements OnInit, ViewWillEnter {

  uuid: string = "";
  dataset: any = {};

  constructor(private route: ActivatedRoute, private router: Router, private datasetService: DatasetService) { }

  ngOnInit(): void {

  }

  ionViewWillEnter() {
    let uuid = this.route.snapshot.paramMap.get('uuid');
    if(!uuid) {
      this.router.navigateByUrl('/404', {skipLocationChange: true})
    }
    this.uuid = uuid as string;

    this.datasetService.fetchLatestDatasetAndTemplate(this.uuid).subscribe({
      next: (dataset: any) => { this.dataset = dataset; },
      error: (err: any) => {
        if(err.status == 404) {
          this.router.navigateByUrl('/404', {skipLocationChange: true})
          return;
        }
        console.log('HTTP Error', err)
        this.datasetService.fetchLatestDatasetAndTemplate(this.uuid).subscribe({
          next: (dataset: any) => { this.dataset = dataset; },
          error: (err: any) => {
            if(err.status == 404) {
              this.router.navigateByUrl('/404', {skipLocationChange: true})
              return;
            }
            console.log('HTTP Error', err)
          }
        });
      }
    });
  }

  persist() {
    this.datasetService.persistDatasetAndTemplate(this.dataset).pipe(
      switchMap(() => {return this.datasetService.fetchLatestDatasetAndTemplate(this.uuid)}),
      switchMap((new_dataset) => {this.dataset = new_dataset; return of({});})
    ).subscribe();
  }

}
