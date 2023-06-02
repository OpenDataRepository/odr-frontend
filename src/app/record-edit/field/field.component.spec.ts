import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FieldComponent } from './field.component';
import { of } from 'rxjs';
import { PermissionService } from 'src/app/api/permission.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'src/app/api/api.service';

describe('RecordEditFieldComponent', () => {
  let component: FieldComponent;
  let fixture: ComponentFixture<FieldComponent>;

  class PermissionServiceMock {
    hasPermission = (uuid: string, permission: string ) => {
      return of(true);
    }
  }

  class ApiServiceMock {
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldComponent ],
      providers: [
        { provide: PermissionService, useClass: PermissionServiceMock },
        { provide: ApiService, useClass: ApiServiceMock }
      ],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
