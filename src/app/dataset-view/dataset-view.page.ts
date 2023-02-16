import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
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

    this.datasetService.fetchDatasetAndTemplate(this.uuid).subscribe({
      next: (dataset: any) => { this.dataset = dataset; },
      // TODO: Redirect if null and render otherwise
      error: (err: any) => { console.log('HTTP Error', err) }
    });
  }



}
