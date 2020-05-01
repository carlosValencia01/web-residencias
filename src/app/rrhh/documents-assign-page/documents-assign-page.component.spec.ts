import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsAssignPageComponent } from './documents-assign-page.component';

describe('DocumentsAssignPageComponent', () => {
  let component: DocumentsAssignPageComponent;
  let fixture: ComponentFixture<DocumentsAssignPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsAssignPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsAssignPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
