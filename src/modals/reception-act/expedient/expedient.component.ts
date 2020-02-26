import { Component, OnInit, Inject } from '@angular/core';
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { iRequest } from 'src/entities/reception-act/request.model';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { eFILES } from 'src/enumerators/reception-act/document.enum';
import { ExtendViewerComponent } from 'src/modals/shared/extend-viewer/extend-viewer.component';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { uRequest } from 'src/entities/reception-act/request';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import { ObservationsComponentComponent } from 'src/modals/reception-act/observations-component/observations-component.component';
import { eStatusRequest } from 'src/enumerators/reception-act/statusRequest.enum';
import * as moment from 'moment';
import { RequestService } from 'src/services/reception-act/request.service';
import { eRequest } from 'src/enumerators/reception-act/request.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { eFOLDER } from 'src/enumerators/shared/folder.enum';

moment.locale('es');

@Component({
  selector: 'app-expedient',
  templateUrl: './expedient.component.html',
  styleUrls: ['./expedient.component.scss']
})
export class ExpedientComponent implements OnInit {

  public Request: iRequest;
 
  public role: string;

  degree: string = '';
  constructor(
    public requestProvider: RequestProvider,
    public dialog: MatDialog,
    public imgSrv: ImageToBase64Service,
    public _RequestService: RequestService,
    private _CookiesService: CookiesService,
    public dialogRef: MatDialogRef<ExpedientComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.role = this._CookiesService.getData().user.rol.name.toLowerCase();
    this.init();
   }

  ngOnInit() {
  }

  init() {
    this.Request = this.data.request;
    const acronym = this.Request.careerAcronym;
    
    this.degree = 
    this.Request.phase === eRequest.GENERATED || this.Request.phase === eRequest.TITLED ? 
    acronym != 'LA' && acronym != 'ARQ' && acronym != 'MCA' && acronym != 'DCA' ? 'ING.' 
    : acronym == 'LA' ? 'LIC.' 
    : acronym == 'ARQ' ? 'ARQ.' 
    : acronym == 'MCA' ? 'M.C.A.'    
    : acronym == 'DCA' ? 'D.C.A.' 
    :'M.T.I' : '';
    
  }

  

  onClose() {
    this.dialogRef.close({ action: 'close' });
  }
}

