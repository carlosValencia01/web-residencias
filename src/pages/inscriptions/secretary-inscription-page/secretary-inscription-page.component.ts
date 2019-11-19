import { Component, OnInit } from '@angular/core';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { MatDialog } from '@angular/material';
import { ReviewExpedientComponent } from 'src/modals/inscriptions/review-expedient/review-expedient.component';
import { StudentInformationComponent } from 'src/modals/inscriptions/student-information/student-information.component';
import { ReviewAnalysisComponent } from 'src/modals/inscriptions/review-analysis/review-analysis.component'
import TableToExcel from '@linways/table-to-excel';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { Router, ActivatedRoute } from '@angular/router';
const jsPDF = require('jspdf');

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


  // filter nc,nombre
  public searchText = '';
  public searchCarreer = '';
  public searchDictamen = '';

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
        student:student
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

}
