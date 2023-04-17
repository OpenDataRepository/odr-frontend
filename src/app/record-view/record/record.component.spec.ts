import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RecordComponent } from './record.component';
import { ActivatedRoute, RouterModule } from '@angular/router';

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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordComponent ],
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteMock },
      ],
      imports: [
        IonicModule.forRoot(),
        RouterModule
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
