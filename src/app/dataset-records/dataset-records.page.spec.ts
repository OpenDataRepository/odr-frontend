import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { ApiService } from '../api/api.service';

import { DatasetRecordsPage } from './dataset-records.page';

describe('DatasetRecordsPage', () => {
  let component: DatasetRecordsPage;
  let fixture: ComponentFixture<DatasetRecordsPage>;

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
    datasetRecords = () => {
      return of([]);
    }
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetRecordsPage ],
      providers: [
        DatasetRecordsPage,
        { provide: ActivatedRoute, useClass: ActivatedRouteMock },
        { provide: ApiService, useClass: ApiServiceMock },
      ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetRecordsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
