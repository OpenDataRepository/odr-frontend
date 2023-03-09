import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { DatasetService } from '../api/dataset.service';
import { DatasetComponent } from './dataset/dataset.component';

@Component({
  selector: 'app-dataset-edit',
  templateUrl: './dataset-edit.page.html',
  styleUrls: ['./dataset-edit.page.scss'],
})
export class DatasetEditPage implements OnInit {

  @ViewChild(DatasetComponent, { static: true }) dataset_component!: DatasetComponent;

  uuid: string = "";
  form: FormGroup|any = new FormGroup({name: new FormControl(), fields: new FormArray([]),
    related_datasets: new FormArray([])});

  constructor(private route: ActivatedRoute, private router: Router, private datasetService: DatasetService) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    let uuid = this.route.snapshot.paramMap.get('uuid');
    if(uuid == 'new') {
      let dataset_object = await firstValueFrom(this.datasetService.newEmptyDatasetAndTemplate());
      this.router.navigateByUrl('/dataset-edit/' + dataset_object.dataset_uuid);
      return;
    }
    this.uuid = uuid as string;

    this.datasetService.fetchLatestDatasetAndTemplate(this.uuid).subscribe({
      next: (dataset: any) => { this.form = this.dataset_component.convertDatasetObjectToForm(dataset); },
      // TODO: 404 if null and render otherwise
      error: (err: any) => { console.log('HTTP Error', err) }
    });
  }

  exitEditMode() {
    const uuid = this.dataset_component.form.controls['dataset_uuid'].value;
    if(uuid) {
      this.router.navigateByUrl('/dataset-view/' + uuid);
    } else {
      this.router.navigateByUrl('/');
    }
  }

  saveDraft() {
    this.dataset_component.saveDraft().subscribe(() => {
      this.exitEditMode();
    });
  }


  displayFormProblems() {
    if(this.dataset_component.form.valid) {
      return;
    }
    console.log('form invalid. invalid controls are: ');
    console.log(this.findInvalidControls());
    console.log(this.dataset_component.form.status);
  }

  private findInvalidControls() {
    const invalid = [];
    const controls = this.dataset_component.form.controls;
    for (const name in controls) {
        if (!controls[name].valid) {
            invalid.push(name);
        }
    }
    return invalid;
  }
}
