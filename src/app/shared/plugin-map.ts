class ViewPluginMap {
  protected combined_object = {};
  public keys: string[] = [];

  constructor(protected template_map: Record<string, any>, protected dataset_map: Record<string, any>) {
    this.combined_object = merge(template_map, dataset_map);
    this.keys = Object.keys(this.combined_object);
  }

  get(name: string): any {
    if(name in this.dataset_map) {
      let value = this.dataset_map[name];
      if(value == 'deleted') {
        return null;
      } else {
        return value;
      }
    }
    if(name in this.template_map) {
      return this.template_map[name];
    }
    return null;
  }

}

class EditPluginMap extends ViewPluginMap {

  constructor(template_map: Record<string, any>, dataset_map: Record<string, any>, private template_edit_permisson: boolean) {
    super(template_map, dataset_map);
  }

  add(name: string, value: any) {
    this.set(name, value);
  }

  edit(name: string, value: any) {
    this.set(name, value);
  }

  set(name: string, value: any) {
    if(name in this.dataset_map || !this.template_edit_permisson) {
      this.dataset_map[name] = value;
    }
    else {
      this.template_map[name] = value;
    }
    this.generateKeys();
  }

  delete(name: string) {
    if(name in this.dataset_map) {
      delete this.dataset_map[name];
    }
    if(name in this.template_map) {
      if(this.template_edit_permisson) {
        delete this.template_map[name];
      } else {
        this.dataset_map[name] = 'deleted';
      }
    }
    this.generateKeys();
  }

  private generateKeys() {
    this.combined_object = merge(this.template_map, this.dataset_map);
    this.keys = Object.keys(this.combined_object);
  }

}

function merge(template_map: Record<string, any>, dataset_map: Record<string, any>) {
  return {...template_map, ...dataset_map};
}

export { ViewPluginMap, EditPluginMap }
