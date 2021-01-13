import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAcceptCommitmentComponent } from './dialog-accept-commitment.component';

describe('DialogAcceptCommitmentComponent', () => {
  let component: DialogAcceptCommitmentComponent;
  let fixture: ComponentFixture<DialogAcceptCommitmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogAcceptCommitmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAcceptCommitmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
