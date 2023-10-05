import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { IonModal } from '@ionic/angular';
import { PermissionService } from 'src/app/api/permission.service';
import { EditPluginMap } from 'src/app/shared/plugin-map';
import { PluginsService } from 'src/app/shared/plugins.service';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent implements OnInit, OnChanges {

  @Input()
  form: FormGroup|any;

  @Input()
  disabled: boolean = false;

  @Input()
  template_uuid: string|undefined;

  @Output()
  remove: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('add_plugin_modal') add_plugin_modal!: IonModal;

  edit_permission = false;

  constructor(private permissionService: PermissionService, private pluginsService: PluginsService) {}

  ngOnInit() {
  }

  ngOnChanges() {
    if(!this.disabled && this.uuid) {
      this.permissionService.hasPermission(this.uuid.value, 'edit').subscribe(result => {this.edit_permission = result as boolean;});
      // this.permission_checked = true;
    }
  }

  get name() { return this.form.get('name'); }

  get description() { return this.form.get('description'); }

  get uuid() { return this.form.get('uuid'); }

  get public_date() { return this.form.get('public_date'); }

  get updated_at() { return this.form.get('updated_at'); }

  get type() { return this.form.get('type'); }

  get may_edit() { return !this.uuid || (!this.disabled && this.edit_permission); }

  get all_field_plugins(): Record<string, number[]> {
    return this.pluginsService.all_field_plugins;
  }

  get all_field_plugin_keys(): string[] {
    return this.pluginsService.all_field_plugins_keys;
  }

  get current_plugins(): EditPluginMap {
    return this.form.get('plugins')?.value;
  }

  get current_plugin_keys(): string[] {
    return this.current_plugins ? this.current_plugins.keys : [];
  }

  makePublic() {
    this.form.addControl('public_date', new FormControl((new Date()).toISOString()));
  }

  makePrivate() {
    this.form.removeControl('public_date');
  }

  confirmAddPluginModal(name: string) {
    let version = this.#latestPluginVersion(name);
    let options = this.#defaultPluginOptions(name, version);
    if(options) {
      this.addPlugin(name, version, options);
    } else {
      this.addPlugin(name, version);
    }
    this.add_plugin_modal.dismiss(null, 'confirm');
  }

  changePluginVersion(name: string, event: Event) {
    let version = (<any>event).detail.value;
    let plugin_options = this.getPluginOptions(name);
    if(!plugin_options) {
      plugin_options = this.#defaultPluginOptions(name, version);
    }
    if(plugin_options) {
      this.editPlugin(name, version, plugin_options);
    } else {
      this.editPlugin(name, version);
    }
  }

  changePluginOption(plugin_name: string, option_name: string, event: Event) {
    let version = this.getExistingPluginVersionOrLatest(plugin_name);
    let option_value = (<any>event).detail.value;
    let plugin_options = this.getPluginOptions(plugin_name);
    if(!plugin_options) {
      plugin_options = <Record<string, string[]>> this.#defaultPluginOptions(plugin_name, version);
    }
    plugin_options[option_name] = option_value;
    this.editPlugin(plugin_name, version, plugin_options);
  }

  #latestPluginVersion(plugin_name: string) {
    let versions = this.all_field_plugins[plugin_name];
    return versions[versions.length-1];
  }

  #defaultPluginOptions(plugin_name: string, plugin_version: number) {
    let plugin = this.pluginsService.getFieldPlugin(plugin_name, plugin_version);
    if(!plugin.instanceOfHasOptions()) {
      return null;
    }
    let potential_options = plugin.availableOptions();
    let default_options: any = {};
    for(let option_key in potential_options) {
      default_options[option_key] = potential_options[option_key][0];
    }
    return default_options;
  }

  getExistingPluginVersionOrLatest(plugin_name: string) {
    let current_plugin = this.current_plugins.get(plugin_name);
    if(current_plugin) {
      return current_plugin.version;
    }
    return this.#latestPluginVersion(plugin_name);
  }

  getExistingPluginOption(plugin_name: string, plugin_option_name: string) {
    let current_plugin = this.current_plugins.get(plugin_name);
    if(!current_plugin) {
      throw "Plugin doesn't exist";
    }
    return current_plugin.options[plugin_option_name];
  }

  getPluginOptions(plugin_name: string) {
    let current_plugin = this.current_plugins.get(plugin_name);
    if(!current_plugin) {
      return null;
    }
    let plugin_version = current_plugin.version;
    let plugin = this.pluginsService.getFieldPlugin(plugin_name, plugin_version);
    if(!plugin) {
      return null;
    }
    if(plugin.instanceOfHasOptions()) {
      return plugin.availableOptions();
    } else {
      return null;
    }
  }

  safeGetPluginOptions(plugin_name: string) {
    let options = this.getPluginOptions(plugin_name);
    if(options) {
      return options;
    } else {
      return {};
    }
  }

  getPluginOptionKeys(plugin_name: string) {
    const plugin_options = this.getPluginOptions(plugin_name);
    if(!plugin_options) {
      return null;
    }
    return Object.keys(plugin_options);
  }

  addPlugin(name: string, version: number, options?: any) {
    this.editPlugin(name, version, options);
  }

  editPlugin(name: string, version: number, options?: any) {
    let value: any = {
      version
    };
    if(options) {
      value.options = options;
    }
    this.current_plugins.set(name, value);
  }

  removePlugin(name: string) {
    this.current_plugins.delete(name);
  }

}
