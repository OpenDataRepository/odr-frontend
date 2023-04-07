import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DatasetService } from 'src/app/api/dataset.service';

import { DatasetComponent } from './dataset.component';
import { of } from 'rxjs';

describe('DatasetEditComponent', () => {
  let component: DatasetComponent;
  let fixture: ComponentFixture<DatasetComponent>;

  class FormBuilderMock {
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
        DatasetComponent,
        { provide: FormBuilder, useClass: FormBuilderMock },
        { provide: DatasetService, useValue: datasetService },
      ],
      imports: [IonicModule.forRoot()]
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
      fixture.detectChanges();
      expect(component).toBeTruthy();
      component.saveDraft().subscribe();
    })
  })

});
