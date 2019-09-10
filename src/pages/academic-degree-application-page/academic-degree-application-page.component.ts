import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CookiesService } from 'src/services/cookie.service';

@Component({
  selector: 'app-academic-degree-application-page',
  templateUrl: './academic-degree-application-page.component.html',
  styleUrls: ['./academic-degree-application-page.component.scss']
})
export class AcademicDegreeApplicationPageComponent implements OnInit {
  private user: any;
  public allowSection: boolean;

  constructor(
    private cookiesService: CookiesService,
    private router: Router,
  ) {
    this.user = this.cookiesService.getData().user;
    if (this.user.role !== 2) {
      this.router.navigate(['/']);
    }
    this.allowSection = this.user.status === 'egresado' && this.user.english;
  }

  ngOnInit() {
  }

}
