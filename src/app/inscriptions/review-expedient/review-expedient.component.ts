import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import Swal from 'sweetalert2';
import { ExpedientHistoryComponent } from '../expedient-history/expedient-history.component';

@Component({
  selector: 'app-review-expedient',
  templateUrl: './review-expedient.component.html',
  styleUrls: ['./review-expedient.component.scss']
})
export class ReviewExpedientComponent implements OnInit {


  pdfSrc;
  image;
  viewdoc: boolean = false;
  prevCard;
  showDocument = false;
  typeDocShow: string;
  docDisplayName: string;
  docto;
  refused;
  showInputCurp = false;
  showInputNss = false;


  checkAll = false;
  pendings: number;
  selectPendings = 0;
  degree: string;
  documents = [];
  constructor(
    public dialogRef: MatDialogRef<ReviewExpedientComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private studentProv: StudentProvider,
    private inscriptionsProv: InscriptionsProvider,
    private notificationsServices: NotificationsServices,
    public dialog: MatDialog,
    private loadingService: LoadingService,
  ) {
    this.degree = this.data.student.careerId.acronym === 'DCA' ? 'doc' : this.data.student.careerId.acronym === 'MCA' || this.data.student.careerId.acronym === 'MTI' ? 'mas' : 'lic';

    this.studentProv.refreshNeeded$.subscribe(
      () => {
        this.getDocuments();
      }
    );
    this.getDocuments();
  }

  ngOnInit() {
  }

  onClose() {
    this.dialogRef.close({ action: 'close' });
  }

  swalDialog(title, msg, type) {
    return Swal.fire({
      title: title,
      text: msg,
      type: type,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.value) return true;
      else return false;
    });
  }
  swalDialogInput(title,msg) {
    return Swal.fire({
      title: title,
      text: msg,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar',
      input: 'text'
    }).then((result) => {
      return result.value ?  result.value !== '' ? result.value : false : false;
    });
  }
  getDocuments() {
    this.studentProv.getDocumentsInscription(this.data.student.controlNumber,this.degree).subscribe(
      (docs)=>{
        this.documents = docs.docs;
        console.log(this.documents);

        this.docto = this.docto ? this.documents.filter(docc => docc.file.filename === this.docto.file.filename)[0] : null;
        this.pendings = this.documents.filter( (doc)=> doc.status !== 'ACEPTADO').length;
        this.selectPendings = 0;
        if(this.docto == null){
          this.cardClick('COMPROBANTE');
        }
      }
    );

  }

  cardClick(card) {
    if(card === 'CURP'){
      this.showInputCurp = true;
    } else {this.showInputCurp = false;}
    if(card === 'NSS'){
      this.showInputNss = true;
    } else {this.showInputNss = false;}
    if (card === this.prevCard) {
      this.viewdoc = !this.viewdoc;
    } else {
      this.prevCard = card;
      this.viewdoc = true;
    }
    if (this.viewdoc) {
      this.getPdf(card);
    }
  }
  closeDoc() {
    this.viewdoc = false;
    this.prevCard = '';
  }

  getPdf(docname) {

    this.docto = this.documents.filter((doc)=>doc.file.shortName == docname)[0];
      this.showDocument = false;

      this.typeDocShow = docname === 'FOTO' ? 'image' : 'pdf';
      this.docDisplayName = docname;
      this.loadingService.setLoading(true);
      this.inscriptionsProv.getFile(this.docto .fileIdInDrive, this.docto.file.filename).subscribe(data => {
        var docdata = data.file;

        if (this.typeDocShow === 'pdf') {
          let buffCurp = new Buffer(docdata.data);
          this.pdfSrc = buffCurp;
        } else if (this.typeDocShow === 'image') {
          this.image = 'data:image/png;base64,' + docdata;
        }
        this.showDocument = true;
      }, (err) => { }, () => this.loadingService.setLoading(false));

  }

  async changeStatus(action) {

    this.refused = '';
    const msg = action === 'RECHAZADO' ? 'rechazar' : this.data.user === 'Secretaria escolares' ? 'validar' : 'aceptar';
    let confirmdialog = false;
    if(action === 'ACEPTADO' || action === 'VALIDADO'){
      confirmdialog = await this.swalDialog(`¿ Está seguro de ${msg} el documento ?`, '', 'question');
    } else {
      confirmdialog = await this.swalDialogInput('RECHAZAR '+this.docDisplayName,'Especifique el motivo');
    }
    console.log(this.docto.file);

    if (confirmdialog) {
      const documentInfo = {
        filename: this.docto.file.filename,
        status: {
          name: action,
          active: true,
          message: action === 'RECHAZADO' ? 'Documento rechazado' : this.data.user === 'Secretaria escolares' ? 'Documento validado' : 'Documento aceptado',
          observation: action === 'RECHAZADO' ? confirmdialog : ''
        }
      };
      this.studentProv.updateDocumentStatus(this.data.student._id, documentInfo).subscribe(
        res => {
          this.notificationsServices.showNotification(eNotificationType.SUCCESS,
            'Exito', 'Estatus actualizado correctamente.');
           console.log(this.data.student);

          if (action == "RECHAZADO") {
            this.inscriptionsProv.sendNotification(this.data.student.email, "Documento Rechazado para Expediente", this.data.student.fullName, "El documento "+this.docto.file.fullName+" fue RECHAZADO y necesita ser cambiado desde la opción 'Mi Expediente' en https://mitec.ittepic.edu.mx/", "Documento para Expediente Rechazado", "Servicios Escolares <servescolares@ittepic.edu.mx>").subscribe(
              res => {
                this.notificationsServices.showNotification(eNotificationType.SUCCESS, 'Notificación enviada a:', this.data.student.email);
              },
              err => {
                this.notificationsServices.showNotification(eNotificationType.ERROR, 'No se pudo enviar el correo a:', this.data.student.email);
              }
            );
          }
          this.changeExpedientStatus();
        },
        err => console.log(err)
      );
    }
  }

  changeExpedientStatus(){
    setTimeout(() => {
      const processDocs = this.documents.filter( (doc)=> doc.status === 'EN PROCESO').length;
      const validatedDocs = this.documents.filter( (doc)=> doc.status === 'VALIDADO').length;
      const aceptedDocs = this.documents.filter( (doc)=> doc.status === 'ACEPTADO').length;
      const totalDocs = processDocs + validatedDocs + aceptedDocs;

      if(this.degree === 'lic'){
         // Cambiar estatus a ACEPTADO
         if(aceptedDocs === 7 || aceptedDocs === 8){
           this.inscriptionsProv.updateStudent({inscriptionStatus:"Aceptado"},this.data.student._id).subscribe(res => { });
          return;
         }
         if(validatedDocs === 7 || validatedDocs === 8){
          // Cambiar estatus a VALIDADO
          this.inscriptionsProv.updateStudent({inscriptionStatus:"Verificado"},this.data.student._id).subscribe(res => { });
          return;
         }
      }
      if(this.degree === 'mas'){
         // Cambiar estatus a ACEPTADO
         if(aceptedDocs === 10){
           this.inscriptionsProv.updateStudent({inscriptionStatus:"Aceptado"},this.data.student._id).subscribe(res => { });
          return;
         }
         if(validatedDocs === 10){
          // Cambiar estatus a VALIDADO
          this.inscriptionsProv.updateStudent({inscriptionStatus:"Verificado"},this.data.student._id).subscribe(res => { });
          return;
         }
      }
      if(this.degree === 'doc'){
         // Cambiar estatus a ACEPTADO
         if(aceptedDocs === 10){
           this.inscriptionsProv.updateStudent({inscriptionStatus:"Aceptado"},this.data.student._id).subscribe(res => { });
          return;
         }
         if(validatedDocs === 10){
          // Cambiar estatus a VALIDADO
          this.inscriptionsProv.updateStudent({inscriptionStatus:"Verificado"},this.data.student._id).subscribe(res => { });
          return;
         }
      }
      if(processDocs === 0){
        // Cambiar estatus a EN PROCESO
        let query = { inscriptionStatus:"En Proceso" };
        const _student = this.data && this.data.student;
        if (totalDocs === 2 && aceptedDocs === 2 && _student && _student.stepWizard === 2) {
          query['stepWizard'] = 3;
        }
       this.inscriptionsProv.updateStudent(query, this.data.student._id).subscribe(res => {  });
       return;
      }
    }, 500);
  }

  history() {

    const linkModal = this.dialog.open(ExpedientHistoryComponent, {
      data: {
        student: this.data.student._id,
        filename: this.docDisplayName,
        status: this.docto.history.reverse()
      },
      disableClose: true,
      hasBackdrop: true,
      width: '50em',
      height: '520px'
    });
  }
  checkChange(index){

    this.documents[index].checked = !this.documents[index].checked;
    this.selectPendings = this.getDocsPending().length;
  }

  selectAll(){
    this.documents.forEach( (doc,index)=>{
      this.documents[index].checked = this.pendings == this.selectPendings ? false : true;
    });
    this.selectPendings = this.getDocsPending().length;
  }
  getDocsPending(): Array<any>{
     return this.documents.filter((doc)=> doc.checked == true && doc.status !== 'ACEPTADO');
  }
  async acceptManyDocuments() {


    let updateDocs = this.getDocsPending() ;

    let confirmdialog = await this.swalDialog(`¿ Está seguro de aceptar ${updateDocs.length} documentos ?`, '', 'question');

    if (confirmdialog) {
      this.pendings = 0;
      for await (const doc of updateDocs){
        const documentInfo = {
          filename: doc.file.filename,
          status: {
            name: 'ACEPTADO',
            active: true,
            message: 'Documento aceptado',
            observation: ''
          }
        };
        this.studentProv.updateDocumentStatus(this.data.student._id, documentInfo).toPromise().then(
          res => {
            this.notificationsServices.showNotification(eNotificationType.SUCCESS,
              'Exito', 'Estatus actualizado correctamente.');
          },
          err => console.log(err)
        );
      }
      this.changeExpedientStatus();
    }
  }
  updateCurp(){
    this.studentProv.updateStudent(this.data.student._id,{curp:this.data.student.curp}).subscribe(up=>{
      this.swalDialogCurpNss('Curp actualizada correctamente.');
    }, err=>{console.log(err);
    });
  }

  updateNss(){
    this.studentProv.updateStudent(this.data.student._id,{nss:this.data.student.nss}).subscribe(up=>{
      this.swalDialogCurpNss('NSS actualizado correctamente.');
    }, err=>{console.log(err);
    });
  }

  swalDialogCurpNss(msg) {
    return Swal.fire({
      title: 'Exito',
      type: 'success',
      text: msg,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Aceptar'
    }).then((result) => {

    });
  }

}
