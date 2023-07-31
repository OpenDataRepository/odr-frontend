import { HttpErrorResponse } from "@angular/common/http";
import { catchError, Observable, of, switchMap, throwError } from "rxjs";
import { DatasetService } from "./dataset.service";

let datasetService: DatasetService;
const notFoundError = new HttpErrorResponse({status: 404});

it('can throw and catch errors', () => {
  let callback = () => {
    return throwError(() => notFoundError);
  }
  callback().pipe(
    catchError(err => {
      console.log('caught' + err);
      return of({});
    })
  ).subscribe();
});

describe('newEmptyDatasetAndTemplate', () => {
  it('should work', (done: DoneFn) => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['createTemplate', 'createDataset']);
    let return_template = {
      uuid: "t_uuid",
      _id: "t_id",
      name: "",
      updated_at: (new Date()).toISOString(),
      fields: [],
      related_templates: []
    };
    apiServiceSpy.createTemplate.and.returnValue(of(return_template));
    let return_dataset = {
      uuid: "d_uuid",
      _id: "d_id",
      template_id: "t_id",
      name: "",
      updated_at: (new Date()).toISOString(),
      related_datasets: []
    };
    apiServiceSpy.createDataset.and.returnValue(of(return_dataset));

    datasetService = new DatasetService(apiServiceSpy);
    datasetService.newEmptyDatasetAndTemplate().subscribe(combined => {
      expect(combined.dataset_uuid).toEqual(return_dataset.uuid);
      expect(combined.dataset_id).toEqual(return_dataset._id);
      expect(combined.template_uuid).toEqual(return_template.uuid);
      expect(combined.template_id).toEqual(return_template._id);
      expect(combined.name).toEqual(return_dataset.name);
      expect(combined.dataset_updated_at).toEqual(return_dataset.updated_at);
      expect(combined.template_updated_at).toEqual(return_template.updated_at);
      expect(combined.dataset_persist_date).toBe(undefined);
      expect(combined.fields.length).toBe(0);
      expect(combined.related_datasets.length).toBe(0);
      done();
    });
  });
});

describe('updateDatasetAndTemplate', () => {
  it('basic case with no children and not persisted yet', (done: DoneFn) => {

    let input = {
      dataset_uuid: "d_uuid",
      dataset_id: "d_id",
      template_uuid: "t_uuid",
      template_id: "t_id",
      name: "name",
      fields: [{
        name: "f_name",
        description: "f_description"
      }],
      related_datasets: []
    }

    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['updateTemplate', 'templateDraftExisting',
    'fetchTemplateDraft', 'fetchTemplateVersion', 'updateDataset', 'fetchDatasetDraft']);
    datasetService = new DatasetService(apiServiceSpy);

    apiServiceSpy.updateTemplate.and.returnValue(of({}));
    apiServiceSpy.templateDraftExisting.and.returnValue(of(true));
    let return_template = {
      uuid: input.template_uuid,
      _id: input.template_id,
      name: "",
      updated_at: (new Date()).toISOString(),
      fields: [{
        name: input.fields[0].name,
        description: input.fields[0].description,
        uuid: "f_uuid"
      }],
      related_templates: []
    };
    apiServiceSpy.fetchTemplateDraft.and.returnValue(of(return_template));
    let return_dataset = {
      uuid: input.dataset_uuid,
      _id: input.dataset_id,
      template_id: input.template_id,
      name: input.name,
      updated_at: (new Date()).toISOString(),
      related_datasets: []
    };
    apiServiceSpy.updateDataset.and.returnValue(of(return_dataset));

    // For call to fetchLatestDatasetAndTemplate
    apiServiceSpy.fetchDatasetDraft.and.returnValue(of({template_id: return_template._id}));
    apiServiceSpy.fetchTemplateVersion.and.returnValue(of({uuid: return_template.uuid}));
    apiServiceSpy.fetchTemplateDraft.and.returnValue(of(return_template));
    apiServiceSpy.fetchDatasetDraft.and.returnValue(of(return_dataset));
    apiServiceSpy.updateDataset.and.returnValue(of(return_dataset));

    datasetService = new DatasetService(apiServiceSpy);
    datasetService.updateDatasetAndTemplate(input).pipe(
      switchMap(() => datasetService.fetchLatestDatasetAndTemplate(input.dataset_uuid))
    ).subscribe(combined => {
      expect(combined.dataset_uuid).toEqual(input.dataset_uuid);
      expect(combined.dataset_id).toEqual(input.dataset_id);
      expect(combined.template_uuid).toEqual(input.template_uuid);
      expect(combined.template_id).toEqual(input.template_id);
      expect(combined.name).toEqual(input.name);
      expect(combined.dataset_updated_at).toEqual(return_dataset.updated_at);
      expect(combined.template_updated_at).toEqual(return_template.updated_at);
      expect(combined.dataset_persist_date).toBe(undefined);
      expect(combined.fields.length).toBe(1);
      expect(combined.fields[0].name).toBe(input.fields[0].name);
      expect(combined.fields[0].description).toBe(input.fields[0].description);
      expect(combined.fields[0].uuid).toBe(return_template.fields[0].uuid);
      expect(combined.related_datasets.length).toBe(0);
      done();
    });
  });
  it('already persisted, template changed, dataset and template have new _ids', (done: DoneFn) => {

    let input = {
      dataset_uuid: "d_uuid",
      dataset_id: "d_id",
      template_uuid: "t_uuid",
      template_id: "t_id",
      name: "name",
      fields: [],
      related_datasets: [
        {
          dataset_uuid: "d2_uuid",
          dataset_id: "d2_id",
          template_uuid: "t2_uuid",
          template_id: "t2_id",
          name: "name2",
          fields: [],
          related_datasets: []
        },
        {
          dataset_uuid: "d3_uuid",
          dataset_id: "d3_id",
          template_uuid: "t3_uuid",
          template_id: "t3_id",
          name: "name3",
          fields: [],
          related_datasets: []
        }
      ]
    }

    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['updateTemplate', 'templateDraftExisting',
    'fetchTemplateDraft', 'fetchTemplateVersion', 'updateDataset', 'fetchDatasetDraft', 'fetchDatasetLatestPersisted']);
    datasetService = new DatasetService(apiServiceSpy);

    apiServiceSpy.updateTemplate.and.returnValue(of({}));
    apiServiceSpy.templateDraftExisting.and.returnValue(of(true));
    let new_template = {
      uuid: input.template_uuid,
      _id: "t_id_updated",
      name: "",
      updated_at: (new Date()).toISOString(),
      fields: [],
      related_templates: [
        {
          uuid: input.related_datasets[0].template_uuid,
          _id: "t2_id_updated",
          name: "",
          updated_at: (new Date()).toISOString(),
          fields: [],
          related_templates: []
        },
        {
          uuid: input.related_datasets[1].template_uuid,
          _id: "t3_id_updated",
          name: "",
          updated_at: (new Date()).toISOString(),
          fields: [],
          related_templates: []
        }
      ]
    };
    apiServiceSpy.fetchTemplateDraft.and.returnValue(of(new_template));
    let return_dataset = {
      uuid: input.dataset_uuid,
      _id: "d_id_updated",
      template_id: new_template._id,
      template_uuid: new_template.uuid,
      name: input.name,
      updated_at: (new Date()).toISOString(),
      related_datasets: [
        {
          uuid: input.related_datasets[0].dataset_uuid,
          _id: "d2_id_updated",
          template_uuid: new_template.related_templates[0].uuid,
          template_id: new_template.related_templates[0]._id,
          name: input.related_datasets[0].name,
          updated_at: (new Date()).toISOString(),
          related_datasets: []
        },
        {
          uuid: input.related_datasets[1].dataset_uuid,
          _id: "d3_id_updated",
          template_uuid: new_template.related_templates[1].uuid,
          template_id: new_template.related_templates[1]._id,
          name: input.related_datasets[1].name,
          updated_at: (new Date()).toISOString(),
          related_datasets: []
        }
      ]
    };
    apiServiceSpy.updateDataset.and.returnValue(of(return_dataset));

    // For call to fetchLatestDatasetAndTemplate
    apiServiceSpy.fetchDatasetDraft.and.returnValue(of(return_dataset));
    apiServiceSpy.fetchTemplateVersion.withArgs(return_dataset.template_id).and.returnValue(of({uuid: new_template.uuid}));
    apiServiceSpy.updateDataset.and.returnValue(of(return_dataset));

    datasetService = new DatasetService(apiServiceSpy);
    datasetService.updateDatasetAndTemplate(input).pipe(
      switchMap(() => datasetService.fetchLatestDatasetAndTemplate(input.dataset_uuid))
    ).subscribe(combined => {
      expect(combined.dataset_uuid).toEqual(input.dataset_uuid);
      expect(combined.dataset_id).toEqual(return_dataset._id);
      expect(combined.template_uuid).toEqual(input.template_uuid);
      expect(combined.template_id).toEqual(new_template._id);
      expect(combined.name).toEqual(input.name);
      expect(combined.dataset_updated_at).toEqual(return_dataset.updated_at);
      expect(combined.template_updated_at).toEqual(new_template.updated_at);
      expect(combined.dataset_persist_date).toBe(undefined);
      expect(combined.fields.length).toBe(0);
      expect(combined.related_datasets.length).toBe(2);
      let first_related_dataset = combined.related_datasets[0];
      expect(first_related_dataset.dataset_uuid).toEqual(input.related_datasets[0].dataset_uuid);
      expect(first_related_dataset.dataset_id).toEqual(return_dataset.related_datasets[0]._id);
      expect(first_related_dataset.template_uuid).toEqual(input.related_datasets[0].template_uuid);
      expect(first_related_dataset.template_id).toEqual(new_template.related_templates[0]._id);
      expect(first_related_dataset.name).toEqual(input.related_datasets[0].name);
      expect(first_related_dataset.dataset_updated_at).toEqual(return_dataset.related_datasets[0].updated_at);
      expect(first_related_dataset.template_updated_at).toEqual(new_template.related_templates[0].updated_at);
      expect(first_related_dataset.dataset_persist_date).toBe(undefined);
      expect(first_related_dataset.fields.length).toBe(0);
      expect(first_related_dataset.related_datasets.length).toBe(0);
      let second_related_dataset = combined.related_datasets[1];
      expect(second_related_dataset.dataset_uuid).toEqual(input.related_datasets[1].dataset_uuid);
      expect(second_related_dataset.dataset_id).toEqual(return_dataset.related_datasets[1]._id);
      expect(second_related_dataset.template_uuid).toEqual(input.related_datasets[1].template_uuid);
      expect(second_related_dataset.template_id).toEqual(new_template.related_templates[1]._id);
      expect(second_related_dataset.name).toEqual(input.related_datasets[1].name);
      expect(second_related_dataset.dataset_updated_at).toEqual(return_dataset.related_datasets[1].updated_at);
      expect(second_related_dataset.template_updated_at).toEqual(new_template.related_templates[1].updated_at);
      expect(second_related_dataset.dataset_persist_date).toBe(undefined);
      expect(second_related_dataset.fields.length).toBe(0);
      expect(second_related_dataset.related_datasets.length).toBe(0);
      done();
    });
  });

  it('template referenced is deleted', (done: DoneFn) => {
    // persisted template is updated and then update removed - dataset still has valid template to point to

    let input = {
      dataset_uuid: "d_uuid",
      dataset_id: "d_id",
      template_uuid: "t_uuid",
      template_id: "t_id_updated",
      name: "name",
      fields: [],
      related_datasets: []
    }

    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['updateTemplate', 'templateDraftExisting',
    'fetchTemplateDraft', 'fetchTemplateLatestPersisted', 'fetchTemplateVersion', 'updateDataset', 'fetchDatasetDraft']);
    datasetService = new DatasetService(apiServiceSpy);

    apiServiceSpy.updateTemplate.and.returnValue(of({}));
    apiServiceSpy.templateDraftExisting.and.returnValue(of(false));
    let return_template = {
      uuid: input.template_uuid,
      _id: input.template_id,
      name: "",
      updated_at: (new Date()).toISOString(),
      persist_date: (new Date()).toISOString(),
      fields: [],
      related_templates: []
    };
    apiServiceSpy.fetchTemplateLatestPersisted.and.returnValue(of(return_template));
    let return_dataset = {
      uuid: input.dataset_uuid,
      _id: input.dataset_id,
      template_id: input.template_id,
      name: input.name,
      updated_at: (new Date()).toISOString(),
      related_datasets: []
    };
    apiServiceSpy.updateDataset.and.returnValue(of(return_dataset));

    // For call to fetchLatestDatasetAndTemplate
    apiServiceSpy.fetchDatasetDraft.and.returnValue(of({template_id: return_template._id}));
    apiServiceSpy.fetchTemplateVersion.and.returnValue(of({uuid: return_template.uuid}));
    apiServiceSpy.fetchTemplateDraft.and.returnValue(throwError(() => notFoundError));
    // apiServiceSpy.fetchTemplateLatestPersisted.and.returnValue(of(return_template));
    apiServiceSpy.fetchDatasetDraft.and.returnValue(of(return_dataset));
    // apiServiceSpy.updateDataset.and.returnValue(of(return_dataset));

    datasetService = new DatasetService(apiServiceSpy);
    datasetService.updateDatasetAndTemplate(input).pipe(
      switchMap(() => datasetService.fetchLatestDatasetAndTemplate(input.dataset_uuid))
    ).subscribe(combined => {
      expect(combined.dataset_uuid).toEqual(input.dataset_uuid);
      expect(combined.dataset_id).toEqual(input.dataset_id);
      expect(combined.template_uuid).toEqual(input.template_uuid);
      expect(combined.template_id).toEqual(input.template_id);
      expect(combined.name).toEqual(input.name);
      expect(combined.dataset_updated_at).toEqual(return_dataset.updated_at);
      expect(combined.template_updated_at).toEqual(return_template.updated_at);
      expect(combined.dataset_persist_date).toBe(undefined);
      expect(combined.fields.length).toBe(0);
      expect(combined.related_datasets.length).toBe(0);
      done();
    });
  });
});

describe('fetchLatestDatasetAndTemplate', () => {
  it('basic - template and dataset draft', (done: DoneFn) => {

    let return_template = {
      uuid: "t_uuid",
      _id: "t_id",
      name: "",
      updated_at: (new Date()).toISOString(),
      fields: [],
      related_templates: []
    };

    let return_dataset = {
      uuid: "d_uuid",
      _id: "d_id",
      template_id: return_template._id,
      template_uuid: return_template.uuid,
      name: "name",
      updated_at: (new Date()).toISOString(),
      related_datasets: []
    };

    let uuid = return_dataset.uuid;

    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['fetchDatasetDraft', 'fetchTemplateVersion',
      'fetchTemplateDraft', 'updateDataset']);
    datasetService = new DatasetService(apiServiceSpy);

    apiServiceSpy.fetchDatasetDraft.and.returnValue(of({template_id: return_template._id}));
    apiServiceSpy.fetchTemplateVersion.and.returnValue(of({uuid: return_template.uuid}));
    apiServiceSpy.fetchTemplateDraft.and.returnValue(of(return_template));
    apiServiceSpy.fetchDatasetDraft.and.returnValue(of(return_dataset));
    apiServiceSpy.fetchTemplateVersion.and.returnValue(of(return_template));
    apiServiceSpy.updateDataset.and.returnValue(of(return_dataset));

    datasetService = new DatasetService(apiServiceSpy);
    datasetService.fetchLatestDatasetAndTemplate(uuid).subscribe(combined => {
      expect(combined.dataset_uuid).toEqual(return_dataset.uuid);
      expect(combined.dataset_id).toEqual(return_dataset._id);
      expect(combined.template_uuid).toEqual(return_template.uuid);
      expect(combined.template_id).toEqual(return_template._id);
      expect(combined.name).toEqual(return_dataset.name);
      expect(combined.dataset_updated_at).toEqual(return_dataset.updated_at);
      expect(combined.template_updated_at).toEqual(return_template.updated_at);
      expect(combined.dataset_persist_date).toBe(undefined);
      expect(combined.fields.length).toBe(0);
      expect(combined.related_datasets.length).toBe(0);
      done();
    });

  });

  it('basic - template and dataset persisted', (done: DoneFn) => {

    let return_template = {
      uuid: "t_uuid",
      _id: "t_id",
      name: "",
      updated_at: (new Date()).toISOString(),
      persist_date: (new Date()).toISOString(),
      fields: [],
      related_templates: []
    };

    let return_dataset = {
      uuid: "d_uuid",
      _id: "d_id",
      template_id: return_template._id,
      template_uuid: return_template.uuid,
      name: "name",
      updated_at: (new Date()).toISOString(),
      persist_date: (new Date()).toISOString(),
      related_datasets: []
    };

    let uuid = return_dataset.uuid;

    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['fetchDatasetDraft', 'fetchDatasetLatestPersisted', 'fetchTemplateVersion',
      'fetchTemplateDraft', 'fetchTemplateLatestPersisted', 'updateDataset']);
    datasetService = new DatasetService(apiServiceSpy);

    apiServiceSpy.fetchDatasetDraft.and.returnValue(throwError(() => notFoundError));
    apiServiceSpy.fetchDatasetLatestPersisted.and.returnValue(of({template_id: return_template._id}));
    apiServiceSpy.fetchTemplateVersion.and.returnValue(of({uuid: return_template.uuid}));
    apiServiceSpy.fetchTemplateDraft.and.returnValue(throwError(() => notFoundError));
    apiServiceSpy.fetchTemplateLatestPersisted.and.returnValue(of(return_template));
    apiServiceSpy.fetchDatasetDraft.and.returnValue(throwError(() => notFoundError));
    apiServiceSpy.fetchDatasetLatestPersisted.and.returnValue(of(return_dataset));
    apiServiceSpy.fetchTemplateVersion.and.returnValue(of(return_template));
    apiServiceSpy.updateDataset.and.returnValue(throwError(() => notFoundError));
    apiServiceSpy.fetchDatasetLatestPersisted.and.returnValue(of(return_dataset));
    apiServiceSpy.fetchTemplateVersion.and.returnValue(of(return_template));

    datasetService = new DatasetService(apiServiceSpy);
    datasetService.fetchLatestDatasetAndTemplate(uuid).subscribe(combined => {
      expect(combined.dataset_uuid).toEqual(return_dataset.uuid);
      expect(combined.dataset_id).toEqual(return_dataset._id);
      expect(combined.template_uuid).toEqual(return_template.uuid);
      expect(combined.template_id).toEqual(return_template._id);
      expect(combined.name).toEqual(return_dataset.name);
      expect(combined.dataset_updated_at).toEqual(return_dataset.updated_at);
      expect(combined.template_updated_at).toEqual(return_template.updated_at);
      expect(combined.dataset_persist_date).toBe(return_dataset.persist_date);
      expect(combined.fields.length).toBe(0);
      expect(combined.related_datasets.length).toBe(0);
      done();
    });

  });

  it('template persisted and dataset draft', (done: DoneFn) => {

    let return_template = {
      uuid: "t_uuid",
      _id: "t_id",
      name: "",
      updated_at: (new Date()).toISOString(),
      persist_date: (new Date()).toISOString(),
      fields: [],
      related_templates: []
    };

    let return_dataset = {
      uuid: "d_uuid",
      _id: "d_id",
      template_id: return_template._id,
      template_uuid: return_template.uuid,
      name: "name",
      updated_at: (new Date()).toISOString(),
      related_datasets: []
    };

    let uuid = return_dataset.uuid;

    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['fetchDatasetDraft', 'fetchDatasetLatestPersisted', 'fetchTemplateVersion',
      'fetchTemplateDraft', 'fetchTemplateLatestPersisted', 'updateDataset']);
    datasetService = new DatasetService(apiServiceSpy);

    apiServiceSpy.fetchDatasetDraft.and.returnValue(of(return_dataset));
    apiServiceSpy.fetchTemplateVersion.and.returnValue(of({uuid: return_template.uuid}));
    apiServiceSpy.fetchTemplateDraft.and.returnValue(throwError(() => notFoundError));
    apiServiceSpy.fetchTemplateLatestPersisted.and.returnValue(of(return_template));
    apiServiceSpy.fetchDatasetDraft.and.returnValue(of(return_dataset));
    apiServiceSpy.fetchTemplateVersion.and.returnValue(of(return_template));
    apiServiceSpy.updateDataset.and.returnValue(of(return_dataset));
    apiServiceSpy.fetchTemplateVersion.and.returnValue(of(return_template));

    datasetService = new DatasetService(apiServiceSpy);
    datasetService.fetchLatestDatasetAndTemplate(uuid).subscribe(combined => {
      expect(combined.dataset_uuid).toEqual(return_dataset.uuid);
      expect(combined.dataset_id).toEqual(return_dataset._id);
      expect(combined.template_uuid).toEqual(return_template.uuid);
      expect(combined.template_id).toEqual(return_template._id);
      expect(combined.name).toEqual(return_dataset.name);
      expect(combined.dataset_updated_at).toEqual(return_dataset.updated_at);
      expect(combined.template_updated_at).toEqual(return_template.updated_at);
      expect(combined.dataset_persist_date).toBe(undefined);
      expect(combined.fields.length).toBe(0);
      expect(combined.related_datasets.length).toBe(0);
      done();
    });

  });

  it('dataset persisted and template draft - dataset draft is created', (done: DoneFn) => {

    let old_persist_date = new Date();

    let prev_persisted_template = {
      uuid: "t_uuid",
      _id: "t_id1",
      name: "template v1",
      updated_at: (new Date()).toISOString(),
      persist_date: old_persist_date,
      fields: [],
      related_templates: []
    };

    let prev_persisted_dataset = {
      uuid: "d_uuid",
      _id: "d_id1",
      template_id: prev_persisted_template._id,
      template_uuid: prev_persisted_template.uuid,
      name: "name",
      persist_date: old_persist_date,
      updated_at: (new Date()).toISOString(),
      related_datasets: []
    };

    let return_template = {
      uuid: "t_uuid",
      _id: "t_id2",
      name: "template v2",
      updated_at: (new Date()).toISOString(),
      fields: [],
      related_templates: []
    };

    let return_dataset = {
      uuid: "d_uuid",
      _id: "d_id2",
      template_id: return_template._id,
      template_uuid: return_template.uuid,
      name: "name",
      updated_at: (new Date()).toISOString(),
      related_datasets: []
    };

    let uuid = return_dataset.uuid;

    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['fetchDatasetDraft', 'fetchDatasetLatestPersisted', 'fetchTemplateVersion',
      'fetchTemplateDraft', 'fetchTemplateLatestPersisted', 'updateDataset']);
    datasetService = new DatasetService(apiServiceSpy);

    apiServiceSpy.fetchDatasetDraft.and.returnValue(throwError(() => notFoundError));
    apiServiceSpy.fetchDatasetLatestPersisted.and.returnValue(of({template_id: return_template._id}));
    apiServiceSpy.fetchTemplateVersion.and.returnValue(of({uuid: return_template.uuid}));
    apiServiceSpy.fetchTemplateDraft.and.returnValue(of(return_template));
    apiServiceSpy.fetchDatasetDraft.and.returnValue(throwError(() => notFoundError));
    apiServiceSpy.fetchDatasetLatestPersisted.and.returnValue(of(prev_persisted_dataset));
    apiServiceSpy.fetchTemplateVersion.and.returnValue(of(prev_persisted_template));
    apiServiceSpy.updateDataset.and.returnValue(of(return_dataset));

    datasetService = new DatasetService(apiServiceSpy);
    datasetService.fetchLatestDatasetAndTemplate(uuid).subscribe(combined => {
      expect(combined.dataset_uuid).toEqual(return_dataset.uuid);
      expect(combined.dataset_id).toEqual(return_dataset._id);
      expect(combined.template_uuid).toEqual(return_template.uuid);
      expect(combined.template_id).toEqual(return_template._id);
      expect(combined.name).toEqual(return_dataset.name);
      expect(combined.dataset_updated_at).toEqual(return_dataset.updated_at);
      expect(combined.template_updated_at).toEqual(return_template.updated_at);
      expect(combined.dataset_persist_date).toBe(undefined);
      expect(combined.fields.length).toBe(0);
      expect(combined.related_datasets.length).toBe(0);
      done();
    });

  });

  // it('related template has updated - template and dataset update', (done: DoneFn) => {

  //   let return_template = {
  //     uuid: "t_uuid",
  //     _id: "t_id",
  //     name: "",
  //     updated_at: (new Date()).toISOString(),
  //     fields: [],
  //     related_templates: [
  //       {
  //         uuid: "t2_uuid",
  //         _id: "t2_id",
  //         name: "",
  //         updated_at: (new Date()).toISOString(),
  //         fields: [],
  //         related_templates: []
  //       }
  //     ]
  //   };

  //   let original_dataset = {
  //     uuid: "d_uuid",
  //     _id: "d_id_prev",
  //     template_id: "other",
  //     name: "name",
  //     updated_at: (new Date()).toISOString(),
  //     persist_date: (new Date()).toISOString(),
  //     related_datasets: [{
  //       uuid: "d2_uuid",
  //       _id: "d2_id_prev",
  //       template_id: "other2",
  //       name: "name",
  //       updated_at: (new Date()).toISOString(),
  //       persist_date: (new Date()).toISOString(),
  //       related_datasets: []
  //     }]
  //   };

  //   let return_dataset = {
  //     uuid: "d_uuid",
  //     _id: "d_id",
  //     template_id: return_template._id,
  //     name: "name",
  //     updated_at: (new Date()).toISOString(),
  //     related_datasets: [{
  //       uuid: "d2_uuid",
  //       _id: "d2_id",
  //       template_id: return_template._id,
  //       name: "name",
  //       updated_at: (new Date()).toISOString(),
  //       related_datasets: []
  //     }]
  //   };

  //   let uuid = return_dataset.uuid;

  //   const apiServiceSpy = jasmine.createSpyObj('ApiService', ['fetchDatasetDraft', 'fetchDatasetLatestPersisted', 'fetchTemplateVersion',
  //     'fetchTemplateDraft', 'fetchTemplateLatestPersisted', 'updateDataset']);
  //   datasetService = new DatasetService(apiServiceSpy);

  //   apiServiceSpy.fetchDatasetDraft.and.returnValue(throwError(() => notFoundError));
  //   apiServiceSpy.fetchDatasetLatestPersisted.and.returnValue(of({template_id: return_template._id}));
  //   apiServiceSpy.fetchTemplateVersion.and.returnValue(of({uuid: return_template.uuid}));
  //   apiServiceSpy.fetchTemplateDraft.and.returnValue(of(return_template));
  //   apiServiceSpy.fetchDatasetDraft.and.returnValue(throwError(() => notFoundError));
  //   apiServiceSpy.fetchDatasetLatestPersisted.and.returnValue(of(return_dataset));
  //   // TODO: continue here
  //   apiServiceSpy.fetchTemplateVersion.and.returnValue(of(return_template));
  //   apiServiceSpy.updateDataset.and.returnValue(throwError(() => notFoundError));
  //   apiServiceSpy.fetchDatasetLatestPersisted.and.returnValue(of(return_dataset));
  //   apiServiceSpy.fetchTemplateVersion.and.returnValue(of(return_template));

  //   datasetService = new DatasetService(apiServiceSpy);
  //   datasetService.fetchLatestDatasetAndTemplate(uuid).subscribe(combined => {
  //     expect(combined.dataset_uuid).toEqual(return_dataset.uuid);
  //     expect(combined.dataset_id).toEqual(return_dataset._id);
  //     expect(combined.template_uuid).toEqual(return_template.uuid);
  //     expect(combined.template_id).toEqual(return_template._id);
  //     expect(combined.name).toEqual(return_dataset.name);
  //     expect(combined.dataset_updated_at).toEqual(return_dataset.updated_at);
  //     expect(combined.template_updated_at).toEqual(return_template.updated_at);
  //     expect(combined.dataset_persist_date).toBe(return_dataset.persist_date);
  //     expect(combined.fields.length).toBe(0);
  //     expect(combined.related_datasets.length).toBe(0);
  //     done();
  //   });

  // });

  // it('related template has new persisted version', (done: DoneFn) => {

  // });

  // it('related dataset has updated', (done: DoneFn) => {

  // });

  // it('related dataset has new persisted version', (done: DoneFn) => {

  // });

});

describe('persistDatasetAndTemplate', () => {
  it('No changes for template to persist - only dataset should be persisted', (done: DoneFn) => {

    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['persistTemplateDraft', 'persistDatasetDraft']);
    datasetService = new DatasetService(apiServiceSpy);

    apiServiceSpy.persistTemplateDraft.and.returnValue(throwError(() => new HttpErrorResponse({status: 400, error: "No changes to persist"})));
    apiServiceSpy.persistDatasetDraft.and.returnValue(of(null));

    datasetService = new DatasetService(apiServiceSpy);
    datasetService.persistDatasetAndTemplate({}).subscribe({
      next: () => done(),
      error: error => done.fail('error not caught'),
      complete: () => {}
    });
  });
});
