import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/api/api.service';

import { RecordComponent } from './record.component';
import { of } from 'rxjs';

describe('RecordEditComponent', () => {
  let component: RecordComponent;
  let fixture: ComponentFixture<RecordComponent>;

  class FormBuilderMock {
  }

  const apiService = jasmine.createSpyObj('ApiService', ['updateRecord', 'fetchRecordLatestPersisted']);
  apiService.updateRecord.and.returnValue(of({'record': null}));
  apiService.fetchRecordLatestPersisted.and.returnValue(of({
    'uuid': 'uuid',
    'dataset_uuid': 'dataset_uuid',
    'fields': [],
    'related_records': []
  }));
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordComponent ],
      providers: [
        RecordComponent,
        { provide: FormBuilder, useClass: FormBuilderMock },
        { provide: ApiService, useValue: apiService },
      ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RecordComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('Draft is deleted -> persisted goes to form', () => {
    fixture.detectChanges();
    component.saveDraft().subscribe();

  });
});
