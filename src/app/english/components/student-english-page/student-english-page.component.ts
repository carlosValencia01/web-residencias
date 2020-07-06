import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookiesService } from 'src/app/services/app/cookie.service';


@Component({
  selector: 'app-student-english-page',
  templateUrl: './student-english-page.component.html',
  styleUrls: ['./student-english-page.component.scss']
})
export class StudentEnglishPageComponent implements OnInit {

  constructor(
    private _CookiesService: CookiesService,
    private _ActivatedRoute: ActivatedRoute,
    private router: Router,

  ) { 
    if (!this._CookiesService.isAllowed(this._ActivatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
  }

}
