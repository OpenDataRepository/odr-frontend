import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { ApiService } from '../api/api.service';

import { RecordEditPage } from './record-edit.page';
import { RecordComponent } from './record/record.component';

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
    fetchRecordDraft = () => {
      return of({
        dataset_uuid: "d_uuid",
        _id: "_id",
        uuid: "r_uuid",
        updated_at: (new Date()).toISOString(),
        persist_date: undefined,
        fields: [],
        related_records: []
      });
    };
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
        RecordEditPage,
        RecordComponent,
        { provide: ActivatedRoute, useClass: ActivatedRouteMock },
        { provide: ApiService, useClass: ApiServiceMock },
        FormBuilder
      ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    let sub_fixture = TestBed.createComponent(RecordComponent);
    let sub_component = sub_fixture.componentInstance;

    fixture = TestBed.createComponent(RecordEditPage);
    component = fixture.componentInstance;
    component.record_component = sub_component;
    component.ionViewWillEnter();
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
