import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-control-students-main-page',
  templateUrl: './control-students-main-page.component.html',
  styleUrls: ['./control-students-main-page.component.scss']
})
export class ControlStudentsMainPageComponent implements OnInit {
  public tab1 = false;
  public tab2 = false;
  public tab3 = false;
  public tab4 = false;


  constructor() {
    this.tab1 = true;
  }

  ngOnInit() {
  }

  loadTab(tab) {
    if (tab === 1) {
      this.tab1 = true;
      this.ngOnInit();
    }
    if (tab === 2) {
      this.tab2 = true;
      this.ngOnInit();
    }
    if (tab === 3) {
      this.tab3 = true;
      this.ngOnInit();
    }
    if (tab === 4) {
      this.tab4 = true;
      this.ngOnInit();
    }
  }

}
