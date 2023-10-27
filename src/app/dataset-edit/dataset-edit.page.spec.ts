import { Component, DebugElement, Input, SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick, waitForAsync } from '@angular/core/testing';
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
  let dataset_component: DatasetComponent;
  let dataset_component_debug_element: DebugElement;

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
        public_date: (new Date()).toISOString(),  // Needed for gridstack since it's behind the may_view ngIf
        fields: [],
        related_datasets: []
      });
    }
  }

  class ApiServiceMock {
    createTemplateField = () => {
      return of({
        uuid: "f_uuid",
        _id: "f_id",
        name: "",
        updated_at: (new Date()).toISOString()
      });
    }
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
    // const datasetEditComponent = new DatasetComponent(new FormBuilder(), new DatasetService("s"));
    dataset_page_fixture = TestBed.createComponent(DatasetEditPage);
    dataset_page_component = dataset_page_fixture.componentInstance;
    dataset_page_component.ionViewWillEnter();
    dataset_page_fixture.detectChanges();

    dataset_component_debug_element = dataset_page_fixture.debugElement.query(By.directive(DatasetComponent));
    dataset_component = dataset_component_debug_element.componentInstance;

    expect(dataset_component).toBeTruthy();
    expect(dataset_page_component).toBeTruthy();

    // Useful in the gridstack testing section, but also generally a good default setting
    dataset_component.edit_permission = true;
    dataset_page_fixture.detectChanges();
  };

  it('should create', () => {
    setUpComponentAndFixture();
    expect(dataset_page_component).toBeTruthy();
  });

  describe('gridstack', () => {

    const getGridstack = () => {
      return dataset_component_debug_element.query(By.css('.grid-stack'));
    }

    it('can add the gridstack to the page and it exists', () => {
      setUpComponentAndFixture();
      expect(dataset_component.gridComp).toBeTruthy();
      const gridstack = dataset_component_debug_element.query(By.css('.grid-stack'));
      expect(gridstack).toBeTruthy();
    });

    // I can add a field via the button, and it exists in the fields and on the grid, and they are synced
    it('can add a field/widget to gridstack via the button', () => {
      setUpComponentAndFixture();
      const button = dataset_component_debug_element.nativeElement.querySelector('#add_field');
      button.click();

      dataset_page_fixture.detectChanges();

      // Item was added to the grid
      const gridstack_item = getGridstack().nativeElement.querySelector('.grid-stack-item');
      expect(gridstack_item).toBeTruthy();

      // Field was added to the form
      let fields = dataset_component.fields_form_array;
      expect(fields.length).toEqual(1);
      let field_form = fields.at(0);
      expect(field_form.value.uuid).toEqual("f_uuid");

      // Item on grid and field in the form are synced in field_element_to_form_map
      let field_element_to_form_map = dataset_component.form.get('field_element_to_form_map')?.value;
      expect(field_element_to_form_map).toBeTruthy();
      let field_map_value = field_element_to_form_map?.get(gridstack_item);
      expect(field_map_value).toBe(field_form);
    });

    // I can remove a field via the button, and it exists in neither place
    it('can remove a field/widget from gridstack via the button', () => {
      setUpComponentAndFixture();

      const button = dataset_component_debug_element.nativeElement.querySelector('#add_field');
      button.click();

      dataset_page_fixture.detectChanges();

      // Item was added to the grid
      const gridstack_item = getGridstack().nativeElement.querySelector('.grid-stack-item');
      expect(gridstack_item).toBeTruthy();

      // Field was added to the form
      let fields = dataset_component.fields_form_array;
      expect(fields.length).toEqual(1);
      let field_form = fields.at(0);
      expect(field_form.value.uuid).toEqual("f_uuid");

      // Item on grid and field in the form are synced in field_element_to_form_map
      let field_element_to_form_map = dataset_component.form.get('field_element_to_form_map')?.value;
      expect(field_element_to_form_map).toBeTruthy();
      let field_map_value = field_element_to_form_map?.get(gridstack_item);
      expect(field_map_value).toBe(field_form);

      // Remove the field
      const remove_button = gridstack_item.querySelector('ion-button[color="danger"]');
      remove_button.click();

      dataset_page_fixture.detectChanges();

      // Item was removed from the grid
      const gridstack_item_removed = getGridstack().nativeElement.querySelector('.grid-stack-item');
      expect(gridstack_item_removed).toBeFalsy();

      // Field was removed from the form
      fields = dataset_component.fields_form_array;
      expect(fields.length).toEqual(0);

    });

    // I can add a field group
    it('can add a field group to gridstack via the button', () => {

      setUpComponentAndFixture();

      const button = dataset_component_debug_element.nativeElement.querySelector('#add_field_group');
      button.click();

      dataset_page_fixture.detectChanges();

      // Item was added to the grid
      const gridstack_item = getGridstack().nativeElement.querySelector('.grid-stack-item');
      expect(gridstack_item).toBeTruthy();
      const nested_grid = gridstack_item.querySelector('.grid-stack');
      expect(nested_grid).toBeTruthy();

    });

    // I can save a dataset, and the fields and field groups are still there exactly as saved when loaded
    it('can save a dataset, and the fields and field groups are still there exactly as saved when loaded', async () => {

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
      TestBed.overrideProvider(DatasetService, { useValue: datasetServiceSpy });
      setUpComponentAndFixture();

      const add_field_button = dataset_component_debug_element.nativeElement.querySelector('#add_field');
      add_field_button.click();
      const add_field_group_button = dataset_component_debug_element.nativeElement.querySelector('#add_field_group');
      add_field_group_button.click();

      dataset_page_fixture.detectChanges();

      // Item was added to the grid
      const gridstack_item = getGridstack().nativeElement.querySelector('.grid-stack-item');
      expect(gridstack_item).toBeTruthy();

      // Nested grid was added to the grid
      const nested_gridstack = getGridstack().nativeElement.querySelector('.grid-stack');
      expect(nested_gridstack).toBeTruthy();

      // Save the dataset
      await lastValueFrom(dataset_component.saveDraft());

      // Rebuild the dataset_component  with the form
      setUpComponentAndFixture();
      dataset_page_component.form = dataset_component.convertDatasetObjectToForm(last_saved_data);
      dataset_page_fixture.detectChanges();

      // Item was added to the grid
      const gridstack_item_after_save = getGridstack().nativeElement.querySelector('.grid-stack-item');
      expect(gridstack_item_after_save).toBeTruthy();

      // Field in form and on grid match
      let fields = dataset_component.fields_form_array;
      expect(fields.length).toEqual(1);
      let field_form = fields.at(0);
      let field_element_to_form_map = dataset_component.form.get('field_element_to_form_map')?.value;
      expect(field_element_to_form_map).toBeTruthy();
      let field_map_value = field_element_to_form_map?.get(gridstack_item_after_save);
      expect(field_map_value).toBe(field_form);

      const nested_gridstack_after_save = getGridstack().nativeElement.querySelector('.grid-stack');
      expect(nested_gridstack_after_save).toBeTruthy();
    });

    // I can link a related dataset, add a couple things, and save it just the same
    it('can link a related dataset, add a couple things, and save it just the same', async () => {

      const datasetServiceSpy = jasmine.createSpyObj('DatasetService', ['updateDatasetAndTemplate', 'fetchLatestDatasetAndTemplate', 'newEmptyDatasetAndTemplate']);
      datasetServiceSpy.updateDatasetAndTemplate.and.returnValue(of(null));
      let last_saved_data;
      datasetServiceSpy.fetchLatestDatasetAndTemplate.and.callFake(() => {
        let last_update_call = datasetServiceSpy.updateDatasetAndTemplate.calls.mostRecent();
        const data = last_update_call ? last_update_call.args[0] : {updated_at: (new Date()).toISOString(), related_datasets: []};
        last_saved_data = data;
        last_saved_data.public_date = (new Date()).toISOString();
        if(last_saved_data.related_datasets.length > 0) {
          // this needed for gridstack on related child.
          last_saved_data.related_datasets[0].public_date = (new Date()).toISOString();
        }
        return of(data);
      });
      datasetServiceSpy.newEmptyDatasetAndTemplate.and.returnValue(of({
        dataset_uuid: "rd_uuid",
        dataset_id: "rd_id",
        template_uuid: "rt_uuid",
        template_id: "rt_id",
        name: "name",
        dataset_updated_at: (new Date()).toISOString(),
        template_updated_at: (new Date()).toISOString(),
        dataset_persist_date: undefined,
        updated_at: (new Date()).toISOString(),
        public_date: (new Date()).toISOString(),  // Needed for gridstack since it's behind the may_view ngIf
        fields: [],
        related_datasets: []
      }));
      TestBed.overrideProvider(DatasetService, { useValue: datasetServiceSpy });
      setUpComponentAndFixture();

      expect(getGridstack()).toBeTruthy();

      const add_field_button = dataset_component_debug_element.nativeElement.querySelector('#add_field');
      add_field_button.click();
      const add_field_group_button = dataset_component_debug_element.nativeElement.querySelector('#add_field_group');
      add_field_group_button.click();

      dataset_page_fixture.detectChanges();

      // Item was added to the grid
      const gridstack_item = getGridstack().nativeElement.querySelector('.grid-stack-item');
      expect(gridstack_item).toBeTruthy();

      // Nested grid was added to the grid
      const nested_gridstack = getGridstack().nativeElement.querySelector('.grid-stack');
      expect(nested_gridstack).toBeTruthy();

      // Add a related dataset
      const add_related_dataset_button = dataset_component_debug_element.nativeElement.querySelector('#add_related_dataset');
      add_related_dataset_button.click();
      dataset_page_fixture.detectChanges();

      // Add item and nested grid to related datset
      let related_dataset_debug_element = dataset_component_debug_element.query(By.directive(DatasetComponent));
      let related_dataset_gridstack = related_dataset_debug_element.nativeElement.querySelector('.grid-stack');
      expect(related_dataset_gridstack).toBeTruthy();
      const related_dataset_add_field_group_button = related_dataset_debug_element.nativeElement.querySelector('#add_field_group');
      related_dataset_add_field_group_button.click();
      const related_dataset_add_field_button = related_dataset_debug_element.nativeElement.querySelector('#add_field');
      related_dataset_add_field_button.click();
      dataset_page_fixture.detectChanges();

      // Check related dataset grid item and field in form are synced
      const related_gridstack_item = related_dataset_gridstack.querySelectorAll('.grid-stack-item')[1];
      expect(related_gridstack_item).toBeTruthy();
      let related_dataset_component = related_dataset_debug_element.componentInstance;
      let fields = related_dataset_component.fields_form_array;
      expect(fields.length).toEqual(1);
      let field_form = fields.at(0);
      let field_element_to_form_map = related_dataset_component.form.get('field_element_to_form_map')?.value;
      expect(field_element_to_form_map).toBeTruthy();
      let field_map_value = field_element_to_form_map?.get(related_gridstack_item);
      expect(field_map_value).toBe(field_form);

      // Save the dataset
      lastValueFrom(dataset_component.saveDraft());

      // Rebuild the dataset_component  with the form
      setUpComponentAndFixture();
      dataset_page_component.form = dataset_component.convertDatasetObjectToForm(last_saved_data);
      dataset_page_fixture.detectChanges();

      // Item was added to the dataset grid
      const gridstack_item_after_save = getGridstack().nativeElement.querySelector('.grid-stack-item');
      expect(gridstack_item_after_save).toBeTruthy();

      // dataset: field in form and on grid match
      fields = dataset_component.fields_form_array;
      expect(fields.length).toEqual(1);
      field_form = fields.at(0);
      field_element_to_form_map = dataset_component.form.get('field_element_to_form_map')?.value;
      expect(field_element_to_form_map).toBeTruthy();
      field_map_value = field_element_to_form_map?.get(gridstack_item_after_save);
      expect(field_map_value).toBe(field_form);

      // nested grid was added to the dataset grid
      const nested_gridstack_after_save = getGridstack().nativeElement.querySelector('.grid-stack');
      expect(nested_gridstack_after_save).toBeTruthy();

      related_dataset_debug_element = dataset_component_debug_element.query(By.directive(DatasetComponent));
      related_dataset_gridstack = related_dataset_debug_element.nativeElement.querySelector('.grid-stack');

      // Item was added to the related_dataset grid
      const related_gridstack_item_after_save = related_dataset_gridstack.querySelectorAll('.grid-stack-item')[1];
      expect(related_gridstack_item_after_save).toBeTruthy();

      // related_dataset: field in form and on grid match
      related_dataset_component = related_dataset_debug_element.componentInstance;
      fields = related_dataset_component.fields_form_array;
      expect(fields.length).toEqual(1);
      field_form = fields.at(0);
      field_element_to_form_map = related_dataset_component.form.get('field_element_to_form_map')?.value;
      expect(field_element_to_form_map).toBeTruthy();
      field_map_value = field_element_to_form_map?.get(related_gridstack_item_after_save);
      expect(field_map_value).toBe(field_form);

      // nested grid was added to the related_dataset grid
      const related_nested_gridstack_after_save = getGridstack().nativeElement.querySelector('.grid-stack');
      expect(related_nested_gridstack_after_save).toBeTruthy();

    });

    // TODO: Maybe at some point in the future I can figure out how to test that all of the dragging functionality works
    // 4. I can remove a field via drag, and it exists in neither place
    // 6. I can remove a field group
    // 7. I can drag a field to a field group, and it still exists on the form
    // 8. I can drag a field out of a field group, and it still exists on the form
    // 9. I can delete a field group via drag, and all of it's fields are removed from the form
    // 12. I can't move fields or field groups between datasets


    // I can drag a grid-stack-item within the grid-stack
    // it('can add a field/widget to gridstack via the button', async () => {
    //   setUpComponentAndFixture();
    //   const button = dataset_component_debug_element.nativeElement.querySelector('#add_field');
    //   button.click();

    //   dataset_page_fixture.detectChanges();
    //   await dataset_page_fixture.whenStable();

    //   // Item was added to the grid
    //   const gridstack_item = getGridstack().nativeElement.querySelector('.grid-stack-item');

    //   const dataset_component_position = dataset_component_debug_element.nativeElement.getBoundingClientRect();

    //   // Get the initial position of the Gridstack item
    //   const initial_position = gridstack_item.getBoundingClientRect();

    //   // Simulate a drag event on the Gridstack item
    //   const drag_event = new MouseEvent('mousedown', { clientX: initial_position.left, clientY: initial_position.top });
    //   gridstack_item.dispatchEvent(drag_event);

    //   // Simulate a move event on the Gridstack item
    //   const move_event = new MouseEvent('mousemove', { clientX: initial_position.left + 500, clientY: initial_position.top });
    //   document.dispatchEvent(move_event);

    //   // Simulate a drop event on the Gridstack item
    //   const drop_event = new MouseEvent('mouseup', { clientX: initial_position.left + 500, clientY: initial_position.top });
    //   document.dispatchEvent(drop_event);

    //   // Get the final position of the Gridstack item
    //   const final_position = gridstack_item.getBoundingClientRect();

    //   // Expect the final position to be different from the initial position
    //   expect(final_position.left).not.toBe(initial_position.left);
    //   expect(final_position.top).toBe(initial_position.top);

    // });

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
