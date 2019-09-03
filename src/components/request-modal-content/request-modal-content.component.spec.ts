import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestModalContentComponent } from './request-modal-content.component';

describe('RequestModalContentComponent', () => {
  let component: RequestModalContentComponent;
  let fixture: ComponentFixture<RequestModalContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestModalContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestModalContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
