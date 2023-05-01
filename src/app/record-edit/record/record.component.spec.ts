import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/api/api.service';

import { RecordComponent } from './record.component';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';

describe('RecordEditComponent', () => {
  let component: RecordComponent;
  let fixture: ComponentFixture<RecordComponent>;

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
        FormBuilder,
        { provide: ApiService, useValue: apiService },
      ],
      imports: [
        IonicModule.forRoot(),
        RouterModule,
        ReactiveFormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecordComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('Draft is deleted -> persisted goes to form', (done: DoneFn) => {
    component.form = new FormGroup({
      uuid: new FormControl(),
      dataset_uuid: new FormControl(),
      fields: new FormArray([]),
      related_records: new FormArray([]),
      dataset: new FormGroup({
        uuid: new FormControl(),
        related_datasets: new FormArray([])
      })
    });
    fixture.detectChanges();
    component.saveDraft().subscribe(() => {done();});

  });
});
