import { Component, DebugElement, Input, SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { lastValueFrom, of } from 'rxjs';
import { DatasetService } from '../api/dataset.service';

import { DatasetEditPage } from './dataset-edit.page';
import { DatasetComponent } from './dataset/dataset.component';
import { ApiService } from '../api/api.service';
import { PermissionService } from '../api/permission.service';
import { PluginsService } from '../shared/plugins.service';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { By } from '@angular/platform-browser';
import { FieldComponent } from './field/field.component';

describe('DatasetEditPage', () => {
  let dataset_page_component: DatasetEditPage;
  let dataset_page_fixture: ComponentFixture<DatasetEditPage>;
  let dataset_fixture: ComponentFixture<DatasetComponent>;
  let dataset_component: DatasetComponent;

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
  }

  class PermissionServiceMock {
    hasPermission = (uuid: string, permission: string ) => {
      return of(true);
    }
  }

  class PluginsServiceMock {
  }

  @Component({
    selector: 'app-header',
    template: '<p>Mock App header</p>'
  })
  class MockAppHeader {}

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        DatasetEditPage,
        DatasetComponent,
        MockAppHeader,
        FieldComponent
      ],
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteMock },
        { provide: DatasetService, useClass: DatasetServiceMock },
        { provide: ApiService, useClass: ApiServiceMock },
        FormBuilder,
        { provide: PermissionService, useClass: PermissionServiceMock },
        { provide: PluginsService, useClass: PluginsServiceMock }
      ],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule,
        NgbCollapseModule,
        CommonModule
      ]
    }).compileComponents();
  }));

  const setUpComponentAndFixture = () => {
    dataset_fixture = TestBed.createComponent(DatasetComponent);
    dataset_component = dataset_fixture.componentInstance;
    // const datasetEditComponent = new DatasetComponent(new FormBuilder(), new DatasetService("s"));
    dataset_page_fixture = TestBed.createComponent(DatasetEditPage);
    dataset_page_component = dataset_page_fixture.componentInstance;
    dataset_page_component.dataset_component = dataset_component;
    dataset_page_component.ionViewWillEnter();
    dataset_page_fixture.detectChanges();

    expect(dataset_component).toBeTruthy();
    expect(dataset_page_component).toBeTruthy();
  };

  it('should create', () => {
    setUpComponentAndFixture();
    expect(dataset_page_component).toBeTruthy();
  });

  describe('gridstack', () => {

    let gridstack: DebugElement;

    const setUpGridStack = (new_form?: FormGroup) => {
      expect(dataset_component.gridComp).toBeFalsy();

      if(!new_form) {
        new_form = new FormGroup({
          name: new FormControl(),
          dataset_uuid: new FormControl(),
          template_uuid: new FormControl("t_uuid"),
          template_id: new FormControl(),
          updated_at: new FormControl('2020-01-01T00:00:00.000000Z'),
          fields: new FormArray([]),
          related_datasets: new FormArray([]),
          template_plugins: new FormControl({field_plugins: {}, object_plugins: {}}),
          dataset_plugins:  new FormControl({field_plugins: {}, object_plugins: {}})
        });
      }

      const changes: SimpleChanges = {
        form: new SimpleChange(dataset_component.form, new_form, false),
      };
      dataset_component.form = new_form;
      dataset_component.edit_permission = true;

      dataset_fixture.detectChanges();

      expect(dataset_component.grid_container).toBeDefined();

      dataset_component.ngOnChanges(changes);

      expect(dataset_component.gridComp).toBeTruthy();

      gridstack = dataset_fixture.debugElement.query(By.css('.grid-stack'));
      expect(gridstack).toBeTruthy();
    };

    it('can add the gridstack to the page and it exists', () => {
      setUpComponentAndFixture();
      expect(dataset_component.gridComp).toBeFalsy();

      let new_form = new FormGroup({
        name: new FormControl(),
        dataset_uuid: new FormControl(),
        template_uuid: new FormControl("t_uuid"),
        template_id: new FormControl(),
        updated_at: new FormControl('2020-01-01T00:00:00.000000Z'),
        fields: new FormArray([]),
        related_datasets: new FormArray([]),
        template_plugins: new FormControl({field_plugins: {}, object_plugins: {}}),
        dataset_plugins:  new FormControl({field_plugins: {}, object_plugins: {}})
      });

      const changes: SimpleChanges = {
        form: new SimpleChange(dataset_component.form, new_form, false),
      };
      dataset_component.form = new_form;
      dataset_component.edit_permission = true;

      dataset_fixture.detectChanges();

      expect(dataset_component.grid_container).toBeDefined();

      dataset_component.ngOnChanges(changes);

      expect(dataset_component.gridComp).toBeTruthy();

      const gridstack = dataset_fixture.debugElement.query(By.css('.grid-stack'));
      expect(gridstack).toBeTruthy();
    });

    // I can add a field via the button, and it exists in the fields and on the grid, and they are synced
    it('can add a field/widget to gridstack via the button', () => {

      const apiServiceSpy = jasmine.createSpyObj('ApiService', ['createTemplateField']);
      let return_template_field = {
        uuid: "t_uuid",
        _id: "t_id",
        name: "",
        updated_at: (new Date()).toISOString()
      };
      apiServiceSpy.createTemplateField.and.returnValue(of(return_template_field));
      TestBed.overrideProvider(ApiService, { useValue: apiServiceSpy });
      setUpComponentAndFixture();
      setUpGridStack();

      const button = dataset_fixture.nativeElement.querySelector('#add_field');
      button.click();

      dataset_fixture.detectChanges();

      // Item was added to the grid
      const gridstack_item = gridstack.nativeElement.querySelector('.grid-stack-item');
      expect(gridstack_item).toBeTruthy();

      // Field was added to the form
      let fields = dataset_component.fields_form_array;
      expect(fields.length).toEqual(1);
      let field_form = fields.at(0);
      expect(field_form.value.uuid).toEqual(return_template_field.uuid);

      // Item on grid and field in the form are synced in field_element_to_form_map
      let field_element_to_form_map = dataset_component.form.get('field_element_to_form_map')?.value;
      expect(field_element_to_form_map).toBeTruthy();
      let field_map_value = field_element_to_form_map?.get(gridstack_item);
      expect(field_map_value).toBe(field_form);
    });

    // I can remove a field via the button, and it exists in neither place
    it('can remove a field/widget from gridstack via the button', () => {
      const apiServiceSpy = jasmine.createSpyObj('ApiService', ['createTemplateField']);
      let return_template_field = {
        uuid: "t_uuid",
        _id: "t_id",
        name: "",
        updated_at: (new Date()).toISOString()
      };
      apiServiceSpy.createTemplateField.and.returnValue(of(return_template_field));
      TestBed.overrideProvider(ApiService, { useValue: apiServiceSpy });
      setUpComponentAndFixture();
      setUpGridStack();

      const button = dataset_fixture.nativeElement.querySelector('#add_field');
      button.click();

      dataset_fixture.detectChanges();

      // Item was added to the grid
      const gridstack_item = gridstack.nativeElement.querySelector('.grid-stack-item');
      expect(gridstack_item).toBeTruthy();

      // Field was added to the form
      let fields = dataset_component.fields_form_array;
      expect(fields.length).toEqual(1);
      let field_form = fields.at(0);
      expect(field_form.value.uuid).toEqual(return_template_field.uuid);

      // Item on grid and field in the form are synced in field_element_to_form_map
      let field_element_to_form_map = dataset_component.form.get('field_element_to_form_map')?.value;
      expect(field_element_to_form_map).toBeTruthy();
      let field_map_value = field_element_to_form_map?.get(gridstack_item);
      expect(field_map_value).toBe(field_form);

      // Remove the field
      const remove_button = gridstack_item.querySelector('ion-button[color="danger"]');
      remove_button.click();

      dataset_fixture.detectChanges();

      // Item was removed from the grid
      const gridstack_item_removed = gridstack.nativeElement.querySelector('.grid-stack-item');
      expect(gridstack_item_removed).toBeFalsy();

      // Field was removed from the form
      fields = dataset_component.fields_form_array;
      expect(fields.length).toEqual(0);

    });

    // I can add a field group
    it('can add a field group to gridstack via the button', () => {

      const apiServiceSpy = jasmine.createSpyObj('ApiService', ['createTemplateField']);
      let return_template_field = {
        uuid: "t_uuid",
        _id: "t_id",
        name: "",
        updated_at: (new Date()).toISOString()
      };
      apiServiceSpy.createTemplateField.and.returnValue(of(return_template_field));
      TestBed.overrideProvider(ApiService, { useValue: apiServiceSpy });
      setUpComponentAndFixture();
      setUpGridStack();

      const button = dataset_fixture.nativeElement.querySelector('#add_field_group');
      button.click();

      dataset_fixture.detectChanges();

      // Item was added to the grid
      const gridstack_item = gridstack.nativeElement.querySelector('.grid-stack-item');
      expect(gridstack_item).toBeTruthy();
      const nested_grid = gridstack_item.querySelector('.grid-stack');
      expect(nested_grid).toBeTruthy();

    });

    // I can save a dataset, and the fields and field groups are still there exactly as saved when loaded
    it('can save a dataset, and the fields and field groups are still there exactly as saved when loaded', async () => {

      const apiServiceSpy = jasmine.createSpyObj('ApiService', ['createTemplateField']);
      let return_template_field = {
        uuid: "t_uuid",
        _id: "t_id",
        name: "",
        updated_at: (new Date()).toISOString()
      };
      apiServiceSpy.createTemplateField.and.returnValue(of(return_template_field));
      TestBed.overrideProvider(ApiService, { useValue: apiServiceSpy });
      const datasetServiceSpy = jasmine.createSpyObj('DatasetService', ['updateDatasetAndTemplate', 'fetchLatestDatasetAndTemplate']);
      datasetServiceSpy.updateDatasetAndTemplate.and.returnValue(of(null));
      let last_saved_data;
      datasetServiceSpy.fetchLatestDatasetAndTemplate.and.callFake(() => {
        let last_update_call = datasetServiceSpy.updateDatasetAndTemplate.calls.mostRecent();
        const data = last_update_call ? last_update_call.args[0] : {};
        last_saved_data = data;
        last_saved_data.public_date = (new Date()).toISOString();
        return of(data);
      });
      TestBed.overrideProvider(ApiService, { useValue: apiServiceSpy });
      TestBed.overrideProvider(DatasetService, { useValue: datasetServiceSpy });
      setUpComponentAndFixture();
      setUpGridStack();

      const add_field_button = dataset_fixture.nativeElement.querySelector('#add_field');
      add_field_button.click();
      const add_field_group_button = dataset_fixture.nativeElement.querySelector('#add_field_group');
      add_field_group_button.click();

      dataset_fixture.detectChanges();

      // Item was added to the grid
      const gridstack_item = gridstack.nativeElement.querySelector('.grid-stack-item');
      expect(gridstack_item).toBeTruthy();

      // Nested grid was added to the grid
      const nested_gridstack = gridstack.nativeElement.querySelector('.grid-stack');
      expect(nested_gridstack).toBeTruthy();

      // Save the dataset
      await lastValueFrom(dataset_component.saveDraft());

      // Rebuild the dataset_component  with the form
      setUpComponentAndFixture();
      setUpGridStack(dataset_component.convertDatasetObjectToForm(last_saved_data));

      // Item was added to the grid
      const gridstack_item_after_save = gridstack.nativeElement.querySelector('.grid-stack-item');
      expect(gridstack_item_after_save).toBeTruthy();

      // Field in form and on grid match
      let fields = dataset_component.fields_form_array;
      expect(fields.length).toEqual(1);
      let field_form = fields.at(0);
      let field_element_to_form_map = dataset_component.form.get('field_element_to_form_map')?.value;
      expect(field_element_to_form_map).toBeTruthy();
      let field_map_value = field_element_to_form_map?.get(gridstack_item_after_save);
      expect(field_map_value).toBe(field_form);

      const nested_gridstack_after_save = gridstack.nativeElement.querySelector('.grid-stack');
      expect(nested_gridstack_after_save).toBeTruthy();

      // delay end of test for a bit to let gridstack do its thing
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // I can link a related dataset, add a couple things, and save it just the same
    // it('can link a related dataset, add a couple things, and save it just the same', async () => {

    //   const apiServiceSpy = jasmine.createSpyObj('ApiService', ['createTemplateField']);
    //   let return_template_field = {
    //     uuid: "r_t_uuid",
    //     _id: "r_t_id",
    //     name: "",
    //     updated_at: (new Date()).toISOString()
    //   };
    //   apiServiceSpy.createTemplateField.and.returnValue(of(return_template_field));
    //   TestBed.overrideProvider(ApiService, { useValue: apiServiceSpy });
    //   const datasetServiceSpy = jasmine.createSpyObj('DatasetService', ['updateDatasetAndTemplate', 'fetchLatestDatasetAndTemplate']);
    //   datasetServiceSpy.updateDatasetAndTemplate.and.returnValue(of(null));
    //   let last_saved_data;
    //   // TODO: problem. The form is set both by ionViewWillEnter and ngOnChanges.
    //   // This test is copied from the last one. I need to change the starting data to have a field and nested grid, and then add a related dataset and add stuff to it
    //   datasetServiceSpy.fetchLatestDatasetAndTemplate.and.callFake(() => {
    //     let last_update_call = datasetServiceSpy.updateDatasetAndTemplate.calls.mostRecent();
    //     const data = last_update_call ? last_update_call.args[0] : {};
    //     last_saved_data = data;
    //     last_saved_data.public_date = (new Date()).toISOString();
    //     return of(data);
    //   });
    //   TestBed.overrideProvider(ApiService, { useValue: apiServiceSpy });
    //   TestBed.overrideProvider(DatasetService, { useValue: datasetServiceSpy });
    //   setUpComponentAndFixture();
    //   setUpGridStack();

    //   const add_field_button = dataset_fixture.nativeElement.querySelector('#add_field');
    //   add_field_button.click();
    //   const add_field_group_button = dataset_fixture.nativeElement.querySelector('#add_field_group');
    //   add_field_group_button.click();

    //   dataset_fixture.detectChanges();

    //   // Item was added to the grid
    //   const gridstack_item = gridstack.nativeElement.querySelector('.grid-stack-item');
    //   expect(gridstack_item).toBeTruthy();

    //   // Nested grid was added to the grid
    //   const nested_gridstack = gridstack.nativeElement.querySelector('.grid-stack');
    //   expect(nested_gridstack).toBeTruthy();

    //   // Save the dataset
    //   await lastValueFrom(dataset_component.saveDraft());

    //   // Rebuild the dataset_component  with the form
    //   setUpComponentAndFixture();
    //   setUpGridStack(dataset_component.convertDatasetObjectToForm(last_saved_data));

    //   // Item was added to the grid
    //   const gridstack_item_after_save = gridstack.nativeElement.querySelector('.grid-stack-item');
    //   expect(gridstack_item_after_save).toBeTruthy();

    //   // Field in form and on grid match
    //   let fields = dataset_component.fields_form_array;
    //   expect(fields.length).toEqual(1);
    //   let field_form = fields.at(0);
    //   let field_element_to_form_map = dataset_component.form.get('field_element_to_form_map')?.value;
    //   expect(field_element_to_form_map).toBeTruthy();
    //   let field_map_value = field_element_to_form_map?.get(gridstack_item_after_save);
    //   expect(field_map_value).toBe(field_form);

    //   const nested_gridstack_after_save = gridstack.nativeElement.querySelector('.grid-stack');
    //   expect(nested_gridstack_after_save).toBeTruthy();

    //   // delay end of test for a bit to let gridstack do its thing
    //   await new Promise(resolve => setTimeout(resolve, 10));
    // });


    // TODO: add the following tests (if possible):
    // 4. I can remove a field via drag, and it exists in neither place
    // 6. I can remove a field group
    // 7. I can drag a field to a field group, and it still exists on the form
    // 8. I can drag a field out of a field group, and it still exists on the form
    // 9. I can delete a field group via drag, and all of it's fields are removed from the form

    // 12. I can't move fields or field groups between datasets

    // I can add a field via drag and drop, and it exists in the fields and on the grid, and they are synced
    // it('can add a field/widget to gridstack via drag and drop', () => {
    //   const apiServiceSpy = jasmine.createSpyObj('ApiService', ['createTemplateField']);
    //   let return_template_field = {
    //     uuid: "t_uuid",
    //     _id: "t_id",
    //     name: "",
    //     updated_at: (new Date()).toISOString()
    //   };
    //   apiServiceSpy.createTemplateField.and.returnValue(of(return_template_field));
    //   TestBed.overrideProvider(ApiService, { useValue: apiServiceSpy });
    //   setUpComponentAndFixture();
    //   setUpGridStack();

    //   // Move this test to the dataset page
    //   const sidebar = dataset_page_fixture.nativeElement.querySelector('.sidebar');
    //   const item = sidebar.querySelector('.grid-stack-item');
    //   item.dispatchEvent(new DragEvent('dragstart'));
    //   gridstack.nativeElement.dispatchEvent(new DragEvent('drop', { dataTransfer: new DataTransfer() }));
    //   dataset_fixture.detectChanges();

    //   // Item was added to the grid
    //   const gridstack_item = gridstack.nativeElement.querySelector('.grid-stack-item');
    //   expect(gridstack_item).toBeTruthy();

    //   // Field was added to the form
    //   let fields = dataset_component.fields_form_array;
    //   expect(fields.length).toEqual(1);
    //   let field_form = fields.at(0);
    //   expect(field_form.value.uuid).toEqual(return_template_field.uuid);

    //   // Item on grid and field in the form are synced in field_element_to_form_map
    //   let field_element_to_form_map = dataset_component.form.get('field_element_to_form_map')?.value;
    //   expect(field_element_to_form_map).toBeTruthy();
    //   let field_map_value = field_element_to_form_map?.get(gridstack_item);
    //   expect(field_map_value).toBe(field_form);
    // });
  })
});
