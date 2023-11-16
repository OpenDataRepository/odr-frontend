import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, switchMap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { RecordComponent } from './record/record.component';
import { RecordService } from '../api/record.service';
import { DatasetService } from '../api/dataset.service';

@Component({
  selector: 'app-record-edit',
  templateUrl: './record-edit.page.html',
  styleUrls: ['./record-edit.page.scss'],
})
export class RecordEditPage implements OnInit {

  @ViewChild(RecordComponent, { static: true }) record_component!: RecordComponent;

  uuid: string = "";
  form: FormGroup = new FormGroup({name: new FormControl(), fields: new FormArray([]),
    related_records: new FormArray([])});
  combined_dataset_template: any;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private api: ApiService,
              private datasetService: DatasetService,
              private recordService: RecordService) { }

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
    this.fetchDataAndSetForm();
  }

  private fetchDataAndSetForm() {
    let temp_record: any;
    this.recordService.fetchLatestRecord(this.uuid).pipe(
      switchMap((record: any) => {
        temp_record = record
        return this.datasetService.fetchLatestPersistedDatasetAndTemplate(record.dataset_uuid);
      })
    ).subscribe(combined_dataset_template => {
      this.combined_dataset_template = combined_dataset_template;
      let file_upload_progress_map = (this.form && this.form.contains('file_upload_progress_map')) ? this.form.get('file_upload_progress_map')!.value : {};
      this.form = this.record_component.convertRecordObjectToForm(temp_record, combined_dataset_template, file_upload_progress_map);
    });
  }

  exitEditMode() {
    const uuid = this.record_component.form.controls['uuid'].value;
    const dataset_uuid = this.combined_dataset_template.dataset_uuid;
    if(uuid) {
      this.router.navigateByUrl('/record-view/' + uuid);
    } else {
      this.router.navigateByUrl('/dataset-records/' + dataset_uuid);
    }
  }

  saveDraft() {
    this.record_component.saveDraft().subscribe(() => {
      this.fetchDataAndSetForm();
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
