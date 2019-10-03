import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsValidComponent } from './documents-valid.component';

describe('DocumentsValidComponent', () => {
  let component: DocumentsValidComponent;
  let fixture: ComponentFixture<DocumentsValidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsValidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsValidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
