import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsAdminPageComponent } from './documents-admin-page.component';

describe('DocumentsAdminPageComponent', () => {
  let component: DocumentsAdminPageComponent;
  let fixture: ComponentFixture<DocumentsAdminPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsAdminPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsAdminPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
