import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { GridstackComponent, NgGridStackOptions } from 'gridstack/dist/angular';
import { default_base_grid_options, gridHeight } from 'src/app/shared/gridstack-settings';
import { FieldComponent } from '../field/field.component';

@Component({
  selector: 'dataset-view',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss'],
})
export class DatasetComponent implements OnInit {

  @Input()
  dataset: any = {};

  @ViewChild(GridstackComponent) grid_comp!: GridstackComponent;

  private static base_grid_options : NgGridStackOptions = { // base grid options
    acceptWidgets: false,
    staticGrid: true,
    ...default_base_grid_options
  };
  private static sub_grid_options : NgGridStackOptions = { // sub grid options
    column: 'auto',
    ...DatasetComponent.base_grid_options
  };
  top_grid_options : NgGridStackOptions = { // main grid options
    column: 6,
    subGridOpts: DatasetComponent.sub_grid_options,
    ...DatasetComponent.base_grid_options
  };

  private get persisted(): boolean {
    return !!this.dataset?.dataset_persist_date;
  }

  get public(): boolean {
    return !!this.dataset?.public_date;
  }

  private hasViewPermission(): boolean {
    return !!this.dataset?.dataset_updated_at;
  }

  get may_view(): boolean {
    return this.public || this.hasViewPermission();
  }

  private get grid() {
    return this.grid_comp?.grid;
  }

  objectKeys(options: any) {
    return Object.keys(options);
  }

  constructor(private viewContainerRef: ViewContainerRef, private cdr: ChangeDetectorRef) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if('dataset' in changes && 'fields' in this.dataset) {
      this.cdr.detectChanges();
      this.loadGridstackItems();
    }
  }

  // TODO: this function is very similar to loadGridstackItems in dataset edit component. Try to refactor to share code.
  private loadGridstackItems() {
    this.grid?.removeAll();

    this.grid?.batchUpdate();

    let view_settings = 'view_settings' in this.dataset ? this.dataset.view_settings : {};
    let fields_grid = view_settings.fields_grid;
    let field_uuids = this.dataset.fields.map((field: any) => field.uuid);
    let field_uuids_not_in_grid = new Set(field_uuids);

    if(fields_grid) {
      for(let child of fields_grid.children) {
        if(child.children) {
          let grandchild_list = [];
          for(let grandchild of child.children) {
            let field_uuid = grandchild.uuid;
            let field = this.appFieldSelectorFromUUID(field_uuid);
            grandchild_list.push({x: grandchild.x, y: grandchild.y, w: grandchild.w, h: grandchild.h, el: field});
            field_uuids_not_in_grid.delete(field_uuid);
          }
          this.grid?.addWidget({x: child.x, y: child.y, w: child.w, h: child.h, subGridOpts: {children: grandchild_list, ...DatasetComponent .sub_grid_options}});
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
      this.grid!.addWidget(field, {x:0, y: gridHeight(this.grid!)});
    }

    this.grid?.commit();
  }

  private appFieldSelectorFromUUID(uuid: string) {
    const field = this.fieldFromUuid(uuid);
    return this.appFieldSelectorFromField(field);
  }

  private appFieldSelectorFromField(field: any) {
    const component = this.viewContainerRef.createComponent(FieldComponent);
    component.setInput('field', field);
    component.setInput('template_uuid', this.dataset.template_uuid);
    return component.location.nativeElement;
  }

  private fieldFromUuid(uuid: string) {
    for(let field of this.dataset.fields) {
      if(field.uuid == uuid) {
        return field;
      }
    }
    return undefined;
  }

}
