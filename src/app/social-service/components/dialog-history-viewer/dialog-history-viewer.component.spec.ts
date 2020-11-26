import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogHistoryViewerComponent } from './dialog-history-viewer.component';

describe('DialogHistoryViewerComponent', () => {
  let component: DialogHistoryViewerComponent;
  let fixture: ComponentFixture<DialogHistoryViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogHistoryViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogHistoryViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
