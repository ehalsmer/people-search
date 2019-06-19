import { TestBed } from '@angular/core/testing';

import { ChildServedService } from './child-served.service';

describe('ChildServedService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChildServedService = TestBed.get(ChildServedService);
    expect(service).toBeTruthy();
  });
});
