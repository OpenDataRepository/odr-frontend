import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { from, of, switchMap } from 'rxjs';
import { DatasetService } from '../../api/dataset.service';
import { PermissionService } from '../../api/permission.service';
import { ApiService } from 'src/app/api/api.service';
import { AlertController, IonModal } from '@ionic/angular';
import { FieldService } from 'src/app/api/field.service';
import { EditPluginMap } from 'src/app/shared/plugin-map';
import { PluginsService } from 'src/app/shared/plugins.service';
import { GridstackComponent, NgGridStackOptions } from 'gridstack/dist/angular';
import { GridItemHTMLElement, GridStack, GridStackNode } from 'gridstack';
import { FieldComponent } from '../field/field.component';

@Component({
  selector: 'dataset-edit',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss'],
})
export class DatasetComponent implements OnInit, OnChanges {

  @Input()
  is_top_level_dataset: boolean = false;

  @Input()
  form: FormGroup = new FormGroup({name: new FormControl(), fields: new FormArray([]),
    related_datasets: new FormArray([])});

  @Input()
  disabled: boolean = false;

  @Output()
  remove: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('link_dataset_modal') link_dataset_modal!: IonModal;

  @ViewChild('link_field_modal') link_field_modal!: IonModal;

  @ViewChild('add_plugin_modal') add_plugin_modal!: IonModal;

  @ViewChild('grid_container', { read: ViewContainerRef }) grid_container!: ViewContainerRef;

  gridComp?: GridstackComponent;

  user_datasets_loaded = false;
  public_datasets_loaded = false;
  user_datasets_to_link: any = [];
  public_datasets_to_link: any = [];

  user_fields_loaded = false;
  public_fields_loaded = false;
  user_fields_to_link: any = [];
  public_fields_to_link: any = [];

  edit_permission: boolean | undefined;

  field_uuid_map: any = {};

  private static default_base_grid_options: NgGridStackOptions = {
    cellHeight: 75,
    margin: 5,
    minRow: 1, // don't collapse when empty
    disableOneColumnMode: false,
    float: true
  };
  private static default_sub_grid_options: NgGridStackOptions = {
    column: 'auto',
    acceptWidgets: defaultNestedAcceptWidgets,
    ...DatasetComponent.default_base_grid_options
  }
  private static default_top_grid_options : NgGridStackOptions = { // main grid options
    column: 6,
    subGridOpts: DatasetComponent.default_sub_grid_options,
    removable: '.trash',
    acceptWidgets: true,
    ...DatasetComponent.default_base_grid_options
  };

  top_grid_options : NgGridStackOptions = {
    ...DatasetComponent.default_top_grid_options
  };
  sub_grid_options : NgGridStackOptions = {
    ...DatasetComponent.default_sub_grid_options
  };
  grid_opts_ready = false;

  private removed_fields_in_limbo = new Set();

  constructor(private _fb: FormBuilder, private datasetService: DatasetService, private api: ApiService,
    private alertController: AlertController, private permissionService: PermissionService,
    private fieldService: FieldService, private pluginsService: PluginsService, private viewContainerRef: ViewContainerRef,
    private cdr: ChangeDetectorRef) {}

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {

    const form_changed = 'form' in changes;
    const disabled_changed = 'disabled' in changes;

    if(form_changed) {
      // Build field_uuid->form map
      this.field_uuid_map = {};
      for(let field_form of this.fields_form_array?.controls) {
        let field_uuid = field_form.get('uuid')?.value;
        this.field_uuid_map[field_uuid] = field_form;
      }
      this.cdr.detectChanges();
    }

    const tryToSetUpGridstack = () => {
      if(!this.template_uuid || !this.grid_container) {
        return;
      }
      this.setUpGridStack();
    }

    // If edit_permission hasn't been set yet, set it.
    // If either edit_permission or form is set, set up the gridstack
    if(!this.disabled && this.uuid && this.edit_permission == undefined) {
      this.permissionService.hasPermission(this.uuid.value, 'edit').subscribe(result => {
        this.edit_permission = result as boolean;
        tryToSetUpGridstack();
      });
    } else if (form_changed) {
      tryToSetUpGridstack();
    }
  }

  private initializeGridStackOptions() {
    if(!this.template_uuid) {
      throw new Error('Cannot init gridstack - template_uuid must be initialized first');
    }
    const accept_widget_class = 'template-uuid-' + this.template_uuid?.value;
    this.top_grid_options.acceptWidgets =
      (element: Element) => {
        return element.classList.contains(accept_widget_class)
          || element.classList.length==1; // from the sidebar
      }
    let subGridAcceptWidgetsCallback = (element: Element) => {
      if(!defaultNestedAcceptWidgets(element)) {
        return false;
      };
      return element.classList.contains(accept_widget_class)
        || element.classList.length==1; // from the sidebar
    }
    this.top_grid_options.subGridOpts!.acceptWidgets = subGridAcceptWidgetsCallback;
    this.sub_grid_options.acceptWidgets = subGridAcceptWidgetsCallback;
    this.grid_opts_ready = true; // The grid will only take the above options if they exist before it is initialized on the dom

  }

  private setUpGridStack() {
    if(!this.template_uuid) {
      throw new Error('Cannot init gridstack - template_uuid must be initialized first');
    }

    if(!this.grid_opts_ready) {
      this.initializeGridStackOptions();
    }

    if(!this.gridComp) {
      let gridCompRef = this.grid_container.createComponent(GridstackComponent);
      gridCompRef.setInput('options', this.top_grid_options);
      gridCompRef.changeDetectorRef.detectChanges();
      this.gridComp = gridCompRef.instance;

      GridStack.setupDragIn('.sidebar .grid-stack-item', { appendTo: 'body', helper: 'clone' });
    }

    if(!this.grid) {
      throw new Error('Grid does not exist on dom to be set up');
    }
    this.form.addControl('grid', new FormControl(this.grid));
    this.form.addControl('field_element_to_form_map', new FormControl(new Map<any, any>()));
    this.loadGridstackItems();
    this.recursiveAddEventHandlers(this.grid!);
    this.recursiveAddTemplateUuidClass(this.grid!); // Needed to restrict moving items between grids
  }

  makePublic() {
    this.form.addControl('public_date', new FormControl((new Date()).toISOString()));
  }

  makePrivate() {
    this.form.removeControl('public_date');
  }

  removeFieldFromDataByForm(form: FormGroup) {
    for(let [index, field_form] of this.fields_form_array.controls.entries()) {
      let safe_field_form = field_form as FormGroup;
      if(safe_field_form == form) {
        this.fields_form_array.removeAt(index);
        return;
      }
    }
  }

  newField(x = 0, y = -1, grid = this.grid) {
    if(y < 0) {
      y = this.gridHeight();
    }
    this.api.createTemplateField({}).subscribe((template_field: any) => {
      let new_field_form = this.convertFieldObjectToForm(template_field);
      this.fields_form_array.push(new_field_form);
      let el = this.appFieldSelectorFromForm(new_field_form);
      grid!.addWidget(el, {x, y});
    });
  }

  loadFieldsAvailableToLink(){
    this.user_fields_loaded = false;
    this.user_fields_to_link = [];
    this.api.userTemplateFields().subscribe((fields: any) => {
      this.user_fields_to_link = fields;
      this.user_fields_loaded = true;
    });

    this.public_fields_loaded = false;
    this.public_fields_to_link = [];
    this.api.publicTemplateFields().subscribe((fields: any) => {
      this.public_fields_to_link = fields;
      this.public_fields_loaded = true;
    });
  }

  cancelLinkFieldModal() {
    this.link_field_modal.dismiss(null, 'cancel');
  }
  confirmLinkFieldModal(uuid: string) {
    this.linkExistingField(uuid);
    this.link_field_modal.dismiss(null, 'confirm');
  }

  linkExistingField(uuid: string) {
    this.fieldService.fetchLatestField(uuid).pipe(
      switchMap((related_field: any) => {
        if(this.datasetHasField(uuid)) {
          return from(this.presentAlert('Cannot link the chosen field as it is already linked'));
        } else {
          this.fields_form_array.push(this.convertFieldObjectToForm(related_field));
          return this.saveDraft();
        }
      })
    ).subscribe();
  }

  private datasetHasField(uuid: string) {
    let dataset_object = DatasetComponent.convertFormToDatasetObject(this.form);
    for(let field of dataset_object.fields) {
      if(field.uuid == uuid) {
        return true;
      }
    }
    return false;
  }

  deleteRelatedDataset(index: number) {
    this.related_datasets_form_array.removeAt(index);
  }

  addRelatedDataset() {
    this.datasetService.newEmptyDatasetAndTemplate().pipe(
      switchMap((related_dataset_object: any) => {
        this.related_datasets_form_array.push(
          this._fb.group({
            dataset_uuid: related_dataset_object.dataset_uuid,
            template_uuid: related_dataset_object.template_uuid,
            template_id: related_dataset_object.template_id,
            name: new FormControl(null, [Validators.required]),
            group_uuid: this.form.get('group_uuid')?.value,
            fields: this._fb.array([]),
            related_datasets: this._fb.array([]),
            template_plugins: {field_plugins: {}, object_plugins: {}},
            dataset_plugins: {field_plugins: {}, object_plugins: {}}
          })
        )
        return this.saveDraft();
      })
    ).subscribe();
  }

  loadDatasetsAvailableToLink(){
    this.user_datasets_loaded = false;
    this.user_datasets_to_link = [];
    this.api.userDatasets().subscribe(datasets => {
      // TODO: consider removing dataset and decendant datasets
      this.user_datasets_to_link = datasets;
      this.user_datasets_loaded = true;
    });

    this.public_datasets_loaded = false;
    this.public_datasets_to_link = [];
    this.api.publicDatasets().subscribe(datasets => {
      // TODO: consider removing dataset and decendant datasets
      this.public_datasets_to_link = datasets;
      this.public_datasets_loaded = true;
    });
  }

  cancelLinkDatasetModal() {
    this.link_dataset_modal.dismiss(null, 'cancel');
  }
  confirmLinkDatasetModal(uuid: string) {
    this.linkExistingDataset(uuid);
    this.link_dataset_modal.dismiss(null, 'confirm');
  }

  linkExistingDataset(uuid: string) {
    this.datasetService.fetchLatestDatasetAndTemplate(uuid).pipe(
      switchMap((related_dataset_object: any) => {
        if(this.datasetHasChild(uuid)) {
          return from(this.presentAlert('Cannot link the chosen dataset as it is already linked'));
        }else if(DatasetComponent.hasCircularDependency(related_dataset_object, this.uuid?.value)) {
          return from(this.presentAlert('Cannot link the chosen dataset as it would cause a circular dependency'));
        } else {
          this.related_datasets_form_array.push(this.convertDatasetObjectToForm(related_dataset_object));
          return this.saveDraft();
        }
      })
    ).subscribe();
  }

  private datasetHasChild(uuid: string) {
    let dataset_object = DatasetComponent.convertFormToDatasetObject(this.form);
    for(let related_dataset_object of dataset_object.related_datasets) {
      if(related_dataset_object.dataset_uuid == uuid) {
        return true;
      }
    }
    return false;
  }

  private static hasCircularDependency(dataset_object: any, uuid: string) {
    if(dataset_object.dataset_uuid == uuid) {
      return true;
    }
    // If user doesn't have view permissions to the dataset and attaching it creates a circular dependency, the backend will through an error
    // This is a bug but will only come up in rare circumstances.
    if(dataset_object.related_datasets){
      for(let related_dataset_object of dataset_object.related_datasets) {
        if(DatasetComponent.hasCircularDependency(related_dataset_object, uuid)) {
          return true;
        }
      }
    }
    return false;
  }

  get fields_form_array(): FormArray {
    return this.form.get("fields") as FormArray;
  }

  get related_datasets_form_array(): FormArray {
    return this.form.get("related_datasets") as FormArray;
  }

  get related_fields_form_array(): FormArray {
    return this.form.get("related_fields") as FormArray;
  }

  get name() { return this.form.get('name'); }

  get uuid() { return this.form.get('dataset_uuid'); }

  get template_uuid() { return this.form.get('template_uuid'); }

  get public_date() { return this.form.get('public_date'); }

  get public(): boolean { return !!this.public_date; }

  get hasViewPermission(): boolean { return !!this.form.get('updated_at'); }

  get may_view() { return this.public || this.hasViewPermission }

  get may_edit() { return !this.disabled && this.edit_permission; }

  get all_object_plugins(): Record<string, number[]> {
    return this.pluginsService.all_dataset_plugins;
  }

  get all_object_plugin_keys(): string[] {
    return this.pluginsService.all_dataset_plugins_keys;
  }

  get current_plugins(): EditPluginMap {
    return this.form.get('plugins')?.value;
  }

  get current_plugin_keys(): string[] {
    return this.current_plugins ? this.current_plugins.keys : [];
  }

  get field_element_to_form_map(): Map<any,any> { return this.form.get('field_element_to_form_map')?.value }

  getFieldFormByUuid(uuid: string): FormGroup {
    return this.field_uuid_map[uuid];
  }

  castToFormGroup(f: AbstractControl) {
    return f as FormGroup;
  }

  saveDraft() {
    let dataset_object = DatasetComponent.convertFormToDatasetObject(this.form as FormGroup);
    return this.datasetService.updateDatasetAndTemplate(dataset_object).pipe(
      switchMap(() => {
        return this.datasetService.fetchLatestDatasetAndTemplate(this.uuid?.value);
      }),
      switchMap((updated_dataset_object) => {
          let new_form = this.convertDatasetObjectToForm(updated_dataset_object);
          this.copyNewFormToComponentForm(new_form);
          return of({});
        }
      )
    )
  }

  private static convertFormToDatasetObject(form: FormGroup): any {
    if(form.contains('no_permissions')) {
      // No view permissions
      return {
        dataset_uuid: form.get('dataset_uuid')?.value,
        template_uuid: form.get('template_uuid')?.value,
        template_id: form.get('template_id')?.value,
        no_permissions: true
      };
    }

    let fields = [];
    for(let field_form of (form.get("fields") as FormArray).controls) {
      fields.push(DatasetComponent.convertFormToFieldObject(field_form as FormGroup));
    }
    let related_datasets = [];
    for(let related_dataset_form of (form.get("related_datasets") as FormArray).controls) {
      related_datasets.push(DatasetComponent.convertFormToDatasetObject(related_dataset_form as FormGroup));
    }
    // If a grid has been initialized, persist it. Otherwise, use existing view_settings
    let view_settings = form.contains('view_settngs') ? form.get('view_settings')?.value : undefined;
    let grid = form.get('grid')?.value;
    if(grid) {
      view_settings = {fields_grid: DatasetComponent.persistGrid(grid, form.get('field_element_to_form_map')?.value)};
    }


    let dataset_object: Record<string, any> = {
      dataset_uuid: form.get('dataset_uuid')?.value,
      template_uuid: form.get('template_uuid')?.value,
      template_id: form.get('template_id')?.value,
      name: form.get('name') ? form.get('name')?.value : "",
      group_uuid: form.get('group_uuid') ? form.get('group_uuid')?.value: undefined,
      public_date: form.get('public_date') ? form.get('public_date')?.value : undefined,
      fields,
      related_datasets,
      view_settings
    };
    DatasetComponent.addPluginsFromFormToDatasetObject(form, dataset_object);
    return dataset_object;
  }

  private static convertFormToFieldObject(form: FormGroup) {
    if(form.contains('no_permissions')) {
      return {
        uuid: form.get('uuid')?.value,
        no_permissions: true
      }
    }

    let field: any = {
      name: form.get('name') ? form.get('name')?.value : "",
      description: form.get('description') ? form.get('description')?.value : "",
    };
    if(form.get('uuid')) {
      field.uuid = form.get('uuid')?.value;
    }
    if(form.get('public_date')) {
      field.public_date = form.get('public_date')?.value;
    }
    if(form.get('type')) {
      let type = form.get('type')?.value;
      if(type != 'none') {
        field.type = type;
      }
    }
    return field;
  }

  private convertFieldObjectToForm(field: any) {
    if(field.no_permissions) {
      return this._fb.group({
        uuid: new FormControl(field.uuid),
        no_permissions: new FormControl(true)
      });
    }
    let field_form: FormGroup = this._fb.group({
      uuid: new FormControl(field.uuid),
      name: new FormControl(field.name, [Validators.required]),
      description: new FormControl(field.description),
    });
    if(field.public_date) {
      field_form.addControl('public_date', new FormControl(field.public_date));
    }
    if(field.updated_at) {
      field_form.addControl('updated_at', new FormControl(field.updated_at));
    }
    if(field.type) {
      field_form.addControl('type', new FormControl(field.type));
    } else {
      field_form.addControl('type', new FormControl('none'));
    }
    return field_form;
  }

  public convertDatasetObjectToForm(dataset_object: any) {
    if(dataset_object.no_permissions) {
      // No view permissions
      return this._fb.group({
        dataset_uuid: dataset_object.dataset_uuid,
        template_uuid: dataset_object.template_uuid,
        template_id: dataset_object.template_id,
        no_permissions: true
      });
    }
    let form: FormGroup = this._fb.group({
      dataset_uuid: dataset_object.dataset_uuid,
      template_uuid: dataset_object.template_uuid,
      template_id: dataset_object.template_id,
      name: [dataset_object.name, Validators.required],
      fields: this._fb.array([]),
      related_datasets: this._fb.array([]),
      template_plugins: dataset_object.template_plugins ? dataset_object.template_plugins : {field_plugins: {}, object_plugins: {}},
      dataset_plugins: dataset_object.dataset_plugins ? dataset_object.dataset_plugins : {field_plugins: {}, object_plugins: {}}
    })
    if(dataset_object.group_uuid) {
      form.addControl('group_uuid', new FormControl(dataset_object.group_uuid));
    }
    if(dataset_object.public_date) {
      form.addControl('public_date', new FormControl(dataset_object.public_date));
    }
    if(dataset_object.dataset_updated_at) {
      form.addControl('updated_at', new FormControl(dataset_object.dataset_updated_at));
    }
    if(dataset_object.fields) {
      for(let field of dataset_object.fields) {
        let field_form = this.convertFieldObjectToForm(field);
        (form.get("fields") as FormArray).push(field_form);
      }
    }
    if(dataset_object.related_datasets) {
      for(let related_dataset of dataset_object.related_datasets) {
        (form.get("related_datasets") as FormArray).push(this.convertDatasetObjectToForm(related_dataset));
      }
    }
    this.addPluginsToForm(form);
    if(dataset_object.view_settings) {
      form.addControl('view_settings', new FormControl(dataset_object.view_settings));
    }
    return form;
  }

  private copyOptionalFieldToComponentForm(field_name: string, new_form: FormGroup) {
    if(new_form.contains(field_name)) {
      if(this.form.contains(field_name)) {
        this.form.controls[field_name].setValue(new_form.get(field_name)?.value);
      } else {
        this.form.addControl(field_name, new FormControl(new_form.get(field_name)?.value))
      }
    } else {
      try {
        this.form.removeControl(field_name);
      } catch (err) {}
    }
  }

  private copyNewFormToComponentForm(new_form: FormGroup) {

    this.form.controls['dataset_uuid'].setValue(new_form.get('dataset_uuid')?.value);
    this.form.controls['template_uuid'].setValue(new_form.get('template_uuid')?.value);
    this.form.controls['template_id'].setValue(new_form.get('template_id')?.value);

    if(new_form.contains('no_permissions')) {
      // No view permissions
      if(!this.form.contains('no_permissions')) {
        this.form.addControl('no_permissions', new FormControl(true))
      }
      return;
    } else {
      try {
        this.form.removeControl('no_permissions');
      } catch (err) {}
    }

    this.form.controls['name'].setValue(new_form.get('name')?.value);

    this.copyOptionalFieldToComponentForm('public_date', new_form);
    this.copyOptionalFieldToComponentForm('type', new_form);

    this.form.removeControl('fields');
    this.form.addControl('fields', new_form.get('fields'));

    this.form.removeControl('related_datasets');
    this.form.addControl('related_datasets', new_form.get('related_datasets'));
  }

  private addPluginsToForm(form: FormGroup) {
    // fields
    let template_plugin_object = form.get('template_plugins')?.value;
    let dataset_plugin_object = form.get('dataset_plugins')?.value;
    let template_field_plugin_map: any = {};
    if(template_plugin_object  && "field_plugins" in template_plugin_object) {
      for(let field_uuid in template_plugin_object.field_plugins) {
        template_field_plugin_map[field_uuid] = template_plugin_object.field_plugins[field_uuid];
      }
    }
    let dataset_field_plugin_map: any = {};
    if(dataset_plugin_object && "field_plugins" in dataset_plugin_object) {
      for(let field_uuid in dataset_plugin_object.field_plugins) {
        dataset_field_plugin_map[field_uuid] = dataset_plugin_object.field_plugins[field_uuid];
      }
    }

    this.permissionService.hasPermission(form.get('template_uuid')?.value, 'edit').subscribe(has_template_edit_permission => {
      form.addControl('plugins', new FormControl(new EditPluginMap(template_plugin_object.object_plugins, dataset_plugin_object.object_plugins, has_template_edit_permission as boolean)));
      for(let field_form of (form.get("fields") as FormArray).controls) {
        let field_uuid = field_form.get('uuid')?.value;
        let field_template_plugins = field_uuid in template_field_plugin_map ? template_field_plugin_map[field_uuid] : {};
        let field_dataset_plugins = field_uuid in dataset_field_plugin_map ? dataset_field_plugin_map[field_uuid] : {};
        (field_form as FormGroup).addControl('template_plugins', new FormControl(field_template_plugins));
        (field_form as FormGroup).addControl('dataset_plugins', new FormControl(field_dataset_plugins));
        (field_form as FormGroup).addControl('plugins', new FormControl(new EditPluginMap(field_template_plugins, field_dataset_plugins, has_template_edit_permission as boolean)))
      }
    })

  }

  private static addPluginsFromFormToDatasetObject(form: FormGroup, existing_dataset_object: Record<string, any>) {
    let template_plugin_object = form.get('template_plugins')?.value;
    let dataset_plugin_object = form.get('dataset_plugins')?.value;

    let template_plugins: any = {
      object_plugins: template_plugin_object.object_plugins,
      field_plugins: {}
    };
    let dataset_plugins: any = {
      object_plugins: dataset_plugin_object.object_plugins,
      field_plugins: {}
    };

    for(let field_form of (form.get("fields") as FormArray).controls) {
      let field_uuid = field_form.get('uuid')?.value;
      let field_template_plugins = field_form.get('template_plugins')?.value;
      let field_dataset_plugins = field_form.get('dataset_plugins')?.value;
      template_plugins.field_plugins[field_uuid] = field_template_plugins;
      dataset_plugins.field_plugins[field_uuid] = field_dataset_plugins;
    }
    existing_dataset_object['template_plugins'] = template_plugins;
    existing_dataset_object['dataset_plugins'] = dataset_plugins;
  }

  addPlugin(name: string, version: number) {
    this.editPlugin(name, version);
  }

  editPlugin(name: string, version: number) {
    this.current_plugins.set(name, {version});
  }

  removePlugin(name: string) {
    this.current_plugins.delete(name);
  }

  cancelAddPluginModal() {
    this.add_plugin_modal.dismiss(null, 'cancel');
  }

  confirmAddPluginModal(name: string) {
    let version = this.latestPluginVersion(name);
    this.addPlugin(name, version);
    this.add_plugin_modal.dismiss(null, 'confirm');
  }

  private latestPluginVersion(plugin_name: string) {
    let versions = this.all_object_plugins[plugin_name];
    return versions[versions.length-1];
  }

  changePluginVersion(name: string, event: Event) {
    let version = (<any>event).detail.value;
    this.editPlugin(name, version);
  }

  getExistingPluginVersionOrLatest(plugin_name: string) {
    let current_plugin = this.current_plugins.get(plugin_name);
    if(current_plugin) {
      return current_plugin.version;
    }
    return this.latestPluginVersion(plugin_name);
  }

  private async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Alert',
      subHeader: '',
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  private get grid() {
    return this.gridComp?.grid;
  }

  public newFieldGroup(x = 0, y = -1, grid=this.grid) {
    if(y < 0) {
      y = this.gridHeight();
    }
    let new_el = grid!.addWidget({x, y, subGridOpts: this.sub_grid_options});
    setTimeout(() => {
      this.addEvents(new_el?.gridstackNode?.subGrid as GridStack);
    }, 10);
  }

  public removeWidgetFromGrid(el: any) {
    el.remove();
    el.gridstackNode.grid.removeWidget(el, false);
  }

  private gridHeight() {
    let height = 0;
    for(let child of this.grid!.engine.nodes) {
      let childY = child.y ? child.y : 0;
      let childH = child.h ? child.h : 0;
      let childMaxY = childY + childH;
      if(childMaxY > height) {
        height = childMaxY;
      }
    }
    return height;
  }

  public recursiveAddEventHandlers(grid: GridStack) {
    this.addEvents(grid);
    for(let node of grid.engine.nodes) {
      if('subGrid' in node) {
        this.recursiveAddEventHandlers(node.subGrid!);
      }
    }
  }

  public recursiveAddTemplateUuidClass(grid: GridStack) {
    for(let node of grid.engine.nodes) {
      node.el!.classList.add('template-uuid-' + this.template_uuid?.value);
      if('subGrid' in node) {
        this.recursiveAddTemplateUuidClass(node.subGrid!);
      }
    }
  }

  private addEvents(grid: GridStack) {
    grid.on('added', (event: any, items: any) => {
      for(let item of items) {
        item.el.classList.add('template-uuid-' + this.template_uuid?.value);
        // This is needed to stop the form from being deleted if the field is moved from one grid to another
        let form = this.field_element_to_form_map?.get(item.el);
        this.removed_fields_in_limbo.delete(form);
      }
      // TODO: add test cases for this if possible
      if(items.length == 1) {
        let el = items[0].el;
        let x = el.gridstackNode.x;
        let y = el.gridstackNode.y;
        if(el.innerText == "Field Group") {
          this.removeWidgetFromGrid(el);
          this.newFieldGroup(x, y, items[0].grid);
        } else if (el.innerText == 'New field') {
          this.removeWidgetFromGrid(el);
          this.newField(x, y, items[0].grid);
        }
      }
    })
    .on('change', (event: any, items: any) => {
      let itemOverextension = containerOverextendedNumberOfRows(items);
      if(itemOverextension > 0) {
        this.extendItemRows(items[0].grid.parentGridItem, itemOverextension);
      }
    })
    .on('dropped', (event: any, previousNode: any, newNode: any) => {
      let itemOverextension = itemOverextendingContainerBy(newNode);
      if(itemOverextension > 0) {
        this.extendItemRows(newNode.grid!.parentGridItem!, itemOverextension);
      }
    })
    .on('resizestop', (event: any, el: any) => {
      let n = el.gridstackNode;
      if(n.subGrid) {
        let itemOverextension = containerOverextendedNumberOfRows(n.subGrid.engine.nodes);
        if(itemOverextension > 0) {
          this.extendItemRows(n, itemOverextension);
        }
      }
    })
    .on('removed', (event: Event, nodes: GridStackNode[]) => {
      console.log('removed called');
      // for(let node of nodes) {
      //   if(!('subGrid' in node)) {
      //     let form = this.field_element_to_form_map.get(node.el);
      //     this.removed_fields_in_limbo.add(form);
      //     setTimeout(() => {
      //       if(this.removed_fields_in_limbo.has(form)) {
      //         this.removeFieldFromDataByForm(form);
      //       }
      //     }, 250);
      //     // TODO: also need to detect if this field should be deleted entirely. If so, delete
      //   }
      // }
      // If a nested grid is removed, remove it's fields from the form so they are permanently removed
      for(let node of nodes) {
        if('subGridOpts' in node) {
          for(let child of node.subGridOpts!.children!){
            let child_el = (child as any).el;
            let child_form = this.field_element_to_form_map.get(child_el);
            this.removeFieldFromDataByForm(child_form);
          }
        }
      }
    })
  }

  private extendItemRows(gridItem: GridStackNode, numberOfRows: number) {
    this.grid!.update(gridItem.el!, {h: gridItem.h! + numberOfRows})
  }

  private loadGridstackItems() {
    this.grid?.removeAll();
    this.field_element_to_form_map.clear();

    this.grid?.batchUpdate();

    let view_settings = this.form.contains('view_settings') ? this.form.get('view_settings')?.value : {};
    let fields_grid = view_settings.fields_grid;
    let field_uuids = Object.keys(this.field_uuid_map);
    let field_uuids_not_in_grid = new Set(field_uuids);

    if(fields_grid) {
      for(let child of fields_grid.children) {
        if(child.children) {
          let grandchild_list = [];
          for(let grandchild of child.children) {
            let field_uuid = grandchild.uuid;
            let field = this.appFieldSelectorFromUUID(field_uuid);
            grandchild_list.push({x: grandchild.x, y: grandchild.y, w: grandchild.w, h: grandchild.h, el: field});
            // subGrid!.addWidget(field, {x: grandchild.x, y: grandchild.y, w: grandchild.w, h: grandchild.h})
            field_uuids_not_in_grid.delete(field_uuid);
          }
          this.grid?.addWidget({x: child.x, y: child.y, w: child.w, h: child.h, subGridOpts: {children: grandchild_list, ...this.sub_grid_options}});
        } else {
          let field_uuid = child.uuid;
          let field = this.appFieldSelectorFromUUID(field_uuid);
          this.grid?.addWidget(field, {x: child.x, y: child.y, w: child.w, h: child.h})
          field_uuids_not_in_grid.delete(field_uuid);
        }
      }
    }

    for(let field_uuid of field_uuids_not_in_grid.values()) {
      let field = this.appFieldSelectorFromUUID(field_uuid as string);
      this.grid!.addWidget(field, {x:0, y: this.gridHeight()});
    }

    this.grid?.commit();
  }

  private appFieldSelectorFromUUID(uuid: string) {
    const form = this.fieldFormFromUuid(uuid);
    return this.appFieldSelectorFromForm(form);
  }

  private appFieldSelectorFromForm(form: FormGroup) {

    const component = this.viewContainerRef.createComponent(FieldComponent);
    component.setInput('form', form);
    component.setInput('disabled', !this.may_edit);
    component.setInput('template_uuid', this.template_uuid?.value);
    const html_element = component.location.nativeElement;
    component.instance.remove.subscribe(() => {
      this.removeFieldFromDataByForm(form);
      this.removeWidgetFromGrid(html_element);
    })
    this.field_element_to_form_map!.set(html_element, form);

    return html_element;

    // return `<app-field
    //   [form]="${this.fieldFormFromUuid(uuid)}"
    //   (remove)="${this.removeFieldFromDataByForm(uuid)}"
    //   [disabled]="${!this.may_edit}"
    //   [template_uuid]="${this.template_uuid?.value}">
    // </app-field>`;
  }

  private fieldFormFromUuid(uuid: string) {
    return this.field_uuid_map[uuid];

    // for(let [index, field_form] of this.fields_form_array.controls.entries()) {
    //   let safe_field_form = field_form as FormGroup;
    //   if(safe_field_form.get("uuid")?.value == uuid) {
    //     return field_form;
    //   }
    // }
    // return undefined;
  }

  private static persistGrid(grid: GridStack, field_element_to_form_map: Map<any, any>) {
    if(!grid) {
      throw 'persistGrid: grid is null';
    }
    if(!field_element_to_form_map) {
      throw 'persistGrid: field_element_to_form_map is null';
    }
    let persisted_grid: any = {children: []};
    for(let child_node of grid.engine.nodes) {
      let persisted_child: any = {x: child_node.x, y: child_node.y, w: child_node.w, h: child_node.h};
      if('subGrid' in child_node) {
        persisted_child.children = []
        for(let grandchild_node of child_node.subGrid?.engine?.nodes!) {
          let persisted_grandchild: any = {x: grandchild_node.x, y: grandchild_node.y, w: grandchild_node.w, h: grandchild_node.h};
          let uuid = field_element_to_form_map.get(grandchild_node.el).get('uuid')?.value;
          persisted_grandchild.uuid = uuid;
          persisted_child.children.push(persisted_grandchild);
        }
      } else {
        let form = field_element_to_form_map.get(child_node.el);
        let uuid = form.get('uuid')?.value;
        persisted_child.uuid = uuid;
      }
      persisted_grid.children.push(persisted_child);
    }
    return persisted_grid;
  }

}

function containerOverextendedNumberOfRows(items: GridStackNode[]) {
  let extendAmount = 0;
  for(let item of items) {
    let itemOverextension = itemOverextendingContainerBy(item);
    if (itemOverextension > extendAmount) {
      extendAmount = itemOverextension;
    }
  }
  return extendAmount;
}

function itemOverextendingContainerBy(item: GridStackNode) {
  if(!item.grid!.parentGridItem) {
    return 0;
  }
  return item.y! + item.h! - item.grid!.parentGridItem.h!;
}

function defaultNestedAcceptWidgets(element: Element) {
  let el = element as any;
  if(el.innerText == "Field Group" || ('gridstackNode' in el && 'subGrid' in el.gridstackNode)) {
    return false;
  }
  return true;
}
