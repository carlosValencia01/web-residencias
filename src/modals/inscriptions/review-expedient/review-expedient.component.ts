import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, Validators, FormControl } from '@angular/forms';


import { StudentProvider } from 'src/providers/shared/student.prov';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';

import Swal from 'sweetalert2';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { ExpedientHistoryComponent } from 'src/modals/inscriptions/expedient-history/expedient-history.component';

@Component({
  selector: 'app-review-expedient',
  templateUrl: './review-expedient.component.html',
  styleUrls: ['./review-expedient.component.scss']
})
export class ReviewExpedientComponent implements OnInit {

  title = 'Dictaminar expediente';

  curpDoc;
  nssDoc;
  imageDoc;
  payDoc;
  certificateDoc;
  actaDoc;
  clinicDoc;
  pdfSrc;
  cartaDoc;
  image;
  viewdoc: boolean;
  prevCard;
  showDocument = false;
  typeDocShow: string;
  docDisplayName: string;
  docto;  
  refused;
  loading = false;

  acceptDocuments = [
    { filename: '', checkActa: false, status: false, statusname: '' },
    { filename: '', checkCurp: false, status: false, statusname: '' },
    { filename: '', checkNss: false, status: false, statusname: '' },
    { filename: '', checkPhoto: false, status: false, statusname: '' },
    { filename: '', checkCertificate: false, status: false, statusname: '' },
    { filename: '', checkPay: false, status: false, statusname: '' },
    { filename: '', checkClinic: false, status: false, statusname: '' },
    { filename: '', checkCarta: false, status: false, statusname: '' },
  ];

  checkAll = false;
  pendings: number;
  selectPendings = 0;

  constructor(
    public dialogRef: MatDialogRef<ReviewExpedientComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private studentProv: StudentProvider,
    private inscriptionsProv: InscriptionsProvider,
    private notificationsServices: NotificationsServices,
    public dialog: MatDialog,
  ) {

    console.log(data);
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
      // console.log(result);
      
      return result.value ?  result.value !== '' ? result.value : false : false;
    });
  }
  getDocuments() {
    this.studentProv.getDriveDocuments(this.data.student._id).subscribe(
      docs => {
        let documents = docs.documents;
        ;
        
        
        this.payDoc = documents.filter(docc => docc.filename.indexOf('COMPROBANTE') !== -1)[0];
        this.docto = this.docto ? documents.filter(docc => docc._id === this.docto._id)[0] : null;

        if(this.docto == null){
          this.cardClick('comprobante');
        }
        this.pendings = 0;
        this.selectPendings = 0;
        this.curpDoc = documents.filter(docc => docc.filename.indexOf('CURP') !== -1)[0];
        this.nssDoc = documents.filter(docc => docc.filename.indexOf('NSS') !== -1)[0];
        this.imageDoc = documents.filter(docc => docc.filename.indexOf('FOTO') !== -1)[0];
        this.certificateDoc = documents.filter(docc => docc.filename.indexOf('CERTIFICADO') !== -1)[0];
        this.actaDoc = documents.filter(docc => docc.filename.indexOf('ACTA') !== -1)[0];
        this.clinicDoc = documents.filter(docc => docc.filename.indexOf('CLINICOS') !== -1)[0];
        this.cartaDoc = documents.filter(docc => docc.filename.indexOf('COMPROMISO') !== -1)[0];
        if (this.imageDoc) {
          this.imageDoc.status = this.imageDoc ? this.imageDoc.status.filter(st => st.active === true)[0].name : '';
          this.acceptDocuments[3].filename = this.imageDoc.filename;
          this.acceptDocuments[3].statusname = this.imageDoc.status;
          this.pendings = this.imageDoc.status === 'VALIDADO' || this.imageDoc.status === 'EN PROCESO' || this.imageDoc.status === 'RECHAZADO' ? ++this.pendings : this.pendings;
        }
        if (this.cartaDoc) {
          this.cartaDoc.status = this.cartaDoc ? this.cartaDoc.status.filter(st => st.active === true)[0].name : '';
          this.acceptDocuments[7].filename = this.cartaDoc.filename;
          this.acceptDocuments[7].statusname = this.cartaDoc.status;
          this.pendings = this.cartaDoc.status === 'VALIDADO' || this.cartaDoc.status === 'EN PROCESO' || this.cartaDoc.status === 'RECHAZADO' ? ++this.pendings : this.pendings;
        }

        if (this.curpDoc) {
          this.curpDoc.status = this.curpDoc ? this.curpDoc.status.filter(st => st.active === true)[0].name : '';
          this.acceptDocuments[1].filename = this.curpDoc.filename;
          this.acceptDocuments[1].statusname = this.curpDoc.status;
          this.pendings = this.curpDoc.status === 'VALIDADO' || this.curpDoc.status === 'EN PROCESO' || this.curpDoc.status === 'RECHAZADO' ? ++this.pendings : this.pendings;
        }

        if (this.actaDoc) {
          this.actaDoc.status = this.actaDoc ? this.actaDoc.status.filter(st => st.active === true)[0].name : '';
          this.acceptDocuments[0].filename = this.actaDoc.filename;
          this.acceptDocuments[0].statusname = this.actaDoc.status;
          this.pendings = this.actaDoc.status === 'VALIDADO' || this.actaDoc.status === 'EN PROCESO' || this.actaDoc.status === 'RECHAZADO' ? ++this.pendings : this.pendings;
        }
        if (this.clinicDoc) {
          this.clinicDoc.status = this.clinicDoc ? this.clinicDoc.status.filter(st => st.active === true)[0].name : '';
          this.acceptDocuments[6].filename = this.clinicDoc.filename;
          this.acceptDocuments[6].statusname = this.clinicDoc.status;
          this.pendings = this.clinicDoc.status === 'VALIDADO' || this.clinicDoc.status === 'EN PROCESO' || this.clinicDoc.status === 'RECHAZADO' ? ++this.pendings : this.pendings;
        }

        if (this.certificateDoc) {
          this.certificateDoc.status = this.certificateDoc ? this.certificateDoc.status.filter(st => st.active === true)[0].name : '';
          this.acceptDocuments[4].filename = this.certificateDoc.filename;
          this.acceptDocuments[4].statusname = this.certificateDoc.status;
          this.pendings = this.certificateDoc.status === 'VALIDADO' || this.certificateDoc.status === 'EN PROCESO' || this.certificateDoc.status === 'RECHAZADO' ? ++this.pendings : this.pendings;
        }

        if (this.payDoc) {
          this.payDoc.status = this.payDoc ? this.payDoc.status.filter(st => st.active === true)[0].name : '';
          this.acceptDocuments[5].filename = this.payDoc.filename;
          this.acceptDocuments[5].statusname = this.payDoc.status;
          this.pendings = this.payDoc.status === 'VALIDADO' || this.payDoc.status === 'EN PROCESO' || this.payDoc.status === 'RECHAZADO' ? ++this.pendings : this.pendings;
        }

        if (this.nssDoc) {
          this.nssDoc.status = this.nssDoc ? this.nssDoc.status.filter(st => st.active === true)[0].name : '';
          this.acceptDocuments[2].filename = this.nssDoc.filename;
          this.acceptDocuments[2].statusname = this.nssDoc.status;
          this.pendings = this.nssDoc.status === 'VALIDADO' || this.nssDoc.status === 'EN PROCESO' || this.nssDoc.status === 'RECHAZADO' ? ++this.pendings : this.pendings;
        }

        // console.log(this.pendings);
        

      }
    );
  }

  cardClick(card) {    
    // this.form.get('observation').setValue('');
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
    this.docto = docname === 'acta' ? this.actaDoc :
      docname === 'nss' ? this.nssDoc :
        docname === 'curp' ? this.curpDoc :
          docname === 'certificado' ? this.certificateDoc :
            docname === 'foto' ? this.imageDoc :
              docname === 'comprobante' ? this.payDoc :
                docname === 'clinicos' ? this.clinicDoc
                :docname === 'carta' ? this.cartaDoc
                : false;

    if (this.docto) {
      this.showDocument = false;

      this.typeDocShow = docname === 'foto' ? 'image' : 'pdf';
      let name = this.docto.filename.split('-')[1].split('.')[0];
      this.docDisplayName = name === 'NSS' ? 'NÚMERO DE SEGURO SOCIAL' : name === 'COMPROMISO' ? 'CARTA '+name : name ;
      this.loading = true;
      this.inscriptionsProv.getFile(this.docto.fileIdInDrive, this.docto.filename).subscribe(data => {
        var docdata = data.file;

        if (this.typeDocShow === 'pdf') {
          let buffCurp = new Buffer(docdata.data);
          this.pdfSrc = buffCurp;
        } else if (this.typeDocShow === 'image') {
          this.image = 'data:image/png;base64,' + docdata;
        }
        this.showDocument = true;
      }, (err) => { }, () => this.loading = false);
    }
  }

  async changeStatus(action) {
    var filename = '';
    this.refused = '';
    const msg = action === 'RECHAZADO' ? 'rechazar' : this.data.user === 'Secretaria escolares' ? 'validar' : 'aceptar';
    let confirmdialog = false;
    if(action === 'ACEPTADO' || action === 'VALIDADO'){
      confirmdialog = await this.swalDialog(`¿ Está seguro de ${msg} el documento ?`, '', 'question');
    } else {
      confirmdialog = await this.swalDialogInput('RECHAZAR '+this.docDisplayName,'Especifique el motivo');
    }
    if (confirmdialog) {
      const documentInfo = {
        filename: this.docto.filename,
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
            if(documentInfo.filename.includes('COMPROBANTE')){
              filename = 'COMPROBANTE DE PAGO'
            }
            if(documentInfo.filename.includes('CERTIFICADO')){
              filename = 'CERTIFICADO DE ESTUDIOS'
            }
            if(documentInfo.filename.includes('CURP')){
              filename = 'CURP'
            }
            if(documentInfo.filename.includes('ACTA')){
              filename = 'ACTA DE NACIMIENTO'
            }
            if(documentInfo.filename.includes('CLINICOS')){
              filename = 'ANÁLISIS CLÍNICOS'
            }
            if(documentInfo.filename.includes('FOTO')){
              filename = 'FOTO'
            }
            if(documentInfo.filename.includes('NSS')){
              filename = 'NÚMERO DE SEGURO SOCIAL'
            }
          if (action == "RECHAZADO") {
            this.inscriptionsProv.sendNotification(this.data.student.email, "Documento Rechazado para Expediente", this.data.student.fullName, "El documento "+filename+" fue RECHAZADO y necesita ser cambiado desde la opción 'Mi Expediente' en https://escolares.ittepic.edu.mx/", "Documento para Expediente Rechazado", "Servicios Escolares <servescolares@ittepic.edu.mx>").subscribe(
              res => {
                this.notificationsServices.showNotification(0, 'Notificación enviada a:', this.data.student.controlNumber);
              },
              err => {
                this.notificationsServices.showNotification(1, 'No se pudo enviar el correo a:', this.data.student.controlNumber);
              }
            );
          }

          this.studentProv.getDocumentsUpload(this.data.student._id).subscribe(res => {
            var comprobante = res.documents.filter( docc => docc.filename.indexOf('COMPROBANTE') !== -1)[0] ? res.documents.filter( docc => docc.filename.indexOf('COMPROBANTE') !== -1)[0] : '';
            var acta = res.documents.filter( docc => docc.filename.indexOf('ACTA') !== -1)[0] ? res.documents.filter( docc => docc.filename.indexOf('ACTA') !== -1)[0] : '';
            var curp = res.documents.filter( docc => docc.filename.indexOf('CURP') !== -1)[0] ? res.documents.filter( docc => docc.filename.indexOf('CURP') !== -1)[0] : '';
            var nss = res.documents.filter( docc => docc.filename.indexOf('NSS') !== -1)[0] ? res.documents.filter( docc => docc.filename.indexOf('NSS') !== -1)[0] : '';
            var compromiso = res.documents.filter( docc => docc.filename.indexOf('COMPROMISO') !== -1)[0] ? res.documents.filter( docc => docc.filename.indexOf('COMPROMISO') !== -1)[0] : '';
            var clinicos = res.documents.filter( docc => docc.filename.indexOf('CLINICOS') !== -1)[0] ? res.documents.filter( docc => docc.filename.indexOf('CLINICOS') !== -1)[0] : '';
            var certificado = res.documents.filter( docc => docc.filename.indexOf('CERTIFICADO') !== -1)[0] ? res.documents.filter( docc => docc.filename.indexOf('CERTIFICADO') !== -1)[0] : '';
            var foto = res.documents.filter( docc => docc.filename.indexOf('FOTO') !== -1)[0] ? res.documents.filter( docc => docc.filename.indexOf('FOTO') !== -1)[0] : '';
            
            console.log(this.data.student);
            if (comprobante.statusName == "ACEPTADO"  && acta.statusName == "ACEPTADO"  && curp.statusName == "ACEPTADO"  && nss.statusName == "ACEPTADO"  && clinicos.statusName == "ACEPTADO"  && certificado.statusName == "ACEPTADO"  && foto.statusName == "ACEPTADO"){
              // Cambiar estatus a ACEPTADO
              this.inscriptionsProv.updateStudent({inscriptionStatus:"Aceptado"},this.data.student._id).subscribe(res => {
              });   
              return;
            } 
            if (comprobante.statusName == "VALIDADO"  && acta.statusName == "VALIDADO"  && curp.statusName == "VALIDADO"  && nss.statusName == "VALIDADO"  && clinicos.statusName == "VALIDADO"  && certificado.statusName == "VALIDADO"  && foto.statusName == "VALIDADO"){
              // Cambiar estatus a VALIDADO
              this.inscriptionsProv.updateStudent({inscriptionStatus:"Verificado"},this.data.student._id).subscribe(res => {
              });   
              return;
            }

            var allDiferentProcess = true;
            var allValidateOrAcept = true;

            for(var i = 0; i < res.documents.length; i++){
              if(res.documents[i].statusName == "EN PROCESO"){
                allDiferentProcess = false;
              }
              if(res.documents[i].statusName == "VALIDADO" || res.documents[i] == "ACEPTADO"){
                allValidateOrAcept = true;
              } else {
                allValidateOrAcept = false;
              }
            }

            if(allDiferentProcess){
              if(!allValidateOrAcept){
                // Cambiar estatus a EN PROCESO
                this.inscriptionsProv.updateStudent({inscriptionStatus:"En Proceso"},this.data.student._id).subscribe(res => {
                });   
                return;
              }
              // No cambiar estatus
            }
          });
        },
        err => console.log(err)
      );
    }
  }

  

  history() {

    const linkModal = this.dialog.open(ExpedientHistoryComponent, {
      data: {
        student: this.data.student._id,
        filename: this.docDisplayName,

      },
      disableClose: true,
      hasBackdrop: true,
      width: '50em',
      height: '520px'
    });
  }

  selectAll() {


    if (!this.checkAll) {
      this.selectPendings = 0;

      this.acceptDocuments[0].checkActa = this.acceptDocuments[0].filename === '' || this.acceptDocuments[0].statusname === 'ACEPTADO' ? false : !this.acceptDocuments[0].checkActa;
      this.acceptDocuments[4].checkCertificate = this.acceptDocuments[4].filename === '' || this.acceptDocuments[4].statusname === 'ACEPTADO' ? false : !this.acceptDocuments[4].checkCertificate;
      this.acceptDocuments[1].checkCurp = this.acceptDocuments[1].filename === '' || this.acceptDocuments[1].statusname === 'ACEPTADO' ? false : !this.acceptDocuments[1].checkCurp;
      this.acceptDocuments[5].checkPay = this.acceptDocuments[5].filename === '' || this.acceptDocuments[5].statusname === 'ACEPTADO' ? false : !this.acceptDocuments[5].checkPay;
      this.acceptDocuments[3].checkPhoto = this.acceptDocuments[3].filename === '' || this.acceptDocuments[3].statusname === 'ACEPTADO' ? false : !this.acceptDocuments[3].checkPhoto;
      this.acceptDocuments[6].checkClinic = this.acceptDocuments[6].filename === '' || this.acceptDocuments[6].statusname === 'ACEPTADO' ? false : !this.acceptDocuments[6].checkClinic;
     
      this.acceptDocuments[2].checkNss = this.acceptDocuments[2].filename === '' || this.acceptDocuments[2].statusname === 'ACEPTADO' ? false : !this.acceptDocuments[2].checkNss;

      this.acceptDocuments[7].checkCarta = this.acceptDocuments[7].filename === '' || this.acceptDocuments[7].statusname === 'ACEPTADO' ? false : !this.acceptDocuments[7].checkCarta;

      this.acceptDocuments[0].status = this.acceptDocuments[0].checkActa;
      this.acceptDocuments[1].status = this.acceptDocuments[1].checkCurp;
      this.acceptDocuments[2].status = this.acceptDocuments[2].checkNss;
      this.acceptDocuments[3].status = this.acceptDocuments[3].checkPhoto;
      this.acceptDocuments[4].status = this.acceptDocuments[4].checkCertificate;
      this.acceptDocuments[5].status = this.acceptDocuments[5].checkPay;
      this.acceptDocuments[6].status = this.acceptDocuments[6].checkClinic;
      this.acceptDocuments[7].status = this.acceptDocuments[7].checkCarta;

    } else {

      this.selectPendings = this.pendings;
      this.acceptDocuments[0].checkActa = this.acceptDocuments[0].filename === '' || this.acceptDocuments[0].statusname === 'ACEPTADO' ? false : true;
      this.acceptDocuments[4].checkCertificate = this.acceptDocuments[4].filename === '' || this.acceptDocuments[4].statusname === 'ACEPTADO' ? false : true;
      this.acceptDocuments[1].checkCurp = this.acceptDocuments[1].filename === '' || this.acceptDocuments[1].statusname === 'ACEPTADO' ? false : true;
      this.acceptDocuments[5].checkPay = this.acceptDocuments[5].filename === '' || this.acceptDocuments[5].statusname === 'ACEPTADO' ? false : true;
      this.acceptDocuments[3].checkPhoto = this.acceptDocuments[3].filename === '' || this.acceptDocuments[3].statusname === 'ACEPTADO' ? false : true;
      this.acceptDocuments[6].checkClinic = this.acceptDocuments[6].filename === '' || this.acceptDocuments[6].statusname === 'ACEPTADO' ? false : true;
      this.acceptDocuments[2].checkNss = this.acceptDocuments[2].filename === '' || this.acceptDocuments[2].statusname === 'ACEPTADO' ? false : true;
      this.acceptDocuments[7].checkCarta = this.acceptDocuments[7].filename === '' || this.acceptDocuments[7].statusname === 'ACEPTADO' ? false : true;

      this.acceptDocuments[0].status = this.acceptDocuments[0].checkActa;
      this.acceptDocuments[1].status = this.acceptDocuments[1].checkCurp;
      this.acceptDocuments[2].status = this.acceptDocuments[2].checkNss;
      this.acceptDocuments[3].status = this.acceptDocuments[3].checkPhoto;
      this.acceptDocuments[4].status = this.acceptDocuments[4].checkCertificate;
      this.acceptDocuments[5].status = this.acceptDocuments[5].checkPay;
      this.acceptDocuments[6].status = this.acceptDocuments[6].checkClinic;
      this.acceptDocuments[7].status = this.acceptDocuments[7].checkCarta;
    }
  }
  actaChange() {
    this.selectPendings = this.acceptDocuments[0].checkActa ? ++this.selectPendings : --this.selectPendings;
    this.acceptDocuments[0].status = this.acceptDocuments[0].checkActa;
    this.checkAll = this.pendings === this.selectPendings;
  }
  curpChange() {
    this.selectPendings = this.acceptDocuments[1].checkCurp ? ++this.selectPendings : --this.selectPendings;
    this.acceptDocuments[1].status = this.acceptDocuments[1].checkCurp;
    this.checkAll = this.pendings === this.selectPendings;
  }
  payChange() {
    this.selectPendings = this.acceptDocuments[5].checkPay ? ++this.selectPendings : --this.selectPendings;
    this.acceptDocuments[5].status = this.acceptDocuments[5].checkPay;
    this.checkAll = this.pendings === this.selectPendings;


  }
  certificateChange() {
    this.selectPendings = this.acceptDocuments[4].checkCertificate ? ++this.selectPendings : --this.selectPendings;
    this.acceptDocuments[4].status = this.acceptDocuments[4].checkCertificate;
    this.checkAll = this.pendings === this.selectPendings;
  }
  clinicChange() {
    this.selectPendings = this.acceptDocuments[6].checkClinic ? ++this.selectPendings : --this.selectPendings;
    this.acceptDocuments[6].status = this.acceptDocuments[6].checkClinic;
    this.checkAll = this.pendings === this.selectPendings;
  }
  photoChange() {
    this.selectPendings = this.acceptDocuments[3].checkPhoto ? ++this.selectPendings : --this.selectPendings;

    this.acceptDocuments[3].status = this.acceptDocuments[3].checkPhoto;
    this.checkAll = this.pendings === this.selectPendings;
  }
  nssChange() {
    this.selectPendings = this.acceptDocuments[2].checkNss ? ++this.selectPendings : --this.selectPendings;
    this.acceptDocuments[2].status = this.acceptDocuments[2].checkNss;
    this.checkAll = this.pendings === this.selectPendings;

  }

  cartaChange() {
    this.selectPendings = this.acceptDocuments[7].checkCarta ? ++this.selectPendings : --this.selectPendings;
    this.acceptDocuments[7].status = this.acceptDocuments[7].checkCarta;
    this.checkAll = this.pendings === this.selectPendings;
  }

  async acceptManyDocuments() {

    
    let updateDocs = this.acceptDocuments.filter(docs => docs.status === true && docs.filename !== '' && docs.statusname !== 'ACEPTADO');
    console.log(updateDocs);

    let confirmdialog = await this.swalDialog(`¿ Está seguro de aceptar ${updateDocs.length} documentos ?`, '', 'question');

    if (confirmdialog) {
      this.pendings = 0;
      updateDocs.forEach(doc => {
        const documentInfo = {
          filename: doc.filename,
          status: {
            name: 'ACEPTADO',
            active: true,
            message: 'Documento aceptado',
            observation: ''
          }
        };
        this.studentProv.updateDocumentStatus(this.data.student._id, documentInfo).subscribe(
          res => {
            this.notificationsServices.showNotification(eNotificationType.SUCCESS,
              'Exito', 'Estatus actualizado correctamente.');
          },
          err => console.log(err)
        );
      });
    }
  }

}
