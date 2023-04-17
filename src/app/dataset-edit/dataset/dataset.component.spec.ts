import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DatasetService } from 'src/app/api/dataset.service';

import { DatasetComponent } from './dataset.component';
import { of } from 'rxjs';
import { ApiService } from 'src/app/api/api.service';

describe('DatasetEditComponent', () => {
  let component: DatasetComponent;
  let fixture: ComponentFixture<DatasetComponent>;

  class ApiServiceMock {
  }

  const datasetService = jasmine.createSpyObj('DatasetService', ['updateDatasetAndTemplate', 'fetchLatestDatasetAndTemplate']);
  datasetService.updateDatasetAndTemplate.and.returnValue(of(null));
  datasetService.fetchLatestDatasetAndTemplate.and.returnValue(of({
    'dataset_uuid': 'dataset_uuid',
    'template_uuid': 'template_uuid',
    'template_id': 'template_id',
    'name': 'name',
    'fields': [],
    'related_datasets': []
  }));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetComponent ],
      providers: [
        FormBuilder,
        { provide: DatasetService, useValue: datasetService },
        { provide: ApiService, useClass: ApiServiceMock },
        FormBuilder
      ],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('saveDraft', () => {
    it('if saveDraft has no changes from last persisted, pass silently', () => {
      component.form = new FormGroup({
        name: new FormControl(),
        dataset_uuid: new FormControl(),
        template_uuid: new FormControl(),
        template_id: new FormControl(),
        fields: new FormArray([]),
        related_datasets: new FormArray([]),
      });
      fixture.detectChanges();
      expect(component).toBeTruthy();
      component.saveDraft().subscribe();
    })
  })

});
