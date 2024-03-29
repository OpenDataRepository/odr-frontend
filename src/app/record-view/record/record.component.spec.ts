import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RecordComponent } from './record.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { PermissionService } from 'src/app/api/permission.service';
import { ApiService } from 'src/app/api/api.service';
import { PluginsService } from 'src/app/shared/plugins.service';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

describe('RecordViewComponent', () => {
  let component: RecordComponent;
  let fixture: ComponentFixture<RecordComponent>;

  class ActivatedRouteMock {
    snapshot = {
      paramMap: {
        get: (param: string) => {
          return param;
        }
      }
    }
  }

  class PermissionServiceMock {
    hasPermission = (uuid: string, permission: string ) => {
      return of(true);
    }
  }

  class ApiServiceMock {
  }

  class PluginsServiceMock {
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordComponent ],
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteMock },
        { provide: PermissionService, useClass: PermissionServiceMock },
        { provide: ApiService, useClass: ApiServiceMock },
        { provide: PluginsService, useClass: PluginsServiceMock }
      ],
      imports: [
        IonicModule.forRoot(),
        RouterModule,
        NgbCollapseModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
