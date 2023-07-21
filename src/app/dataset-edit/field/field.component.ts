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

  @ViewChild(IonModal) add_plugin_modal!: IonModal;

  edit_permission = false;

  constructor(private permissionService: PermissionService, private pluginsService: PluginsService) {}

  ngOnInit() {}

  ngOnChanges() {
    if(!this.disabled && this.uuid) {
      this.permissionService.hasPermission(this.uuid.value, 'edit').subscribe(result => {this.edit_permission = result as boolean;});
      // this.permission_checked = true;
    }
  }

  get name() { return this.form.get('name'); }

  get uuid() { return this.form.get('uuid'); }

  get public_date() { return this.form.get('public_date'); }

  get updated_at() { return this.form.get('updated_at'); }

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

  cancelAddPluginModal() {
    this.add_plugin_modal.dismiss(null, 'cancel');
  }
  confirmAddPluginModal(name: string, event: Event) {
    let version = (<any>event).detail.value;
    this.addPlugin(name, version);
    this.add_plugin_modal.dismiss(null, 'confirm');
  }

  latestPluginVersion(plugin_name: string): number {
    let versions = this.all_field_plugins[plugin_name] as number[];
    return versions[versions.length-1];
  }

  addPlugin(name: string, version: number) {
    this.current_plugins.set(name, version);
  }

  editPlugin(name: string, version: number) {
    this.current_plugins.set(name, version);
  }

  removePlugin(name: string) {
    this.current_plugins.delete(name);
  }

}
