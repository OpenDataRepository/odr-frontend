import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { ApiService } from '../api/api.service';
import { RecordService } from '../api/record.service';

import { RecordViewPage } from './record-view.page';
import { Component } from '@angular/core';
import { RecordComponent } from './record/record.component';

describe('RecordViewPage', () => {
  let component: RecordViewPage;
  let fixture: ComponentFixture<RecordViewPage>;

  class ActivatedRouteMock {
    snapshot = {
      paramMap: {
        get: (param: string) => {
          return param;
        }
      }
    }
  }

  class RecordServiceMock {
    fetchLatestRecord = () => {
      return of({
        uuid: "uuid",
        _id: "_id",
        dataset_uuid: "d_uuid",
        updated_at: (new Date()).toISOString(),
        persist_date: undefined,
        fields: [],
        related_records: []
      });
    }
  }

  class ApiServiceMock {
    fetchDatasetLatestPersisted = () => {
      return throwError(() => new Error());
    }
  }

  @Component({
    selector: 'app-header',
    template: '<p>Mock App header</p>'
  })
  class MockAppHeader {}

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        RecordViewPage,
        RecordComponent,
        MockAppHeader
      ],
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteMock },
        { provide: RecordService, useClass: RecordServiceMock },
        { provide: ApiService, useClass: ApiServiceMock },
      ],
      imports: [
        IonicModule.forRoot(),
        RouterModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecordViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
