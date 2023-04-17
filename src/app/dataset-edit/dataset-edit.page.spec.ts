import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { DatasetService } from '../api/dataset.service';

import { DatasetEditPage } from './dataset-edit.page';
import { DatasetComponent } from './dataset/dataset.component';
import { ApiService } from '../api/api.service';
import { HeaderComponent } from '../header/header.component';

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

  class ApiServiceMock {
  }

  @Component({
    selector: 'app-header',
    template: '<p>Mock App header</p>'
  })
  class MockAppHeader {}

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        DatasetEditPage,
        DatasetComponent,
        MockAppHeader
      ],
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteMock },
        { provide: DatasetService, useClass: DatasetServiceMock },
        { provide: ApiService, useClass: ApiServiceMock },
        FormBuilder
      ],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule
      ]
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
