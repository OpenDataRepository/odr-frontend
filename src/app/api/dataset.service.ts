import { Injectable } from '@angular/core';
import { of, switchMap } from 'rxjs';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class DatasetService {

  constructor(private api: ApiService) { }

  newEmptyDatasetAndTemplate() {
    let new_template: any;
    return this.api.createTemplate({}).pipe(
      switchMap((template: any) => {
        new_template = template;
        return this.api.createDataset({template_id: template._id})
      }),
      switchMap((dataset: any) => {
        return of(this.combineTemplateAndDataset(new_template, dataset));
      })
    )
  }

  updateDatasetAndTemplate(combined_dataset_template: any) {
    let split_dataset_template = this.splitTemplateAndDataset(combined_dataset_template);
    let template = split_dataset_template.template;
    let dataset = split_dataset_template.dataset;
    let updated_template: any;
    return this.api.updateTemplate(template).pipe(
      switchMap(() => {
        return this.api.fetchTemplateDraft(template.uuid)
      }),
      switchMap((new_template) => {
        updated_template = new_template;
        return this.api.updateDataset(dataset)
      }),
      switchMap((updated_dataset) => {
        return of(this.combineTemplateAndDataset(updated_template, updated_dataset));
      })
    )
  }

  fetchDatasetAndTemplate(dataset_uuid: string) {
    let return_dataset: any;
    return this.api.fetchDatasetDraft(dataset_uuid).pipe(
      switchMap((dataset: any) => {
        return_dataset = dataset;
        return this.api.fetchTemplateVersion(dataset.template_id)
      }),
      switchMap((template: any) => {
        return of(this.combineTemplateAndDataset(template, return_dataset));
      })
    )
  }

  private splitTemplateAndDataset(combined: any){
    let template: any = {
      uuid: combined.template_uuid,
      fields: combined.fields,
      related_templates: []
    };
    let dataset: any = {
      name: combined.name,
      uuid: combined.dataset_uuid,
      template_id: combined.template_id,
      related_datasets: []
    };
    for(let child of combined.related_datasets) {
      let separated_child = this.splitTemplateAndDataset(child);
      template.related_templates.push(separated_child.template);
      dataset.related_datasets.push(separated_child.dataset);
    }
    return {template, dataset};
  }

  private combineTemplateAndDataset(template: any, dataset: any) {
    if(template == null) {
      throw new Error(`Dataset ${dataset.uuid} references template ${dataset.template_id}, which does not exist`)
    }
    if(template._id != dataset.template_id) {
      throw new Error(`Dataset ${dataset.uuid} has wrong template_id. Is ${dataset.template_id}. Should be ${template._id}`);
    }
    let template_map: any = {};
    for(let related_template of template.related_templates) {
      template_map[related_template._id] = related_template;
    }
    let related_datasets: any = [];
    for(let related_dataset of dataset.related_datasets) {
      related_datasets.push(this.combineTemplateAndDataset(template_map[related_dataset.template_id], related_dataset))
    }
    return {
      dataset_uuid: dataset.uuid,
      template_uuid: template.uuid,
      template_id: template._id,
      name: dataset.name,
      fields: template.fields,
      related_datasets
    };
  }
}
