import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionsAdminComponent } from './permissions-admin.component';

describe('PermissionsAdminComponent', () => {
  let component: PermissionsAdminComponent;
  let fixture: ComponentFixture<PermissionsAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PermissionsAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
