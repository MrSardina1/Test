import { TestBed } from '@angular/core/testing';

import { UserManagement } from './user-management.service';

describe('UserManagementService', () => {
  let service: UserManagement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserManagement);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
