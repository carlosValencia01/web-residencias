import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FromGenerateGroupsComponent } from './from-generate-groups.component';

describe('FromGenerateGroupsComponent', () => {
  let component: FromGenerateGroupsComponent;
  let fixture: ComponentFixture<FromGenerateGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FromGenerateGroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FromGenerateGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
