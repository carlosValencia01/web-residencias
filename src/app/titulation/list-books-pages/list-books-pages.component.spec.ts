import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBooksPagesComponent } from './list-books-pages.component';

describe('ListBooksPagesComponent', () => {
  let component: ListBooksPagesComponent;
  let fixture: ComponentFixture<ListBooksPagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListBooksPagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListBooksPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
