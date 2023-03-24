import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { ApiService } from '../api/api.service';
import { RecordService } from '../api/record.service';

import { RecordViewPage } from './record-view.page';

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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordViewPage ],
      providers: [
        RecordViewPage,
        { provide: ActivatedRoute, useClass: ActivatedRouteMock },
        { provide: RecordService, useClass: RecordServiceMock },
        { provide: ApiService, useClass: ApiServiceMock },
      ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RecordViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
