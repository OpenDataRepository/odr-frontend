import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/api/api.service';
import { PermissionService } from 'src/app/api/permission.service';
import { PluginsService } from 'src/app/shared/plugins.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'record-field-edit',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent implements OnInit, OnChanges {

  @Input()
  form: FormGroup|any = new FormGroup({value: new FormControl("")});

  @Input()
  disabled: boolean = false;

  @Output()
  remove: EventEmitter<void> = new EventEmitter<void>();

  edit_permission = true;
  value_after_plugins: any = null;

  constructor(private api: ApiService, private pluginsService: PluginsService) {}

  ngOnInit() {
    this.form.get('value').valueChanges.subscribe((new_value: string) => {
      // Update the second field based on the first field's value
      if(this.#hasTransformPlugin()) {
        this.value_after_plugins = this.#pluginsTransformedValue();
      }
    });
  }

  ngOnChanges() {
    // TODO: figure out if field should even have it's own permissions. For now, just share the permissions of the record it's on
    // if(!this.disabled && this.uuid) {
    //   this.permissionService.hasPermission(this.uuid.value, 'edit').subscribe(result => {this.edit_permission = result as boolean;});
    //   // this.permission_checked = true;
    // }
    if(this.#hasTransformPlugin()) {
      this.value_after_plugins = this.#pluginsTransformedValue();
    }
  }

  get uuid() { return this.form.get('uuid'); }

  get may_edit() { return !this.disabled && this.edit_permission; }

  get is_file() {
    const type = this.form.get('type');
    return type && type.value == 'File';
  }

  get file_uuid() {
    return this.form.get('file')?.value.uuid;
  }

  get file_name() {
    return this.form.get('file')?.value.name;
  }

  get file_upload_progress_map() {
    return this.form.get('file_upload_progress_map').value;
  }

  get plugins() {
    return this.form.get('plugins').value;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    const fileFormValue = {
      uuid: "new",
      name: file.name,
      front_end_uuid: uuidv4(),
      file_to_upload: file
    };
    if(this.form.contains('file')) {
      this.form.controls['file'].setValue(fileFormValue);
    } else {
      this.form.addControl("file", new FormControl(fileFormValue));
    }
  }

  downloadFile() {
    this.api.fetchFile(this.file_uuid).subscribe((response: any) => {
      // https://www.youtube.com/watch?v=tAIxMGUEMqE
      let blob: Blob = new Blob([response]);
      let a = document.createElement('a');
      a.download=this.file_name;
      a.href = window.URL.createObjectURL(blob);
      a.click();
    });
  }

  #hasTransformPlugin(): boolean {
    if(!this.plugins) {
      return false;
    }
    for(let plugin_name in this.plugins) {
      let plugin_version = this.plugins[plugin_name].version;
      let plugin = this.pluginsService.getFieldPlugin(plugin_name, plugin_version);
      if(plugin.instanceOfDataTransformer()) {
        return true;
      }
    }
    return false;
  }

  #pluginsTransformedValue(): any {

    const value = this.form.get('value').value;
    if(!value) {
      return null;
    }
    // Plugins added by the backend before data is returned
    let transformed_value = value;
    for(let plugin_name in this.plugins) {
      let plugin_version = this.plugins[plugin_name].version;
      let plugin = this.pluginsService.getFieldPlugin(plugin_name, plugin_version);
      if(plugin.instanceOfDataTransformer()) {
        let plugin_instance = new plugin();
        transformed_value = plugin_instance.transformData(transformed_value);
      }
    }
    return transformed_value;
  }

}
