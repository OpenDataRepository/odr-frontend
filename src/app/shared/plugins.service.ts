import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as pluginsImport from '../../plugins/plugins';
const pluginsFunctionObject = pluginsImport as Record<string, any>;
const plugins_path = '../../plugins';
const config_path = plugins_path + '/plugins.yml';

@Injectable({
  providedIn: 'root'
})
export class PluginsService {

  all_field_plugins: Record<string, number[]> = {};
  all_dataset_plugins: Record<string, number[]> = {};

  all_field_plugins_keys: string[] = [];
  all_dataset_plugins_keys: string[] = [];

  constructor(private http: HttpClient) {
    const setClassVariables = (config: any) => {
      config = config.default; // I don't know why everything is in default
      this.all_field_plugins = config.field_plugins;
      this.all_dataset_plugins = config.dataset_plugins;
      this.all_field_plugins_keys  = Object.keys(this.all_field_plugins);
      this.all_dataset_plugins_keys = Object.keys(this.all_dataset_plugins);
    }
    // https://www.youtube.com/watch?v=GUJ9FGHIKnA
    if(environment.production) {
      // TODO: production code has not been tested
      http.get(config_path).subscribe((config: any) => {
        setClassVariables(config);
      })
    } else {
      const config = require('yaml-loader!../../plugins/plugins.yml');
      setClassVariables(config);
    }
  }

  getFieldPluginFunction(name: string, version: number) {
    return pluginsFunctionObject['field_plugins'][name][version];
  }
}
