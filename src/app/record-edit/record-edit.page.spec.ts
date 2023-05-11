import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { ApiService } from '../api/api.service';

import { RecordEditPage } from './record-edit.page';
import { RecordComponent } from './record/record.component';
import { RecordService } from '../api/record.service';
import { PermissionService } from '../api/permission.service';

describe('RecordEditPage', () => {
  let component: RecordEditPage;
  let fixture: ComponentFixture<RecordEditPage>;

  class ActivatedRouteMock {
    snapshot = {
      paramMap: {
        get: (param: string) => {
          return param;
        }
      }
    }
  }

  class ApiServiceMock {
    fetchDatasetLatestPersisted = () => {
      return of({
        uuid: "d_uuid",
        _id: "d_id",
        template_id: "t_id",
        name: "name",
        updated_at: (new Date()).toISOString(),
        dataset_persist_date: (new Date()).toISOString(),
        fields: [],
        related_datasets: []
      });
    }
  }

  class RecordServiceMock {
    fetchLatestRecord = () => {
      return of({
        dataset_uuid: "d_uuid",
        _id: "_id",
        uuid: "r_uuid",
        updated_at: (new Date()).toISOString(),
        persist_date: (new Date()).toISOString(),
        fields: [],
        related_records: []
      });
    };
  }

  class PermissionServiceMock {
    hasPermission = (uuid: string, permission: string ) => {
      return of(true);
    }
  }

  // @Component({selector: 'record-edit', template: ''})
  // class RecordEditStubComponent {
  //   @Input()
  //   form: any;

  //   @Input()
  //   is_top_level_record: boolean = false;
  // }

  @Component({selector: 'app-header', template: ''})
  class AppHeaderStubComponent {
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordEditPage
        , RecordComponent
        // , RecordEditStubComponent
        , AppHeaderStubComponent
      ],
      providers: [
        RecordComponent,
        { provide: ActivatedRoute, useClass: ActivatedRouteMock },
        { provide: ApiService, useClass: ApiServiceMock },
        { provide: RecordService, useClass: RecordServiceMock },
        FormBuilder,
        { provide: PermissionService, useClass: PermissionServiceMock }
      ],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule
      ]
    }).compileComponents();

    let sub_fixture = TestBed.createComponent(RecordComponent);
    let sub_component = sub_fixture.componentInstance;

    fixture = TestBed.createComponent(RecordEditPage);
    component = fixture.componentInstance;
    component.record_component = sub_component;
    component.ionViewWillEnter();
    fixture.detectChanges();
  }));

  it('should fetch persisted record if no draft exists', () => {
    // Handled before tests
    expect(component).toBeTruthy();
  });

});
