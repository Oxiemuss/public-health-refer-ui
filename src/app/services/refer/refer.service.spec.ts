import { TestBed } from '@angular/core/testing';

import { ReferService } from './refer.service';

describe('ReferService', () => {
  let service: ReferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
