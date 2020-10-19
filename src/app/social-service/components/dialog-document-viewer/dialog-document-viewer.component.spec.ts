import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDocumentViewerComponent } from './dialog-document-viewer.component';

describe('DialogDocumentViewerComponent', () => {
  let component: DialogDocumentViewerComponent;
  let fixture: ComponentFixture<DialogDocumentViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogDocumentViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDocumentViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
