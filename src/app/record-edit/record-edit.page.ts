import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, switchMap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { RecordComponent } from './record/record.component';

@Component({
  selector: 'app-record-edit',
  templateUrl: './record-edit.page.html',
  styleUrls: ['./record-edit.page.scss'],
})
export class RecordEditPage implements OnInit {

  @ViewChild(RecordComponent, { static: true }) record_component!: RecordComponent;

  uuid: string = "";
  form: FormGroup|any = new FormGroup({name: new FormControl(), fields: new FormArray([]),
    related_records: new FormArray([])});
  dataset: any;

  constructor(private route: ActivatedRoute, private router: Router, private api: ApiService) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    let uuid = this.route.snapshot.paramMap.get('uuid');
    let dataset_uuid = this.route.snapshot.paramMap.get('dataset_uuid');
    if(!uuid && dataset_uuid) {
      let response: any = await firstValueFrom(this.api.createRecord({dataset_uuid, related_records: []}));
      let record_object = response.record;
      this.router.navigateByUrl('/record-edit/' + record_object.uuid);
      return;
    }
    this.uuid = uuid as string;

    let temp_record: any;
    this.api.fetchRecordDraft(this.uuid).pipe(
      switchMap((record: any) => {
        temp_record = record
        return this.api.fetchDatasetLatestPersisted(record.dataset_uuid);
      })
    ).subscribe(dataset => {
      this.dataset = dataset;
      this.form = this.record_component.convertRecordObjectToForm(temp_record, dataset);
    });
  }

  exitEditMode() {
    const uuid = this.record_component.form.controls['uuid'].value;
    const dataset_uuid = this.dataset.uuid;
    if(uuid) {
      this.router.navigateByUrl('/record-view/' + uuid);
    } else {
      this.router.navigateByUrl('/dataset-records/' + dataset_uuid);
    }
  }

  saveDraft() {
    this.record_component.saveDraft().subscribe(() => {
      this.exitEditMode();
    });
  }


  displayFormProblems() {
    if(this.record_component.form.valid) {
      return;
    }
    console.log('form invalid. invalid controls are: ');
    console.log(this.findInvalidControls());
    console.log(this.record_component.form.status);
  }

  private findInvalidControls() {
    const invalid = [];
    const controls = this.record_component.form.controls;
    for (const name in controls) {
        if (!controls[name].valid) {
            invalid.push(name);
        }
    }
    return invalid;
  }
}
