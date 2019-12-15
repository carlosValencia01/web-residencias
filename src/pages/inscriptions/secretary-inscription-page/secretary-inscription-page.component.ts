import { Component, OnInit } from '@angular/core';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { MatDialog } from '@angular/material';
import { ReviewExpedientComponent } from 'src/modals/inscriptions/review-expedient/review-expedient.component';
import { StudentInformationComponent } from 'src/modals/inscriptions/student-information/student-information.component';
import { ReviewAnalysisComponent } from 'src/modals/inscriptions/review-analysis/review-analysis.component';
import { ReviewCredentialsComponent } from 'src/modals/inscriptions/review-credentials/review-credentials.component';
import TableToExcel from '@linways/table-to-excel';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
const jsPDF = require('jspdf');
import * as JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-secretary-inscription-page',
  templateUrl: './secretary-inscription-page.component.html',
  styleUrls: ['./secretary-inscription-page.component.scss']
})
export class SecretaryInscriptionPageComponent implements OnInit {
  students;
  listStudents;
  periods = [];
  loading = false;

  listCovers;

  rolName;

  docAnalisis;

  credentialStudents;
  frontBase64: any;
  backBase64: any;


  // filter nc,nombre
  public searchText = '';
  public searchCarreer = '';
  public searchDictamen = '';
  public searchAdvertencia = '';
  public searchCredential = '';

  public searchEC = false;
  public searchE = false;
  public searchEP = false;
  public searchV = false;
  public searchA = false;

  public EC = '';
  public E = '';
  public EP = '';
  public V = '';
  public A = '';

  //Paginator
  page = 1;
  pag;
  pageSize = 10;

  constructor(
    private imageToBase64Serv: ImageToBase64Service,
    private inscriptionsProv: InscriptionsProvider,
    public dialog: MatDialog,
    private notificationService: NotificationsServices,
    private cookiesService: CookiesService,
    private routeActive: ActivatedRoute,
    private router: Router,
  ) { 
    this.rolName = this.cookiesService.getData().user.rol.name;
    //console.log(this.rolName);
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.getStudents();
    this.getPeriods();
    this.getBase64ForStaticImages();

  }

  ngOnInit() {
    
  }

  getStudents(){
    this.inscriptionsProv.getStudents().subscribe(res => {
      this.students = res.students;

      // Ordenar Alumnos por Apellidos
      this.students.sort(function (a, b) {
        return a.fullName.localeCompare(b.fullName);
      });

      this.listStudents = this.students;
      this.listCovers = this.listStudents;
      this.credentialStudents = this.filterItemsCarreer(this.searchCarreer);
      
      //console.log(this.listStudents);
    });
  }

  pageChanged(ev) {
    this.page = ev;
  }

  // Obetener Valor del checkbox de Estatus
  eventFilterStatus() {
    if (this.searchEC) {
      this.EC = 'En Captura';
    } else {
      this.EC = '~';
    }
    if (this.searchE) {
      this.E = 'Enviado';
    } else {
      this.E = '~';
    }
    if (this.searchEP) {
      this.EP = 'En Proceso';
    } else {
      this.EP = '~';
    }
    if (this.searchV) {
      this.V = 'Verificado';
    } else {
      this.V = '~';
    }
    if (this.searchA) {
      this.A = 'Aceptado';
    } else {
      this.A = '~';
    }

    this.listStudents = this.filterItems(
      this.searchCarreer,
      this.EC,
      this.E,
      this.EP,
      this.V,
      this.A
    );

    if (Object.keys(this.listStudents).length === 0) {
      if (!this.searchEC && !this.searchE && !this.searchEP && !this.searchV && !this.searchA) {
        this.listStudents = this.students;
      }
    }

    this.listCovers = this.filterItemsCovers(this.searchCarreer,this.searchText);
    //console.log(this.listCovers);

    this.credentialStudents = this.filterItemsCarreer(this.searchCarreer);

  }

  // FILTRADO POR CARRERA
  filterItemsCarreer(carreer) {
    return this.students.filter(function (student) {
      return student.career.toLowerCase().indexOf(carreer.toLowerCase()) > -1;
    });
  }

   // FILTRADO POR CARRERA O ESTATUS
   filterItems(carreer, EC, E, EP, V, A) {
    return this.students.filter(function (student) {
      //console.log(student);
      return student.career.toLowerCase().indexOf(carreer.toLowerCase()) > -1 && (
        student.inscriptionStatus.toLowerCase().indexOf(EC.toLowerCase()) > -1 ||
        student.inscriptionStatus.toLowerCase().indexOf(E.toLowerCase()) > -1 ||
        student.inscriptionStatus.toLowerCase().indexOf(EP.toLowerCase()) > -1 ||
        student.inscriptionStatus.toLowerCase().indexOf(V.toLowerCase()) > -1 ||
        student.inscriptionStatus.toLowerCase().indexOf(A.toLowerCase()) > -1);
    });
  }

  filterItemsCovers(carreer,nc) {
    return this.students.filter(function (student) {
      return student.career.toLowerCase().indexOf(carreer.toLowerCase()) > -1 &&
        student.controlNumber.toLowerCase().indexOf(nc.toLowerCase()) > -1    
      });
  }
  

  getPeriods(){
    let sub = this.inscriptionsProv.getAllPeriods()
      .subscribe(periods => {       
        this.periods=periods.periods;     
        //console.log(this.periods); 
        this.periods.reverse();                        
        sub.unsubscribe();
      });
  }

  updateGI(student){
    //console.log(student);
    const linkModal = this.dialog.open(StudentInformationComponent, {
      data: {
        operation: 'view',
        student:student
      },
      disableClose: true,
      hasBackdrop: true,
      width: '90em',
      height: '800px'
    });
    let sub = linkModal.afterClosed().subscribe(
      information=>{         
        console.log(information);
        this.getStudents();
      },
      err=>console.log(err), ()=> sub.unsubscribe()
    );
  }

  viewExpedient(student){
    const linkModal = this.dialog.open(ReviewExpedientComponent, {
      data: {
        operation: 'view',
        student:student,
        user: this.cookiesService.getData().user.rol.name
      },
      disableClose: true,
      hasBackdrop: true,
      width: '90em',
      height: '800px'
    });
    let sub = linkModal.afterClosed().subscribe(
      expedient=>{         
        // console.log(expedient);
        
      },
      err=>console.log(err), ()=> sub.unsubscribe()
    );
  }

  // Exportar alumnos a excel
  excelExport() {
    this.notificationService.showNotification(eNotificationType.INFORMATION, 'EXPORTANDO DATOS', '');
    this.loading = true;
    TableToExcel.convert(document.getElementById('tableReportExcel'), {
      name: 'Reporte Alumnos Inscripcion.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
    this.loading = false;
  }

  // Generar Carátulas
  generateCovers() {
    console.log(this.listCovers.length);
    if(this.listCovers.length != 0){
      this.notificationService.showNotification(eNotificationType.INFORMATION, 'GENERANDO CARÁTULAS', '');
      this.loading = true;
      const img = new Image();
      const doc = new jsPDF();
      var año = '';
      var pageWidth = doc.internal.pageSize.width;
      for(let i = 0; i < this.listCovers.length; i++){
        img.src = 'https://i.ibb.co/3N7hbHY/Caratula-Expediente.png';
        doc.addImage(img, 'jpg',6, 0, 200, 295);
        año = this.listCovers[i].dateAcceptedTerms ? this.listCovers[i].dateAcceptedTerms.substring(0,4):'';
        doc.setFontSize(10);
        doc.setFontType('bold');
        doc.text('TECNM/02Z/SE/02S.03/'+this.listCovers[i].controlNumber+'/'+año,(pageWidth / 2)+30, 112,'center');

        doc.setFontSize(19);
        doc.setFontType('bold');
        doc.text(this.listCovers[i].fullName, pageWidth / 2, 167,'center');
        if(i != (this.listCovers.length)-1){
          doc.addPage();
        }
      }
      this.loading = false;
      window.open(doc.output('bloburl'), '_blank');
    }
        
  }

  // Generar Pestañas
  generateLabels() {
    this.notificationService.showNotification(eNotificationType.INFORMATION, 'GENERANDO PESTAÑAS', '');
    this.loading = true;
    
    const doc = new jsPDF('l', 'mm', [12, 170]);;
    var pageWidth = doc.internal.pageSize.width;
    var año = '';
    for(let i = 0; i < this.listCovers.length; i++){
      año = this.listCovers[i].dateAcceptedTerms ? this.listCovers[i].dateAcceptedTerms.substring(0,4):'';
      doc.setFontSize(4);
      doc.setFontType('bold');
      //Identificador
      doc.text('TECNM/02Z/SE/02S.03/'+this.listCovers[i].controlNumber+'/'+año,1,2.5);

      doc.setFontSize(4);
      doc.setFontType('bold');
      //Nombre
      doc.text(this.listCovers[i].fullName,27,2.5);

      doc.setFontSize(4);
      doc.setFontType('bold');
      //Carrera
      doc.text('CAR',56,2.5);

      if(i != (this.listCovers.length)-1){
        doc.addPage();
      }
    }
    this.loading = false;
    window.open(doc.output('bloburl'), '_blank');
  }

  viewAnalysis(student){
    if(student.documents != ''){
      var docAnalisis = student.documents.filter( docc => docc.filename.indexOf('CLINICOS') !== -1)[0] ? student.documents.filter( docc => docc.filename.indexOf('CLINICOS') !== -1)[0] : '';
      if(docAnalisis != ''){
        if(docAnalisis.status[docAnalisis.status.length-1].name == "VALIDADO" || docAnalisis.status[docAnalisis.status.length-1].name == "ACEPTADO"){
          const linkModal = this.dialog.open(ReviewAnalysisComponent, {
            data: {
              operation: 'view',
              student:student
            },
            disableClose: true,
            hasBackdrop: true,
            width: '90em',
            height: '800px'
          });
          let sub = linkModal.afterClosed().subscribe(
            analysis=>{         
              console.log(analysis);
              this.getStudents();
            },
            err=>console.log(err), ()=> sub.unsubscribe()
          );
        } else {
          this.notificationService.showNotification(eNotificationType.INFORMATION, 'ATENCIÓN', 'Aun no son Validados/Aceptados los análisis clínicos.');   
        }
      } else {
        this.notificationService.showNotification(eNotificationType.INFORMATION, 'ATENCIÓN', 'Alumno no tiene análisis clínicos.');   
      }
    } else {
      this.notificationService.showNotification(eNotificationType.INFORMATION, 'ATENCIÓN', 'Alumno no tiene expediente.');   
    }
    
  }

  filterDocuments(document,student){
    switch (document) {
      case "Acta": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename.indexOf('ACTA') !== -1)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      case "Certificado": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename.indexOf('CERTIFICADO') !== -1)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      case "Analisis": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename.indexOf('CLINICOS') !== -1)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      case "Comprobante": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename.indexOf('COMPROBANTE') !== -1)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      case "Curp": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename.indexOf('CURP') !== -1)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      case "Nss": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename.indexOf('NSS') !== -1)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      case "Foto": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename.indexOf('FOTO') !== -1)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
    }
  }

  // Generar plantilla IMSS Excel
  excelExportIMSS() {
    this.notificationService.showNotification(eNotificationType.INFORMATION, 'EXPORTANDO DATOS', '');
    this.loading = true;
    TableToExcel.convert(document.getElementById('tableReportExcelIMSS'), {
      name: 'Plantilla Alumnos IMSS.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
    this.loading = false;
  }

   // Generar plantilla CM Excel
   excelExportCM() {
    this.notificationService.showNotification(eNotificationType.INFORMATION, 'EXPORTANDO DATOS', '');
    this.loading = true;
    TableToExcel.convert(document.getElementById('tableReportExcelCM'), {
      name: 'Reporte Consultorio Médico.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
    this.loading = false;
  }

  complete10Dig(number){
    var num = number.toString();
    while (num.length<10){
      num = '0'+num;
    }
    return(num);
  }

  getDateMov(){
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    if(month < 10){
      if(day < 10){
        return (`0${day}0${month}${year}`)
      }
      else{
        return (`${day}0${month}${year}`)
      }
    }else{
      if(day < 10){
        return (`0${day}${month}${year}`)
      } else{
        return (`${day}${month}${year}`)
      }
    }
  }

  registerCredential(item){
    Swal.fire({
      title: 'Registrar Impresión de Credencial',
      text: 'Para ' + item.controlNumber,
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.value) {
        this.loading=true;
        this.inscriptionsProv.updateStudent({printCredential:true},item._id).subscribe(res => {
        }, err=>{},
        ()=>{
          this.loading=false
          this.notificationService.showNotification(eNotificationType.SUCCESS, 'Éxito', 'Impresión Registrada.');
          this.getStudents();
        });
      }
    });
  }

  removeCredential(item){
    Swal.fire({
      title: 'Remover Impresión de Credencial',
      text: 'Para ' + item.controlNumber,
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.value) {
        this.loading=true;
        this.inscriptionsProv.updateStudent({printCredential:false},item._id).subscribe(res => {
        }, err=>{},
        ()=>{
          this.loading=false
          this.notificationService.showNotification(eNotificationType.SUCCESS, 'Éxito', 'Impresión Removida.');
          this.getStudents();
        });
      }
    });
  }

  async generateCredentials(){
    var numCredentials = 0;
    var tempStudents = [];
    if(this.credentialStudents.length != 0){
      this.loading = true;
      const doc = new jsPDF({
        unit: 'mm',
        format: [251, 158], // Medidas correctas: [88.6, 56]
        orientation: 'landscape'
      });

      for(var i = 0; i < this.credentialStudents.length; i++){
        if(this.credentialStudents[i].documents != ''){
          var docFoto = this.credentialStudents[i].documents.filter( docc => docc.filename.indexOf('FOTO') !== -1)[0] ? this.credentialStudents[i].documents.filter( docc => docc.filename.indexOf('FOTO') !== -1)[0] : '';
          if(docFoto != ''){
            // VERIFICAR SI LA FOTO ESTÁ EN ESTATUS ACEPTADO
            if(docFoto.status[docFoto.status.length-1].name == "ACEPTADO" || docFoto.status[docFoto.status.length-1].name == "VALIDADO"){
              // VERIFICAR SI LA CREDENCIAL AUN NO ESTÁ IMPRESA
              if(this.credentialStudents[i].printCredential != true){
                tempStudents.push(this.credentialStudents[i]);
                numCredentials ++;
                // cara frontal de la credencial
                doc.addImage(this.frontBase64, 'PNG', 0, 0, 88.6, 56);
                  
                //FOTOGRAFIA DEL ALUMNO
                var foto = await this.findFoto(docFoto);
                //console.log(foto);
                doc.addImage(foto, 'PNG', 3.6, 7.1, 25.8, 31);

                doc.setTextColor(255, 255, 255);
                doc.setFontSize(7);
                doc.setFont('helvetica');
                doc.setFontType('bold');
                doc.text(49, 30.75, doc.splitTextToSize(this.credentialStudents[i].fullName ? this.credentialStudents[i].fullName : '', 35));
                doc.text(49, 38.6, doc.splitTextToSize(this.reduceCareerString(this.credentialStudents[i].career ? this.credentialStudents[i].career : ''), 35));
                doc.text(49, 46.5, doc.splitTextToSize(this.credentialStudents[i].nss ? this.credentialStudents[i].nss : '', 35));

                // cara trasera de la credencial
                doc.addPage();
                doc.addImage(this.backBase64, 'PNG', 0, 0, 88.6, 56);

                // Numero de control con codigo de barra
                doc.addImage(this.textToBase64Barcode(this.credentialStudents[i].controlNumber ? this.credentialStudents[i].controlNumber : ''), 'PNG', 46.8, 39.2, 33, 12);
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(8);
                doc.text(57, 53.5, doc.splitTextToSize(this.credentialStudents[i].controlNumber ? this.credentialStudents[i].controlNumber : '', 35));

                //OTRA CREDENCIAL
                if(i != (this.credentialStudents.length)-1){
                  doc.addPage();
                }
              } else {
                console.log(this.credentialStudents[i].controlNumber+' - Credencial ya fue impresa.');
              }
            } else {
              console.log(this.credentialStudents[i].controlNumber+' - Foto no aceptada.');
            }
          } else { 
            console.log(this.credentialStudents[i].controlNumber+' - No tiene foto.');
          }
        } else {
          console.log(this.credentialStudents[i].controlNumber+' - No tiene expediente.');
        }
      }
      var pageCount = doc.internal.getNumberOfPages();
      if(pageCount%2 != 0){
        doc.deletePage(pageCount);
      }
      this.loading = false;
      if(numCredentials != 0){
        var credentials = doc.output('arraybuffer');
        // Abrir Modal para visualizar credenciales
        const linkModal = this.dialog.open(ReviewCredentialsComponent, {
          data: {
            operation: 'view',
            credentials:credentials,
            students:tempStudents
          },
          disableClose: true,
          hasBackdrop: true,
          width: '90em',
          height: '800px'
        });
        let sub = linkModal.afterClosed().subscribe(
          credentials=>{         
            console.log(credentials);
            this.getStudents();
          },
          err=>console.log(err), ()=> sub.unsubscribe()
        );

        //window.open(doc.output('bloburl'), '_blank');
      } else {
        this.notificationService.showNotification(eNotificationType.INFORMATION, 'No Hay Credenciales Para Imprimir', '');
      }
    } else {
      this.notificationService.showNotification(eNotificationType.INFORMATION, 'No Hay Credenciales Para Imprimir', '');
    }
  }

  //GENERAR PDF
  getBase64ForStaticImages() {
    this.imageToBase64Serv.getBase64('assets/imgs/front.jpg').then(res1 => {
      this.frontBase64 = res1;
    });

    this.imageToBase64Serv.getBase64('assets/imgs/back2.jpg').then(res2 => {
      this.backBase64 = res2;
    });
  }

  textToBase64Barcode(text) {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, { format: 'CODE128', displayValue: false });
    return canvas.toDataURL('image/png');
  }

  reduceCareerString(career: string): string {
    if (career.length < 33) {
      return career;
    }

    switch (career) {
      case 'DOCTORADO EN CIENCIAS DE ALIMENTOS':
        return 'DOC. EN CIENCIAS DE ALIMENTOS';

      case 'INGENIERÍA EN GESTIÓN EMPRESARIAL':
        return 'ING. EN GESTION EMPRESARIAL';


      case 'INGENIERÍA EN SISTEMAS COMPUTACIONALES':
        return 'ING. EN SISTEMAS COMPUTACIONALES';

      case 'MAESTRIA EN TECNOLOGÍAS DE LA INFORMACIÓN':
        return 'MAESTRÍA EN TEC. DE LA INFORMACIÓN';

      case 'MAESTRIA EN CIENCIAS DE ALIMENTOS':
        return 'MAEST. EN CIENCIAS DE ALIMENTOS';

      default:
        return 'ING. EN TEC. DE LA INF. Y COM.';
    }

  }

  async findFoto(docFoto) {
    return new Promise(resolve => {
      this.inscriptionsProv.getFile(docFoto.fileIdInDrive, docFoto.filename).subscribe(
        data => {
          var pub = data.file;
          var image = 'data:image/png;base64,' + pub;
          resolve(image);
        },
        err => {
          console.log(err);
        }
      )
    });
  }

}
