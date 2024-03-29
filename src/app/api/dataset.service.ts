import { Injectable } from '@angular/core';
import { catchError, of, switchMap, tap, throwError } from 'rxjs';
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
    return this.api.updateTemplate(template).pipe(
      switchMap(() => {
        return this.fetchLatestTemplate(template.uuid)
      }),
      switchMap((new_template: any) => {
        return this.modifyDatasetTemplate_idsToMatchUpdatedTemplate(dataset, new_template);
      }),
      switchMap((dataset) => {
        return this.api.updateDataset(dataset);
      })
    )
  }

  deleteDatasetTemplateDraft(dataset_uuid: string) {
    return this.fetchSyncedDatasetAndTemplateDraft(dataset_uuid).pipe(
      switchMap((combined_dataset_template) => {
        return this.api.deleteTemplateDraft(combined_dataset_template.template_uuid);
      }),
      catchError(() => {return of({})}),
      switchMap(() => {
        return this.safeDeleteDatasetDraft(dataset_uuid);
      })
    )
  }

  fetchLatestDatasetAndTemplate(dataset_uuid: string) {
    return this.fetchSyncedDatasetAndTemplateDraft(dataset_uuid).pipe(
      catchError(error => {
        if(error.status == 404 || error.status == 401) {
          return this.fetchLatestPersistedDatasetAndTemplate(dataset_uuid);
        } else {
          return throwError(() => error);
        }
      }),
    )
  }

  fetchDatasetAndTemplateVersion(dataset_id: string) {
    return this.api.fetchDatasetPersistedVersion(dataset_id).pipe(
      switchMap((dataset: any) => {
        return this.api.fetchTemplateVersion(dataset.template_id).pipe(
          switchMap((template) => {
            return of(this.combineTemplateAndDataset(template, dataset));
          })
        )
      })
    );
  }

  persistDatasetAndTemplate(combined_dataset_template: any) {
    return this.api.persistTemplateDraft(combined_dataset_template.template_uuid, combined_dataset_template.template_updated_at).pipe(
      catchError(error => {
        if(error.error == "No changes to persist") {
          return of(null);
        } else {
          return throwError(() => error);
        }
      }),
      switchMap(() => {
        return this.api.persistDatasetDraft(combined_dataset_template.dataset_uuid, combined_dataset_template.dataset_updated_at);
      })
    )
  }

  fetchLatestPersistedDatasetAndTemplate(dataset_uuid: string) {
    let return_dataset: any;
    return this.api.fetchDatasetLatestPersisted(dataset_uuid).pipe(
      switchMap((dataset: any) => {
        return_dataset = dataset;
        return this.api.fetchTemplateVersion(dataset.template_id)
      }),
      switchMap((template: any) => {
        return of(this.combineTemplateAndDataset(template, return_dataset));
      })
    )
  }

  private fetchSyncedDatasetAndTemplateDraft(dataset_uuid: string) {
    let final_template: any;
    return this.fetchLatestTemplateForDataset(dataset_uuid).pipe(
      catchError(error => {
        if(error.status == 404) {
          return this.safeDeleteDatasetDraft(dataset_uuid).pipe(
            switchMap(() => {
              console.log("Template doesn't exist, so dataset was automatically deleted.");
              return throwError(() => error);
            })
          )
        } else {
          return throwError(() => error);
        }
      }),
      switchMap((template: any) => {
        final_template = template;
        return this.fetchLatestDataset(dataset_uuid);
      }),
      switchMap((dataset: any) => {
        return this.modifyDatasetTemplate_idsToMatchUpdatedTemplate(dataset, final_template);
      }),
      switchMap((dataset: any) => {
        return this.api.updateDataset(dataset);
      }),
      switchMap((updated_dataset) => {
        console.log(final_template);
        console.log(updated_dataset);
        return of(this.combineTemplateAndDataset(final_template, updated_dataset));
      })
    )
  }

  private fetchLatestTemplateForDataset(dataset_uuid: string) {
    return this.fetchLatestDataset(dataset_uuid).pipe(
      switchMap((dataset: any) => {
        let template_id = dataset.template_id;
        return this.api.fetchTemplateVersion(template_id);
      }),
      switchMap((template_version: any) => {
        return this.api.fetchTemplateDraft(template_version.uuid).pipe(
          catchError(error => {
            if(error.status == 404) {
              return this.api.fetchTemplateLatestPersisted(template_version.uuid);
            } else {
              return throwError(() => error);
            }
          }),
        )
      })
    )
  }

  private fetchLatestDataset(dataset_uuid: string) {
    return this.api.fetchDatasetDraft(dataset_uuid).pipe(
      catchError(error => {
        if(error.status == 404) {
          return this.api.fetchDatasetLatestPersisted(dataset_uuid);
        } else {
          return throwError(() => error);
        }
      }),
    )
  }

  private splitTemplateAndDataset(combined: any){
    let template: any = {
      uuid: combined.template_uuid,
      fields: combined.fields,
      related_templates: [],
      plugins: combined.template_plugins,
      view_settings: combined.view_settings
    };
    let dataset: any = {
      name: combined.name,
      uuid: combined.dataset_uuid,
      template_id: combined.template_id,
      template_uuid: combined.template_uuid,
      related_datasets: [],
      plugins: combined.dataset_plugins
    };
    if(combined.public_date) {
      template.public_date = combined.public_date;
      dataset.public_date = combined.public_date;
    }
    if(combined.group_uuid) {
      dataset.group_uuid = combined.group_uuid;
    }
    if(combined.related_datasets) {
      for(let child of combined.related_datasets) {
        let separated_child = this.splitTemplateAndDataset(child);
        template.related_templates.push(separated_child.template);
        dataset.related_datasets.push(separated_child.dataset);
      }
    }
    return {template, dataset};
  }

  private combineTemplateAndDataset(template: any, dataset: any) {
    if(template == null) {
      throw new Error(`Dataset ${dataset.uuid} references template ${dataset.template_id}, which does not exist`)
    }
    if(dataset.no_permissions) {
      // Don't have view permissions.
      return {
        dataset_uuid: dataset.uuid,
        template_uuid: template.uuid,
        no_permissions: true
      }
    }
    if(template._id != dataset.template_id) {
      throw new Error(`Dataset ${dataset.uuid} has wrong template_id. Is ${dataset.template_id}. Should be ${template._id}`);
    }
    let template_map: any = {};
    if(template.related_templates) {
      for(let related_template of template.related_templates) {
        template_map[related_template._id] = related_template;
      }
    }
    let related_datasets: any = [];
    if(dataset.related_datasets) {
      for(let related_dataset of dataset.related_datasets) {
        if(!(related_dataset.template_id in template_map)) {
          console.error(`template_id ${related_dataset.template_id} does not exist on template ${JSON.stringify(template)}`);
          console.log('removing reference to dataset ' + related_dataset.uuid + ' since it references that template_id');
        }
        try {
          related_datasets.push(this.combineTemplateAndDataset(template_map[related_dataset.template_id], related_dataset));
        } catch (err){ console.error(err); console.error('removing reference to dataset ' + related_dataset.uuid); }
      }
    }
    return {
      dataset_uuid: dataset.uuid,
      dataset_id: dataset._id,
      template_uuid: template.uuid,
      template_id: template._id,
      name: dataset.name,
      group_uuid: dataset.group_uuid ? dataset.group_uuid : undefined,
      dataset_updated_at: dataset.updated_at,
      template_updated_at: template.updated_at,
      public_date: template.public_date ? template.public_date : dataset.public_date ? dataset.public_date : undefined,
      dataset_persist_date: dataset.persist_date,
      fields: template.fields,
      related_datasets,
      template_plugins: template.plugins ? template.plugins : {field_plugins: {}, object_plugins: {}},
      dataset_plugins: dataset.plugins ? dataset.plugins : {field_plugins: {}, object_plugins: {}},
      view_settings: template.view_settings
    };
  }

  private recursiveModifyDatasetTemplate_idsToMatchUpdatedTemplate(dataset: { [key: string]: any }, updated_template: { [key: string]: any }) {

    if(dataset['template_id'] != updated_template['_id']) {
      dataset['template_id'] = updated_template['_id'];
    }
    let updated_template_map: any = {};
    if(updated_template['related_templates']) {
      for(let related_template of updated_template['related_templates']) {
        updated_template_map[related_template.uuid] = related_template;
      }
    }
    if(dataset['related_datasets']) {
      for(let related_dataset of dataset['related_datasets']) {
        if(related_dataset.no_permissions) {
          // User doesn't have view permissions - shouldn't modify anything
          continue;
        }

        if(!(related_dataset.template_uuid in updated_template_map)) {
          throw new Error(`recursiveModifyDatasetTemplate_idsToMatchUpdatedTemplate: dataset ${related_dataset.uuid} references
          template ${related_dataset.template_id}, which is not designated by the parent template`);
        }
        let child_updated_template = updated_template_map[related_dataset.template_uuid];
        this.recursiveModifyDatasetTemplate_idsToMatchUpdatedTemplate(related_dataset, child_updated_template);
      }
    }
  }

  private modifyDatasetTemplate_idsToMatchUpdatedTemplate(dataset: any, updated_template: any) {
    this.recursiveModifyDatasetTemplate_idsToMatchUpdatedTemplate(dataset, updated_template);
    return of(dataset);
  }

  private fetchLatestTemplate(uuid: string) {
    return this.api.templateDraftExisting(uuid).pipe(
      switchMap((answer: any) => {
        if(answer) {
          return this.api.fetchTemplateDraft(uuid);
        } else {
          return this.api.fetchTemplateLatestPersisted(uuid);
        }
      })
    )
  }

  private safeDeleteDatasetDraft(uuid: string) {
    return this.api.deleteDatasetDraft(uuid).pipe(
      catchError(error => {
        if(error.status == 404) {
          return of(null);
        } else {
          return throwError(() => error);
        }
      })
    )
  }
}
