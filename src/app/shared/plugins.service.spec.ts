import { TestBed } from '@angular/core/testing';

import { PluginsService } from './plugins.service';
import { HttpClient } from '@angular/common/http';

describe('PluginsService', () => {
  let service: PluginsService;

  beforeEach(() => {

    const httpMock: jasmine.SpyObj<HttpClient> = jasmine.createSpyObj('HttpClient', ['nomethod']);

    TestBed.configureTestingModule({
      providers: [
        {provide: HttpClient, useValue: httpMock}
      ]
    });
    service = TestBed.inject(PluginsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
