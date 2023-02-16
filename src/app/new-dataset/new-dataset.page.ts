import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DatasetComponent } from './dataset/dataset.component';

@Component({
  selector: 'app-new-dataset',
  templateUrl: './new-dataset.page.html',
  styleUrls: ['./new-dataset.page.scss'],
})
export class NewDatasetPage implements OnInit {

  @ViewChild(DatasetComponent, { static: true }) dataset_component!: DatasetComponent;

  constructor(private router: Router) { }

  ngOnInit() {
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
    console.log('save button pressed');
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
