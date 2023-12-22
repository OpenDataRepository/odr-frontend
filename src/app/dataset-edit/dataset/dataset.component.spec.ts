import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { DatasetService } from 'src/app/api/dataset.service';

import { DatasetComponent } from './dataset.component';
import { of } from 'rxjs';
import { ApiService } from 'src/app/api/api.service';
import { PermissionService } from 'src/app/api/permission.service';
import { By } from '@angular/platform-browser';
import { DebugElement, SimpleChange, SimpleChanges } from '@angular/core';
import { PluginsService } from 'src/app/shared/plugins.service';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

describe('DatasetEditComponent', () => {
  let component: DatasetComponent;
  let fixture: ComponentFixture<DatasetComponent>;
  let modalController: ModalController;
  // let debugElement: DebugElement;
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
    hasPermission = () => {
      return of(true);
    }
  }

  class PluginsServiceMock {
  }

  let datasetService: any;

  let alertControllerSpy: any;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetComponent ],
      providers: [
        FormBuilder,
        { provide: DatasetService, useValue: datasetService },
        { provide: ApiService, useClass: ApiServiceMock },
        { provide: PermissionService, useClass: PermissionServiceMock },
        { provide: AlertController, useValue: alertControllerSpy },
        ModalController,
        { provide: PluginsService, useClass: PluginsServiceMock }
      ],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule,
        NgbCollapseModule
      ]
    }).compileComponents();

  }));

  it('should create', () => {
    fixture = TestBed.createComponent(DatasetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('saveDraft', () => {
    it('if saveDraft has no changes from last persisted, pass silently', (done: DoneFn) => {

      datasetService = jasmine.createSpyObj('DatasetService', ['updateDatasetAndTemplate', 'fetchLatestDatasetAndTemplate']);
      datasetService.updateDatasetAndTemplate.and.returnValue(of(null));
      datasetService.fetchLatestDatasetAndTemplate.and.returnValue(of({
        'dataset_uuid': 'dataset_uuid',
        'template_uuid': 'template_uuid',
        'template_id': 'template_id',
        'name': 'name',
        'fields': [],
        'related_datasets': [],
        template_plugins: {field_plugins: {}, object_plugins: {}},
        dataset_plugins:  {field_plugins: {}, object_plugins: {}}
      }));

      TestBed.overrideProvider(DatasetService, { useValue: datasetService });
      fixture = TestBed.createComponent(DatasetComponent);
      component = fixture.componentInstance;

      modalController = TestBed.inject(ModalController);
      createSpy = spyOn(modalController, 'create').and.returnValue(Promise.resolve({
        present: () => {},
        dismiss: () => {},
      } as unknown as HTMLIonModalElement));

      component.form = new FormGroup({
        name: new FormControl(),
        dataset_uuid: new FormControl(),
        template_uuid: new FormControl(),
        template_id: new FormControl(),
        fields: new FormArray([]),
        related_datasets: new FormArray([]),
        template_plugins: new FormControl({field_plugins: {}, object_plugins: {}}),
        dataset_plugins:  new FormControl({field_plugins: {}, object_plugins: {}})
      });
      fixture.detectChanges();
      expect(component).toBeTruthy();
      component.saveDraft().subscribe(() => done());
    })
  })

  describe('linkExistingDataset', () => {
    it('cannot link dataset that is already linked', async () => {
      datasetService = jasmine.createSpyObj('DatasetService', ['fetchLatestDatasetAndTemplate']);
      datasetService.fetchLatestDatasetAndTemplate.and.returnValue(of({
        'dataset_uuid': 'already_linked'
      }));
      alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
      const alertMock = { present: jasmine.createSpy('present') };
      alertControllerSpy.create.and.returnValue(Promise.resolve(alertMock as any));

      TestBed.overrideProvider(DatasetService, { useValue: datasetService });
      TestBed.overrideProvider(AlertController, { useValue: alertControllerSpy });
      fixture = TestBed.createComponent(DatasetComponent);
      component = fixture.componentInstance;

      component.form = new FormGroup({
        name: new FormControl(),
        dataset_uuid: new FormControl(),
        template_uuid: new FormControl(),
        template_id: new FormControl(),
        fields: new FormArray([]),
        related_datasets: new FormArray([
          new FormGroup({
            name: new FormControl(),
            dataset_uuid: new FormControl('already_linked'),
            template_uuid: new FormControl(),
            template_id: new FormControl(),
            fields: new FormArray([]),
            related_datasets: new FormArray([]),
            template_plugins: new FormControl({field_plugins: {}, object_plugins: {}}),
            dataset_plugins:  new FormControl({field_plugins: {}, object_plugins: {}})
          })
        ]),
        template_plugins: new FormControl({field_plugins: {}, object_plugins: {}}),
        dataset_plugins:  new FormControl({field_plugins: {}, object_plugins: {}})
      });
      fixture.detectChanges();
      expect(component).toBeTruthy();
      component.linkExistingDataset('already_linked');

      fixture.detectChanges();

      expect(alertControllerSpy.create).toHaveBeenCalled();

    });
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
