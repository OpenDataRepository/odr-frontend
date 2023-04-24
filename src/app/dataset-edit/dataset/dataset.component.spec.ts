import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { DatasetService } from 'src/app/api/dataset.service';

import { DatasetComponent } from './dataset.component';
import { of } from 'rxjs';
import { ApiService } from 'src/app/api/api.service';
import { PermissionService } from 'src/app/api/permission.service';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('DatasetEditComponent', () => {
  let component: DatasetComponent;
  let fixture: ComponentFixture<DatasetComponent>;
  let modalController: ModalController;
  let debugElement: DebugElement;
  let createSpy: jasmine.Spy;

  class ApiServiceMock {
    userDatasets = () => {
      return of([]);
    }
    publicDatasets = () => {
      return of([]);
    }
  }

  class PermissionServiceMock {
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
        { provide: PermissionService, useClass: PermissionServiceMock },
        ModalController
      ],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    modalController = TestBed.inject(ModalController);
    createSpy = spyOn(modalController, 'create').and.returnValue(Promise.resolve({
      present: () => {},
      dismiss: () => {},
    } as unknown as HTMLIonModalElement));
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

  // describe('linkExistingDataset', () => {
  //   fit('modal appears if button is clicked', () => {
  //     component.form = new FormGroup({
  //       name: new FormControl(),
  //       updated_at: new FormControl((new Date()).toISOString()),
  //       dataset_uuid: new FormControl("uuid"),
  //       template_uuid: new FormControl(),
  //       template_id: new FormControl(),
  //       fields: new FormArray([]),
  //       related_datasets: new FormArray([]),
  //     });
  //     component.edit_permission = true;
  //     fixture.detectChanges();
  //     expect(component).toBeTruthy();
  //     // // const ion_modal = debugElement.query(By.css('ion-modal'));
  //     // let ion_modal = fixture.nativeElement.querySelector('ion-modal');
  //     // expect(ion_modal).toBeTruthy();
  //     // expect(fixture.nativeElement.querySelector('ion-header')).toBeNull();
  //     // // expect(ion_modal).not.toContain(document.querySelector('ng-template'));
  //     const button = document.getElementById('link-existing-dataset-uuid')
  //     button?.click();
  //     // // expect(ion_modal).toContain(document.querySelector('ng-template'));
  //     // expect(fixture.nativeElement.querySelector('ion-modal')).not.toBeNull();
  //     // ion_modal = fixture.nativeElement.querySelector('ion-modal');
  //     // expect(fixture.nativeElement.querySelector('ion-header')).not.toBeNull();

  //     fixture.whenStable().then(() => {
  //       expect(createSpy).toHaveBeenCalled();
  //       // expect(createSpy.calls.mostRecent().args[0].component).toEqual(MyModalComponent);
  //     });
  //   })
  // })

});
