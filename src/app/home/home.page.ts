import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ViewWillEnter } from '@ionic/angular';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, ViewWillEnter {

  @ViewChild(HeaderComponent) header: HeaderComponent|undefined;

  @ViewChild('singleRecordForm') singleRecordForm: NgForm|undefined;
  private _fetchedRecord: object|undefined;

  get fetchedRecord() {
    return JSON.stringify(this._fetchedRecord);
  }

  @ViewChild('publishedRecordsForm') publishedRecordsForm: NgForm|undefined;
  private _fetchedDatasetRecords: object|undefined;

  get fetchedDatasetRecords() {
    return JSON.stringify(this._fetchedDatasetRecords);
  }

  @ViewChild('searchRecordsForm') searchRecordsForm: NgForm|undefined;
  private _searchedDatasetRecords: object|undefined;

  get searchedDatasetRecords() {
    return JSON.stringify(this._searchedDatasetRecords);
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {

  }
  ionViewWillEnter() {
    this.header?.reloadAuthorized();
  }



  fetchRecord() {
    const uuid = this.singleRecordForm?.value['uuid'];
    this.http.get(environment.backend_url +  '/record/' + uuid + '/latest_persisted')
      .subscribe(response => {
        this._fetchedRecord = response;
      })
  }

  fetchPublishedRecords() {
    const uuid = this.publishedRecordsForm?.value['uuid'];
    const version_name = this.publishedRecordsForm?.value['version_name'];
    this.http.get('http://localhost:3000/dataset/' + uuid + '/published/' + version_name + '/records')
      .subscribe(response => {
        this._fetchedDatasetRecords = response;
      })
  }

  searchPublishedRecords() {
    const uuid = this.searchRecordsForm?.value['uuid'];
    const version_name = this.searchRecordsForm?.value['version_name'];
    const key = this.searchRecordsForm?.value['key'];
    const value = this.searchRecordsForm?.value['value'];
    let url = 'http://localhost:3000/dataset/' + uuid + '/published/' + version_name + '/search_records';
    if(key && value) {
      url += "?" + key + "=" + value;
    }
    this.http.get(url)
      .subscribe(response => {
        this._searchedDatasetRecords = response;
      })
  }

}
