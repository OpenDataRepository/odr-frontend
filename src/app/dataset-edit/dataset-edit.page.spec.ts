import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { DatasetService } from '../api/dataset.service';

import { DatasetEditPage } from './dataset-edit.page';
import { DatasetComponent } from './dataset/dataset.component';

describe('DatasetEditPage', () => {
  let component: DatasetEditPage;
  let fixture: ComponentFixture<DatasetEditPage>;

  class ActivatedRouteMock {
    snapshot = {
      paramMap: {
        get: (param: string) => {
          return param;
        }
      }
    }
  }

  class DatasetServiceMock {
    fetchLatestDatasetAndTemplate = () => {
      return of({
        dataset_uuid: "d_uuid",
        dataset_id: "d_id",
        template_uuid: "t_uuid",
        template_id: "t_id",
        name: "name",
        dataset_updated_at: (new Date()).toISOString(),
        template_updated_at: (new Date()).toISOString(),
        dataset_persist_date: undefined,
        fields: [],
        related_datasets: []
      });
    }
  }

  // @Component({selector: 'dataset-edit', template: ''})
  // class DatasetEditStubComponent {
  //   @Input()
  //   form: any;

  //   convertDatasetObjectToForm = () => {
  //     return new FormGroup({name: new FormControl(), fields: new FormArray([]),
  //       related_datasets: new FormArray([])});
  //   }
  // }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetEditPage
        , DatasetComponent
        // , DatasetEditStubComponent
      ],
      providers: [
        DatasetEditPage,
        DatasetComponent,
        { provide: ActivatedRoute, useClass: ActivatedRouteMock },
        { provide: DatasetService, useClass: DatasetServiceMock },
        FormBuilder
      ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    let sub_fixture = TestBed.createComponent(DatasetComponent);
    let sub_component = sub_fixture.componentInstance;
    // const datasetEditComponent = new DatasetComponent(new FormBuilder(), new DatasetService("s"));
    fixture = TestBed.createComponent(DatasetEditPage);
    component = fixture.componentInstance;
    component.dataset_component = sub_component;
    component.ionViewWillEnter();
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
