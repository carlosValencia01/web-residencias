import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CookiesService } from 'src/services/cookie.service';

@Component({
  selector: 'app-academic-degree-application-page',
  templateUrl: './academic-degree-application-page.component.html',
  styleUrls: ['./academic-degree-application-page.component.scss']
})
export class AcademicDegreeApplicationPageComponent implements OnInit {

  SteepOneCompleted: boolean = true;
  isLinear: boolean = true;

  constructor(
    private cookiesService: CookiesService,
    private router: Router,
  ) {
    if (this.cookiesService.getData().user.role !== 2) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
  }

}
