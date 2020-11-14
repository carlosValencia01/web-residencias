import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnglishClassroomsListPageComponent } from './english-classrooms-list-page.component';

describe('EnglishClassroomsListPageComponent', () => {
  let component: EnglishClassroomsListPageComponent;
  let fixture: ComponentFixture<EnglishClassroomsListPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnglishClassroomsListPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnglishClassroomsListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
