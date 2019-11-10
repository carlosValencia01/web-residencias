import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
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
  image;    
  viewdoc : boolean;
  prevCard;
  showDocument = false;
  typeDocShow : string;
  docDisplayName : string;
  docto;
  form : FormGroup;
  refused;  
  loading = false;  

  constructor(
    public dialogRef: MatDialogRef<ReviewExpedientComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private studentProv: StudentProvider,    
    private inscriptionsProv: InscriptionsProvider,
    private notificationsServices: NotificationsServices,
    public dialog: MatDialog,
  ) {

    // console.log(data);
    this.studentProv.refreshNeeded$.subscribe(
      ()=>{
        this.getDocuments();                
      }
    );
    this.getDocuments();
   }

  ngOnInit() {
    this.form = new FormGroup({        
      'status': new FormControl(null,[Validators.required]),      
      'observation': new FormControl(null,[Validators.required]),      
    });
  }

  onClose(){
    this.dialogRef.close({action:'close'});
  }

  swalDialog(title,msg,type){
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
      if (result.value)  return true;      
      else return false;
    });
  }

  getDocuments(){
    this.studentProv.getDriveDocuments(this.data.student._id).subscribe(
      docs=>{
        let documents = docs.documents;
        ;
        // console.log(documents);
       
        this.curpDoc = documents.filter( docc => docc.filename.indexOf('CURP') !== -1)[0];
        this.nssDoc = documents.filter( docc => docc.filename.indexOf('NSS') !== -1)[0];
        this.imageDoc = documents.filter( docc => docc.filename.indexOf('FOTO') !== -1)[0];
        this.payDoc = documents.filter( docc => docc.filename.indexOf('COMPROBANTE') !== -1)[0];
        this.certificateDoc = documents.filter( docc => docc.filename.indexOf('CERTIFICADO') !== -1)[0];
        this.actaDoc = documents.filter( docc => docc.filename.indexOf('ACTA') !== -1)[0];
        this.clinicDoc = documents.filter( docc => docc.filename.indexOf('CLINICOS') !== -1)[0];
      
        if(this.imageDoc) this.imageDoc.status = this.imageDoc ? this.imageDoc.status.filter( st=> st.active===true)[0].name : '';

       if(this.curpDoc) this.curpDoc.status = this.curpDoc ? this.curpDoc.status.filter( st=> st.active===true)[0].name : '';
        
       if(this.actaDoc) this.actaDoc.status = this.actaDoc ? this.actaDoc.status.filter( st=> st.active===true)[0].name : '';

       if(this.clinicDoc) this.clinicDoc.status = this.clinicDoc ? this.clinicDoc.status.filter( st=> st.active===true)[0].name : '';

       if(this.certificateDoc) this.certificateDoc.status = this.certificateDoc ? this.certificateDoc.status.filter( st=> st.active===true)[0].name : '';

       if(this.payDoc) this.payDoc.status = this.payDoc ? this.payDoc.status.filter( st=> st.active===true)[0].name : '';

       if(this.nssDoc) this.nssDoc.status = this.nssDoc ? this.nssDoc.status.filter( st=> st.active===true)[0].name : '';             

      //  console.log(this.payDoc);
       
      }
    );
  }

  cardClick(card){
    if(card === this.prevCard){
      this.viewdoc = !this.viewdoc;
    }else{
      this.prevCard = card;
      this.viewdoc = true;
    }       
    if(this.viewdoc){
      this.getPdf(card);
    }
  }
  closeDoc(){
    this.viewdoc=false;
    this.prevCard='';    
  }

  getPdf(docname){
    this.docto = docname === 'acta' ? this.actaDoc :
                docname === 'nss' ? this.nssDoc :
                docname === 'curp' ? this.curpDoc :
                docname === 'certificado' ? this.certificateDoc :
                docname === 'foto' ? this.imageDoc :
                docname === 'comprobante' ? this.payDoc :
                docname === 'clinicos' ? this.clinicDoc : false;    
      
    if(this.docto){
      this.showDocument=false;      
      
      this.typeDocShow = docname === 'foto' ? 'image' : 'pdf';
      this.docDisplayName = this.docto.filename.split('-')[1].split('.')[0];
      this.loading=true;
      this.inscriptionsProv.getFile(this.docto.fileIdInDrive, this.docto.filename).subscribe(data => {
        var docdata = data.file;

        if(this.typeDocShow === 'pdf'){
          let buffCurp = new Buffer(docdata.data);
          this.pdfSrc = buffCurp;
        }else if(this.typeDocShow === 'image'){
          this.image = 'data:image/png;base64,' + docdata;
        }
        this.showDocument=true;
      },(err)=>{},()=>this.loading=false);
    }
  }

 async changeStatus(action){
   this.refused='';
        const msg = action.status === 'RECHAZADO' ? 'rechazar' : 'aceptar';
    let confirmdialog = await this.swalDialog(`¿ Está seguro de ${msg} el documento ?`,'','question');

    if(confirmdialog){
      const documentInfo = {      
          filename:this.docto.filename,        
          status : {
          name:action.status,
          active:true,
          message: action.status === 'ACEPTADO' ? 'Documento aceptado' : 'Documento rechazado',
          observation: action.status === 'RECHAZADO' ? action.observation : ''
        }
      };
      this.studentProv.updateDocumentStatus(this.data.student._id,documentInfo).subscribe(
        res=>{
          this.notificationsServices.showNotification(eNotificationType.SUCCESS,
          'Exito', 'Estatus actualizado correctamente.');
        },
        err=>console.log(err)
      );
      this.closeDoc();
    }
  }

  history(){  
    
    const linkModal = this.dialog.open(ExpedientHistoryComponent, {
      data: {
        student:this.data.student._id,
        filename:this.docDisplayName,
        
      },
      disableClose: true,
      hasBackdrop: true,
      width: '40em',
      height: '520px'
    });  
  }
  
}
