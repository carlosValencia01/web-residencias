import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, ShowOnDirtyErrorStateMatcher } from '@angular/material';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { StudentProvider } from 'src/providers/shared/student.prov';

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

  async saveObservations() {
    this.loading=true;
    this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Guardando Observaciones.', '');
    await this.inscriptionsProv.updateStudent({observationsAnalysis:this.observations},this.studentData._id).subscribe(res => {
    }, err=>{},
    ()=>{
      this.loading=false
      this.onClose();
      this.notificationsServices.showNotification(eNotificationType.SUCCESS, 'Éxito', 'Observaciones Guardadas.');
    });
  }

  async updateStudent(data, id) {
   
  }

  observationsGood(){
    if(this.observations != ''){
      this.observations += ' ';
    }
    this.observations += "Todo bien, sigue así. ";
  }

  observationsBad(){
    if(this.observations != ''){
      this.observations += ' ';
    }
    this.observations += "FAVOR DE ACUDIR INMEDIATAMENTE AL CONSULTORIO MÉDICO. ";
  }

}
