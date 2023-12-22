import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { ApiService } from '../api/api.service';

import { DatasetRecordsPage } from './dataset-records.page';
import { HeaderModule } from '../header/header.module';
import { AuthService } from '../auth.service';
import { Component } from '@angular/core';

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

  class AuthServiceMock {
  }

  @Component({
    selector: 'app-header',
    template: '<p>Mock App header</p>'
  })
  class MockAppHeader {}

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        DatasetRecordsPage,
        MockAppHeader
      ],
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteMock },
        { provide: ApiService, useClass: ApiServiceMock },
        { provide: AuthService, useClass: AuthServiceMock },
      ],
      imports: [
        IonicModule.forRoot(),
        RouterModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetRecordsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
