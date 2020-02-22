import { Component, OnInit } from '@angular/core';
import { CookiesService } from 'src/services/app/cookie.service';

import { eRole } from 'src/enumerators/app/role.enum';

@Component({
  selector: 'app-progress-page',
  templateUrl: './progress-page.component.html',
  styleUrls: ['./progress-page.component.scss']
})
export class ProgressPageComponent implements OnInit {
  
  phasesLiberation = ['Liberado'];
  phasesDocuments = ['Entregado'];
  phasesContinue = ['Realizado','Generado','Titulado'];
  role: string;
  constructor(  
    private _CookiesService: CookiesService    
  ) {    
    this.role = this._CookiesService.getData().user.rol.name.toLowerCase();
  }

  ngOnInit() {
   switch (this.role) {
      case eRole.CHIEFACADEMIC.toLowerCase(): {
        this.role = 'boss';
        break;
      }
      case eRole.COORDINATION.toLowerCase(): {
        this.role = 'coordination';
        break;
      }
      case eRole.SECRETARYACEDMIC.toLowerCase(): {
        this.role = 'secretary';
        break;
      }
      case eRole.HEADSCHOOLSERVICE.toLowerCase(): {
        this.role = 'escolares';
        break;
      }
      case eRole.STUDENTSERVICES.toLowerCase(): {
        this.role = 'services';
        break;
      }
      default: {
        this.role = 'administrator';
        break;
      }
    }
  }

}