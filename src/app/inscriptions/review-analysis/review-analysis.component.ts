import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, ShowOnDirtyErrorStateMatcher } from '@angular/material';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-review-analysis',
  templateUrl: './review-analysis.component.html',
  styleUrls: ['./review-analysis.component.scss']
})
export class ReviewAnalysisComponent implements OnInit {

  title = 'ANÁLISIS CLÍNICOS';
  studentData;
  docAnalisis;
  pdfSrc;
  loading : boolean;
  showDocument = false;
  observations;

  constructor(
    public dialogRef: MatDialogRef<ReviewAnalysisComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private inscriptionsProv: InscriptionsProvider,
    private studentProv: StudentProvider,    
    private notificationsServices: NotificationsServices,
  ) {
    this.studentData = this.data.student;
    this.observations = this.data.student.observationsAnalysis ? this.data.student.observationsAnalysis : '';
    this.getAnalysis();
   }

  ngOnInit() {
  }

  onClose(){
    this.dialogRef.close({action:'close'});
  }

  getAnalysis(){
    this.studentProv.getDriveDocuments(this.studentData._id.toString()).subscribe(
      files=>{
        let documents = files.documents;
        this.docAnalisis = documents.filter( docc => docc.filename.indexOf('CLINICOS') !== -1)[0];
        this.showAnalysis(this.docAnalisis);
      }
    );
  }

  filterDocuments(filename) {
    return this.studentData.documents.filter(function (alumno) {
      return alumno.filename.toLowerCase().indexOf(filename.toLowerCase()) > -1;
    });
  }

  showAnalysis(analysis){
    this.loading=true;
    this.inscriptionsProv.getFile(analysis.fileIdInDrive,analysis.filename).subscribe(data => {
      var docdata = data.file;
      let buff = new Buffer(docdata.data);
      this.pdfSrc = buff;
      this.showDocument=true;
    },(err)=>{},()=>this.loading=false);
  }

  async saveObservationsGood(observaciones,warning) {
    this.loading=true;
    await this.inscriptionsProv.updateStudent({observationsAnalysis:observaciones,warningAnalysis:warning},this.studentData._id).subscribe(res => {
    }, err=>{},
    ()=>{
      this.loading=false
      this.onClose();
      this.notificationsServices.showNotification(eNotificationType.SUCCESS, 'Éxito', 'Observaciones Guardadas.');
    });
  }

  async saveObservationsBad(observaciones,warning) {
    this.loading=true;
    await this.inscriptionsProv.updateStudent({observationsAnalysis:observaciones,warningAnalysis:warning},this.studentData._id).subscribe(res => {
      this.inscriptionsProv.sendNotification(this.studentData.email,"Observaciones de Análisis Clínicos",this.studentData.fullName,observaciones,"Observaciones Análisis Clínicos","Consultorio Médico <cmedico@ittepic.edu.mx>").subscribe(
        res => {
          this.notificationsServices.showNotification(0, 'Observaciones enviadas a:', this.studentData.controlNumber);
        },
        err => {
          this.notificationsServices.showNotification(1, 'No se pudo enviar el correo a:', this.studentData.controlNumber);
        }
      );
    }, err=>{},
    ()=>{
      this.loading=false
      this.onClose();
    });
  }

  observationsGood(){
    if(this.observations == ''){
      const id = 'observaciones';
      Swal.fire({
        title: 'Observaciones',
        imageUrl: '../../../assets/icons/listgraduation.svg',
        imageWidth: 100,
        imageHeight: 100,
        imageAlt: 'Custom image',
        html:
          '<textarea rows="4" cols="30" id="observaciones">Todo bien, sigue así. </textarea>  ',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Guardar'
      }).then((result) => {
        if (result.value) {
          const observations = (<HTMLInputElement>document.getElementById(id)).value;
          this.saveObservationsGood(observations,false);
        }
      });
    } else {
      const id = 'observaciones';
      Swal.fire({
        title: 'Observaciones',
        imageUrl: '../../../assets/icons/listgraduation.svg',
        imageWidth: 100,
        imageHeight: 100,
        imageAlt: 'Custom image',
        html:
          '<textarea rows="4" cols="30" id="observaciones">'+this.observations+'</textarea>  ',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Guardar'
      }).then((result) => {
        if (result.value) {
          const observations = (<HTMLInputElement>document.getElementById(id)).value;
          this.saveObservationsGood(observations,false);
        }
      });
    }
  }

  observationsBad(){
    if(this.observations == ''){
      const id = 'observaciones';
      Swal.fire({
        title: 'Observaciones',
        imageUrl: '../../../assets/icons/listgraduation.svg',
        imageWidth: 100,
        imageHeight: 100,
        imageAlt: 'Custom image',
        html:
          '<textarea rows="4" cols="30" id="observaciones">FAVOR DE ACUDIR INMEDIATAMENTE AL CONSULTORIO MÉDICO DEL INSTITUTO. </textarea>  ',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Guardar'
      }).then((result) => {
        if (result.value) {
          const observations = (<HTMLInputElement>document.getElementById(id)).value;
          this.saveObservationsBad(observations,true);
        }
      });
    } else {
      const id = 'observaciones';
      Swal.fire({
        title: 'Observaciones',
        imageUrl: '../../../assets/icons/listgraduation.svg',
        imageWidth: 100,
        imageHeight: 100,
        imageAlt: 'Custom image',
        html:
          '<textarea rows="4" cols="30" id="observaciones">'+this.observations+'</textarea>  ',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Guardar'
      }).then((result) => {
        if (result.value) {
          const observations = (<HTMLInputElement>document.getElementById(id)).value;
          this.saveObservationsBad(observations,true);
        }
      });
    }
  }

}
