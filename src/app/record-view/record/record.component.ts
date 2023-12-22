import { ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { GridstackComponent, NgGridStackOptions } from 'gridstack/dist/angular';
import { ApiService } from 'src/app/api/api.service';
import { gridHeight, static_sub_grid_options, static_top_grid_options } from 'src/app/shared/gridstack-settings';
import { PluginsService } from 'src/app/shared/plugins.service';
// import { saveAs } from 'file-saver';
import { graphCsvBlob } from 'src/plugins/dataset_plugins/graph/0.1/plugin';
import { FieldComponent } from '../field/field.component';
import { DatasetService } from 'src/app/api/dataset.service';


@Component({
  selector: 'record-view',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss'],
})
export class RecordComponent implements OnInit, OnChanges {

  @Input()
  record: any = {};

  combined_dataset_template: any = undefined;

  name: string|undefined;

  data_available = false;

  @ViewChild('graph_plugin') set content(content: ElementRef) {
    if(content && this.record && this.record.plugins && 'graph' in this.record.plugins) { // initially setter gets called with undefined
      let graph_plugin_element = content;
      if(!this.graphed) {
        // let file = 'assets/test/cma_404470826rda00790050104ch11503p1.csv';
        let file = this.#findGraphFile();
        if(!file) {
          return;
        }
        let file_name = file.name;
        let file_uuid = file.uuid;
        this.api.fetchFile(file_uuid).subscribe(file_data => {
          graphCsvBlob(graph_plugin_element.nativeElement, file_data, file_name);
          this.graphed = true;
        })
      }
    }
  }

  @ViewChild(GridstackComponent) grid_comp!: GridstackComponent;

  graphed: boolean = false;

  get persisted(): boolean {
    return !!this.record?.persist_date;
  }

  get private(): boolean {
    return this.record?.public_date;
  }

  get may_view(): boolean {
    return !this.record?.no_permissions;
  }

  get top_grid_options(): NgGridStackOptions {
    return static_top_grid_options;
  }

  private get grid() {
    return this.grid_comp?.grid;
  }

  constructor(private api: ApiService, private datasetService: DatasetService, private pluginsService: PluginsService, private cdr: ChangeDetectorRef,
    private viewContainerRef: ViewContainerRef) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if('record' in changes && this.may_view) {

      this.#applyPluginsToValues(this.record);

      if(this.name == undefined) {
        // Get name from fields
        if('fields' in this.record) {
          for(let field of this.record.fields) {
            if(field.name == 'name') {
              this.name = field.value;
              break;
            }
          }
        }
      }

      if(this.combined_dataset_template == undefined && 'dataset_uuid' in this.record) {
        let callback = (combined_dataset_template: any) => {
          this.combined_dataset_template = combined_dataset_template;
          if(this.name == undefined) {
            this.name = combined_dataset_template.name;
          }
          this.data_available = true;
          this.cdr.detectChanges();
          this.loadGridstackItems();
        }
        // can't just fetch the latest dataset. If record is persisted version, fetch dataset corresponding to that version. If draft, fetch latest combined_dataset_template.
        if(this.record.persist_date) {
          this.datasetService.fetchDatasetAndTemplateVersion(this.record.dataset_id).subscribe(callback);
        } else {
          this.datasetService.fetchLatestPersistedDatasetAndTemplate(this.record.dataset_uuid).subscribe(callback);
        }

      }
    }
  }

  private loadGridstackItems() {
    this.grid?.removeAll();

    this.grid?.batchUpdate();

    let view_settings = 'view_settings' in this.combined_dataset_template ? this.combined_dataset_template.view_settings : {};
    let fields_grid = view_settings.fields_grid;
    let field_uuids = this.record.fields.map((field: any) => field.uuid);
    let field_uuids_not_in_grid = new Set(field_uuids);

    if(fields_grid) {
      for(let child of fields_grid.children) {
        if(child.children) {
          let grandchild_list = [];
          for(let grandchild of child.children) {
            let field_uuid = grandchild.uuid;
            let field = this.appFieldSelectorFromUUID(field_uuid);
            if(field) {
              grandchild_list.push({x: grandchild.x, y: grandchild.y, w: grandchild.w, h: grandchild.h, el: field});
            }
            field_uuids_not_in_grid.delete(field_uuid);
          }
          this.grid?.addWidget({x: child.x, y: child.y, w: child.w, h: child.h, subGridOpts: {children: grandchild_list, ...static_sub_grid_options}});
        } else {
          let field_uuid = child.uuid;
          let field = this.appFieldSelectorFromUUID(field_uuid);
          if(field) {
            this.grid?.addWidget(field, {x: child.x, y: child.y, w: child.w, h: child.h});
          }
          field_uuids_not_in_grid.delete(field_uuid);
        }
      }
    }

    for(let field_uuid of field_uuids_not_in_grid.values()) {
      let field = this.appFieldSelectorFromUUID(field_uuid as string);
      if(field) {
        this.grid!.addWidget(field, {x:0, y: gridHeight(this.grid!)});
      }
    }

    this.grid?.commit();
  }

  private appFieldSelectorFromUUID(uuid: string) {
    const field = this.fieldFromUuid(uuid);
    if(!field) {
      return null;
    }
    return this.appFieldSelectorFromField(field);
  }

  private appFieldSelectorFromField(field: any) {
    const component = this.viewContainerRef.createComponent(FieldComponent);
    component.setInput('field', field);
    return component.location.nativeElement;
  }

  private fieldFromUuid(uuid: string) {
    for(let field of this.record.fields) {
      if(field.uuid == uuid) {
        return field;
      }
    }
    return null;
  }

  #applyPluginsToValues(record: any) {
    if(record.plugins) {
      this.#applyDatasetPluginsToRecord(record)
    }
    if(record.fields) {
      for(let field of record.fields) {
        this.#applyFieldPluginsToField(field);
      }
    }
    if(record.related_records) {
      for(let related_record of record.related_records) {
        this.#applyPluginsToValues(related_record);
      }
    }
  }

  #applyFieldPluginsToField(field: any) {
    const value = field.value;
    if(!value) {
      field.value_after_plugins = "";
      return;
    }
    // Plugins added by the backend before data is returned
    const plugins = field.plugins;
    let transformed_value = value;
    for(let plugin_name in plugins) {
      let plugin_version = plugins[plugin_name].version;
      let plugin = this.pluginsService.getFieldPlugin(plugin_name, plugin_version);
      if(plugin.instanceOfDataTransformer()) {
        let plugin_instance = new plugin();
        transformed_value = plugin_instance.transformData(transformed_value);
      }
    }
    field.value_after_plugins = transformed_value;
  }

  #applyDatasetPluginsToRecord(record: any) {
    // TODO: handle this later when I know more
    // const plugins = record.plugins;
    // for(let plugin_name in plugins) {
    //   let plugin_version = plugins[plugin_name];
    //   if(plugin_name == 'graph') {

    //   } else {
    //     console.log('unsupported plugin ' + plugin_name);
    //   }
    // }
  }


  // TODO: in dataset_edit, allow specifying which field should be used for the graph. This is a hack
  #findGraphFile() {
    let graph_file;
    for(let field of this.record.fields) {
      if(field.file) {
        if(field.file.name.endsWith('.csv')) {
          graph_file = field.file;
          break;
        }
      }
    }
    return graph_file;
  }

}
