import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as moment from 'moment';
import { iRequest } from 'src/app/entities/reception-act/request.model';
import { eRequest } from 'src/app/enumerators/reception-act/request.enum';
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { RequestService } from 'src/app/services/reception-act/request.service';

moment.locale('es');

@Component({
  selector: 'app-expedient',
  templateUrl: './expedient.component.html',
  styleUrls: ['./expedient.component.scss']
})
export class ExpedientComponent implements OnInit {
  public Request: iRequest;
  public role: string;
  public degree = '';

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
    console.log(this.Request);

    const acronym = this.Request.student.careerId.acronym;

    this.degree = this.Request.phase === eRequest.GENERATED
      || this.Request.phase === eRequest.TITLED
      ? acronym !== 'LA' && acronym !== 'ARQ'
        && acronym !== 'MCA' && acronym !== 'DCA'
        ? 'ING.' : acronym === 'LA'
          ? 'LIC.' : acronym === 'ARQ'
            ? 'ARQ.' : acronym === 'MCA'
              ? 'M.C.A.' : acronym === 'DCA'
                ? 'D.C.A.' : 'M.T.I' : '';
  }

  onClose() {
    this.dialogRef.close({ action: 'close' });
  }
}
