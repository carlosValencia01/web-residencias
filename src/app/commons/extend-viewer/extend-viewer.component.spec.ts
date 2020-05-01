import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendViewerComponent } from './extend-viewer.component';

describe('ExtendViewerComponent', () => {
  let component: ExtendViewerComponent;
  let fixture: ComponentFixture<ExtendViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtendViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
