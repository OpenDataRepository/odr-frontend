import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { ApiService } from '../api/api.service';
import { DatasetService } from '../api/dataset.service';

import { DatasetViewPage } from './dataset-view.page';
import { AuthService } from '../auth.service';
import { PermissionService } from '../api/permission.service';

describe('DatasetViewPage', () => {
  let component: DatasetViewPage;
  let fixture: ComponentFixture<DatasetViewPage>;

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
    fetchDatasetLatestPersisted = () => {
      return throwError(() => new Error());
    }
  }

  class PermissionServiceMock {
    hasPermission = () => {
      return of(false);
    }
  }

  class AuthServiceMock {
  }

  @Component({
    selector: 'app-header',
    template: '<p>Mock App header</p>'
  })
  class MockAppHeader {}

  @Component({selector: 'dataset-view', template: ''})
  class DatasetViewStubComponent {
    @Input()
    dataset: any;
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        DatasetViewPage,
        MockAppHeader,
        DatasetViewStubComponent
      ],
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteMock },
        { provide: DatasetService, useClass: DatasetServiceMock },
        { provide: ApiService, useClass: ApiServiceMock },
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: PermissionService, useClass: PermissionServiceMock },
      ],
      imports: [
        IonicModule.forRoot(),
        RouterModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
