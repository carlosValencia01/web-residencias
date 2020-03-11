import { Component, OnInit, Inject } from '@angular/core';
import { uRequest } from 'src/entities/reception-act/request';
import { iRequest } from 'src/entities/reception-act/request.model';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { IStudent } from 'src/entities/shared/student.model';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { StudentProvider } from 'src/providers/shared/student.prov';

@Component({
  selector: 'app-act-notificacion',
  templateUrl: './act-notificacion.component.html',
  styleUrls: ['./act-notificacion.component.scss']
})
export class ActNotificacionComponent implements OnInit {
  public jury: any;
  public oficio: string;
  public existError: boolean;
  public oRequest: uRequest;
  private _Request: iRequest;

  constructor(
    public _ImageToBase64Service: ImageToBase64Service,
    public _RequestProvider: RequestProvider,
    public _NotificationsServices: NotificationsServices,
    public dialogRef: MatDialogRef<ActNotificacionComponent>,
    public _CookiesService: CookiesService,
    public _StudentProvider: StudentProvider,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.jury = 'Presidente';
    this.oficio = ''; 
    
    this._RequestProvider.getRequestById(data.Appointment.id).subscribe(
      request => {
        this._Request = request.request[0];
        this._Request.student = <IStudent>request.request[0].studentId;
        this._Request.studentId = this._Request.student._id;
        this.oRequest = new uRequest(request.request[0], _ImageToBase64Service, this._CookiesService);  
        
      }, _ => {
        this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Solicitud no encontrada');
        this.dialogRef.close();
      }
    );
  }

  ngOnInit() {
  }

  async Generar() {
    this.existError = this.oficio.trim().length === 0;
    if (!this.existError) {
      let juryGenderAndGrade = [];
      let studentGender = 'MASCULINO';
      let bossGender = 'MASCULINO';
      await this._StudentProvider.getStudentById(this._Request.studentId).toPromise().then(
        st=> studentGender = st.student[0].sex
      ).catch(err=>{});

      await this._RequestProvider.getEmployeeGenderAndGrade(this._Request.jury[0].email ? this._Request.jury[0].email : this._Request.jury[0].name).toPromise().then(
        (em)=>juryGenderAndGrade.push({gender:em.gender,grade:em.grade})           
      ).catch( err=> juryGenderAndGrade.push({gender:'MASCULINO',grade:'C.'}));
      await this._RequestProvider.getEmployeeGenderAndGrade(this._Request.jury[1].email ? this._Request.jury[1].email : this._Request.jury[1].name).toPromise().then(
          (em)=>juryGenderAndGrade.push({gender:em.gender,grade:em.grade})          
      ).catch( err=> juryGenderAndGrade.push({gender:'MASCULINO',grade:'C.'}));
      await this._RequestProvider.getEmployeeGenderAndGrade(this._Request.jury[2].email ? this._Request.jury[2].email : this._Request.jury[2].name).toPromise().then(
          (em)=>juryGenderAndGrade.push({gender:em.gender,grade:em.grade})          
      ).catch( err=> juryGenderAndGrade.push({gender:'MASCULINO',grade:'C.'}));
      await this._RequestProvider.getEmployeeGenderAndGrade(this._Request.jury[3].email ? this._Request.jury[3].email : this._Request.jury[3].name).toPromise().then(
          (em)=>juryGenderAndGrade.push({gender:em.gender,grade:em.grade})          
      ).catch( err=> juryGenderAndGrade.push({gender:'MASCULINO',grade:'C.'}));
      await this._RequestProvider.getEmployeeGender(this._Request.department.boss).toPromise().then(
          (em)=>bossGender = em.gender          
      ).catch( err=> bossGender = 'MASCULINO');
      switch (this.jury) {
        case 'Presidente':
          window.open(this.oRequest.juryDuty(this.oficio, 'Presidente', this._Request.jury[0].name,juryGenderAndGrade[0],studentGender,bossGender).output('bloburl'), '_blank');
          break;
        case 'Secretario':
          window.open(this.oRequest.juryDuty(this.oficio, 'Secretario', this._Request.jury[1].name,juryGenderAndGrade[1],studentGender,bossGender).output('bloburl'), '_blank');
          break;
        case 'Vocal':
          window.open(this.oRequest.juryDuty(this.oficio, 'Vocal', this._Request.jury[2].name,juryGenderAndGrade[2],studentGender,bossGender).output('bloburl'), '_blank');
          break;
        case 'Suplente':
          window.open(this.oRequest.juryDuty(this.oficio, 'Suplente', this._Request.jury[3].name,juryGenderAndGrade[3],studentGender,bossGender).output('bloburl'), '_blank');
          break;
        default:
          break;
      }
    }
  }
}
