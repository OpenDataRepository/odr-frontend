import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/api/api.service';
import { PluginsService } from 'src/app/shared/plugins.service';
// import { saveAs } from 'file-saver';
const GraphPlugin = require('../../../plugins/dataset_plugins/graph/0.1/plugin')

@Component({
  selector: 'record-view',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss'],
})
export class RecordComponent implements OnInit, OnChanges {

  @Input()
  record: any = {};

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
          GraphPlugin(graph_plugin_element.nativeElement, file_data, file_name);
          this.graphed = true;
        })
      }
    }
  }

  graphed: boolean = false;

  get persisted(): boolean {
    return !!this.record?.persist_date;
  }

  get private(): boolean {
    return this.record?.public_date;
  }

  get hasViewPermission(): boolean {
    return !this.record?.no_permissions;
  }

  constructor(private api: ApiService, private pluginsService: PluginsService) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if(changes['record']) {
      this.#applyPluginsToValues(this.record);
    }
  }

  downloadFile(file_uuid: string, file_name: string) {
    this.api.fetchFile(file_uuid).subscribe((response: any) => {
      // https://www.youtube.com/watch?v=tAIxMGUEMqE
      let blob: Blob = new Blob([response]);
      let a = document.createElement('a');
      a.download=file_name;
      a.href = window.URL.createObjectURL(blob);
      a.click();
    });

    // TODO: switch to better alternative:
    // this.api.fetchFile(file_uuid).subscribe(file_data => {
    //   saveAs(file_data, file_name);
    // })
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
    const plugins = field.plugins;
    let value_after_plugins = value;
    for(let plugin_name in plugins) {
      let plugin_version = plugins[plugin_name];
      let pluginFunction = this.pluginsService.getFieldPluginFunction(plugin_name, plugin_version);
      value_after_plugins = pluginFunction(value_after_plugins);
    }
    field.value_after_plugins = value_after_plugins;
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
