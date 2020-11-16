import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnglishTeachersListPageComponent } from './english-teachers-list-page.component';

describe('EnglishTeachersListPageComponent', () => {
  let component: EnglishTeachersListPageComponent;
  let fixture: ComponentFixture<EnglishTeachersListPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnglishTeachersListPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnglishTeachersListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
