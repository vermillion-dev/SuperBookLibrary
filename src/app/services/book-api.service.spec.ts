import { TestBed } from '@angular/core/testing';

import { BookApiService } from './book-api.service';

describe('BookApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BookApiService = TestBed.get(BookApiService);
    expect(service).toBeTruthy();
  });
});
