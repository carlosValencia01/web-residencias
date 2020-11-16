import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnglishStudentsListPageComponent } from './english-students-list-page.component';

describe('EnglishStudentsListPageComponent', () => {
  let component: EnglishStudentsListPageComponent;
  let fixture: ComponentFixture<EnglishStudentsListPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnglishStudentsListPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnglishStudentsListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
