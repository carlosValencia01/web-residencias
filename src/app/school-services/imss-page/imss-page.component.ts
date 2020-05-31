import { ComponentType } from '@angular/cdk/overlay';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import TableToExcel from '@linways/table-to-excel';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import * as JsBarcode from 'jsbarcode';
import * as jsPDF from 'jspdf';
import * as moment from 'moment';
import * as Papa from 'papaparse';
import { LoadCsvDataComponent } from 'src/app/commons/load-csv-data/load-csv-data.component';
import { IStudent } from 'src/app/entities/shared/student.model';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import Swal from 'sweetalert2';
moment.locale('es');

@Component({
  selector: 'app-imss-page',
  templateUrl: './imss-page.component.html',
  styleUrls: ['./imss-page.component.scss']
})
export class ImssPageComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('matPaginatorInsured') paginatorInsured: MatPaginator;
  @ViewChild('matPaginatorUninsured') paginatorUninsured: MatPaginator;
  @ViewChild('matPaginatorCampaign') paginatorCampaign: MatPaginator;
  @ViewChild('fileUpload') fileUpload: ElementRef;
  @ViewChild('fileImss') fileImss: ElementRef;
  public students: IStudent[] = [];
  public displayedColumnsInsured: string[];
  public displayedColumnsInsuredName: string[];
  public displayedColumnsUninsured: string[];
  public displayedColumnsUninsuredName: string[];
  public displayedColumnsCampaign: string[];
  public displayedColumnsCampaignName: string[];
  public dataSourceInsured: MatTableDataSource<IIMSSTable>;
  public dataSourceUninsured: MatTableDataSource<IIMSSTable>;
  public dataSourceCampaign: MatTableDataSource<IIMSSTable>;
  public search: string;
  public selectedTab: FormControl;

  photoStudent = '';
  imageDoc;
  showImg = false;
  haveImage = false;
  frontBase64: any;
  backBase64: any;
  templateImssCampaign = [];

  constructor(
    private cookiesService: CookiesService,
    private notificationServ: NotificationsServices,
    private router: Router,
    private routeActive: ActivatedRoute,
    private studentProvider: StudentProvider,
    private dialog: MatDialog,
    private inscriptionProv: InscriptionsProvider,
    private imageToBase64Serv: ImageToBase64Service,
    private loadingService: LoadingService,
  ) {
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.selectedTab = new FormControl(0);
    this.getBase64ForStaticImages();
  }

  ngOnInit() {
    this.displayedColumnsUninsuredName = ['Número de control','Nombre', 'Carrera', 'NSS'];
    this.displayedColumnsUninsured = ['controlNumber', 'name', 'career', 'nss', 'actions']
    this.displayedColumnsInsuredName = ['Número de control','Nombre', 'Carrera', 'NSS', 'Fecha Alta'];
    this.displayedColumnsInsured = ['controlNumber','name', 'career', 'nss', 'registerDateImss', 'actions'];
    this.displayedColumnsCampaignName = ['Número de control','Nombre', 'Carrera', 'NSS', 'Asegurado', 'Fecha Alta IMSS', 'Credencial Impresa', 'Fecha Alta Campaña'];
    this.displayedColumnsCampaign = ['controlNumber','name', 'career', 'nss', 'insured', 'registerDateImss', 'printCredential', 'registerDateCampaign', 'actions'];
    setTimeout(() => { 
      this._getAllUninsured();
    });
  }

  // Obtener alumnos al cambiar de pestaña
  public changeTab(event) {
    this.selectedTab.setValue(event);
    switch (event) {
      case 0: return this._getAllUninsured();
      case 1: return this._getAllInsured();
      case 2: return this._getAllCampaign();
    }
  }

  public applyFilter(filterValue: string) {
    switch (this.selectedTab.value) {
      case 0:
        this.dataSourceUninsured.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceUninsured.paginator) {
          this.dataSourceUninsured.paginator.firstPage();
        }
        break;
      case 1:
        this.dataSourceInsured.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceInsured.paginator) {
          this.dataSourceInsured.paginator.firstPage();
        }
        break;
      case 2:
        this.dataSourceCampaign.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceCampaign.paginator) {
          this.dataSourceCampaign.paginator.firstPage();
        }
        break;
    }
  }

  // Asegurar Alumno
  public insuredStudent(student: IIMSSTable) {
    Swal.fire({
      title: 'Asegurar Alumno',
      text: `¿Está seguro de asegurar al estudiante ${student.name}?`,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: 'green',
      cancelButtonColor: 'red',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        this.loadingService.setLoading(true);
        this.studentProvider.insuredStudent(student.controlNumber)
          .subscribe(_ => {
            this.loadingService.setLoading(false);
            this.notificationServ.showNotification(eNotificationType.SUCCESS, 'IMSS', 'Estudiante asegurado con éxito');
            this._getAllUninsured();
            this._getAllCampaign();
          }, _ => {
            this.notificationServ.showNotification(eNotificationType.ERROR, 'IMSS', 'Error, no se pudo asegurar al estudiante');
            this.loadingService.setLoading(false);
          });
      }
    });
  }

  // Remover Seguro
  public uninsuredStudent(student: IIMSSTable) {
    Swal.fire({
      title: 'Cancelación de Seguro',
      text: `¿Está seguro de cancelar el seguro al estudiante ${student.name}?`,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        this.loadingService.setLoading(true);
        this.studentProvider.uninsuredStudent(student.controlNumber)
          .subscribe(_ => {
            this.loadingService.setLoading(false);
            this.notificationServ.showNotification(eNotificationType.SUCCESS, 'IMSS', 'Se ha dado de baja el seguro con éxito');
            this._getAllInsured();
            this._getAllCampaign();
          }, _ => {
            this.notificationServ.showNotification(eNotificationType.ERROR, 'IMSS', 'Error al dar de baja el seguro al estudiante');
            this.loadingService.setLoading(false);
          });
      }
    });
  }

  // Refrescar datos de tablas
  public refreshInsured() {
    this._getAllInsured();
  }

  public refreshUninsured() {
    this._getAllUninsured();
  }

  public refreshCampaign() {
    this._getAllCampaign();
  }

  // Cargar archivo .csv
  public uploadCsv(event) {
    const provider = this.studentProvider;
    const notificacion = this.notificationServ;
    const students = [];
    if (event.target.files && event.target.files[0]) {
      Papa.parse(event.target.files[0], {
        complete: (results) => {
          if (results.data.length > 0) {
            results.data.slice(1).forEach(element => {
              if (element[0]) {
                const index = students.findIndex(student => student.controlNumber === element[0]);
                if (index === -1) {
                  students.push({ controlNumber: element[0] });
                }
              }
            });
            const _data = {
              config: {
                title: 'Asegurar Estudiantes',
                displayedColumns: ['controlNumber'],
                displayedColumnsName: ['Número de control']
              },
              componentData: students
            };
            const refDialog = this._openDialog(LoadCsvDataComponent, 'ImssInsured', _data);
            refDialog.afterClosed().subscribe((_students: Array<any>) => {
              if (_students) {
                this.loadingService.setLoading(true);
                provider.insuredStudentsCsv(_students).subscribe(_ => {
                  this.loadingService.setLoading(false);
                  notificacion.showNotification(eNotificationType.SUCCESS, 'IMSS', 'Estudiantes asegurados con éxito');
                  this.changeTab(this.selectedTab.value);
                  this.fileUpload.nativeElement.value = '';
                }, _ => {
                  this.notificationServ.showNotification(eNotificationType.ERROR, 'IMSS', 'Ocurrió un error al asegurar los estudiantes');
                  this.loadingService.setLoading(false);
                  this.fileUpload.nativeElement.value = '';
                });
              } else {
                this.fileUpload.nativeElement.value = '';
              }
            });
          }
        }
      });
    }
  }

  // Descargar plantilla csv
  downloadTemplateCsv() {
    const ExampleStudents = [
      {nc: 'Número de Control'},
      {nc: '14400971'},
      {nc: '14400972'},
      {nc: '14400973'},
      {nc: '14400974'},
      {nc: '14400975'}
    ];
    new Angular5Csv(ExampleStudents, 'Plantilla Estudiantes Asegurados IMSS');
  }

  public convertCsv(event) {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      const students = [];
      Papa.parse(file, {
        complete: (result: any) => {
          const data = result ? result.data : null;
          if (data && data.length) {
            data.slice(1).forEach((row: any) => {
              if (row.length >= 4) {
                const student = this._castStudentImss(row);
                const index = students.findIndex(_student => _student.nss === student.nss);
                if (index === -1) {
                  students.push(student);
                }
              }
            });
            const _data = {
              config: {
                title: 'Datos leídos',
                displayedColumns: ['nss', 'name', 'date'],
                displayedColumnsName: ['NSS', 'Nombre', 'Fecha de alta']
              },
              componentData: students
            };
            const refDialog = this._openDialog(LoadCsvDataComponent, 'ImssData', _data);
            refDialog.afterClosed().subscribe((_imssData: Array<any>) => {
              if (_imssData && _imssData.length) {
                this.loadingService.setLoading(true);
                this.studentProvider.convertCsv(_imssData)
                  .subscribe((csvData) => {
                    this.loadingService.setLoading(false);
                    const imssData = csvData.reverse();
                    const headerCsv = {
                      controlNumber: 'Número de control',
                      nss: 'NSS',
                      name: 'Nombre',
                      date: 'Fecha de alta',
                      maxSemester: 'Semestres máximos',
                    };
                    imssData.push(headerCsv);
                    new Angular5Csv(csvData.reverse(), 'IMSS');
                  }, (_) => {
                    this.loadingService.setLoading(false);
                    this.notificationServ.showNotification(eNotificationType.ERROR, 'IMSS', 'Error al convertir csv para descarga.');
                  });
              }
            });
          }
        }
      });
    }
    this.fileImss.nativeElement.value = '';
  }

  public regularizeNss() {
    this.loadingService.setLoading(true);
    this.studentProvider.regularizeNss()
      .subscribe((_) => {
        this.loadingService.setLoading(false);
        this.notificationServ.showNotification(eNotificationType.SUCCESS, 'IMSS', 'NSS actualizados');
        this.changeTab(this.selectedTab.value);
      }, (_) => {
        this.loadingService.setLoading(false);
        this.notificationServ.showNotification(eNotificationType.ERROR, 'IMSS', 'Ocurrió un error, inténtalo de nuevo');
      });
  }

  // Obtener alumnos no asegurados
  private _getAllInsured() {
    this.loadingService.setLoading(true);
    this.studentProvider.studentsImssInsured()
      .subscribe(res => {
        const data = res.students.map(this._castToTable);
        this._refreshInsured(data);
      }, _ => {
        this.notificationServ.showNotification(eNotificationType.ERROR, 'IMSS', 'No se pudieron cargar los estudiantes asegurados');
        this.loadingService.setLoading(false);
      }, () => {
        this.loadingService.setLoading(false);
      });
  }

  // Obtener alumnos asegurados
  private _getAllUninsured() {
    this.loadingService.setLoading(true);
    this.studentProvider.studentsImssUninsured()
      .subscribe(res => {
        const data = res.students.map(this._castToTable);
        this._refreshUninsured(data);
      }, _ => {
        this.notificationServ.showNotification(eNotificationType.ERROR, 'IMSS', 'No se pudieron cargar los estudiantes no asegurados');
        this.loadingService.setLoading(false);
      }, () => {
        this.loadingService.setLoading(false);
      });
  }

  // Obtener alumnos campaña credencializacion
  private _getAllCampaign() {
    this.loadingService.setLoading(true);
    this.studentProvider.studentsCampaign()
      .subscribe(res => {
        const data = res.students.map(this._castToTable);
        this._refreshCampaign(data);
      }, _ => {
        this.notificationServ.showNotification(eNotificationType.ERROR, 'No se pudieron cargar los estudiantes de campaña', '');
        this.loadingService.setLoading(false);
      }, () => {
        this.loadingService.setLoading(false);
      });
  }

  // Refrescar datos de tablas
  private _refreshInsured(data: Array<any>): void {
    this.dataSourceInsured = new MatTableDataSource(data);
    this.dataSourceInsured.paginator = this.paginatorInsured;
    this.dataSourceInsured.sort = this.sort;
  }

  private _refreshCampaign(data: Array<any>): void {
    this.dataSourceCampaign = new MatTableDataSource(data);
    this.dataSourceCampaign.paginator = this.paginatorCampaign;
    this.dataSourceCampaign.sort = this.sort;
    this.templateImssCampaign = this.dataSourceCampaign.data.filter( student => student.insured === 'No');
  }

  private _refreshUninsured(data: Array<any>): void {
    this.dataSourceUninsured = new MatTableDataSource(data);
    this.dataSourceUninsured.paginator = this.paginatorUninsured;
    this.dataSourceUninsured.sort = this.sort;
  }

  private _castToTable(data) {
    return {
      _id: data._id ? data._id : '',
      controlNumber: data.controlNumber ? data.controlNumber : '',
      name: data.fullName ? data.fullName : '',
      career: data.career ? data.career : '',
      nss: (data.nss && data.nss.length === 11) ? data.nss : '',
      registerDateImss: (data.documents || []).some(doc => doc.type.toUpperCase() === 'IMSS') ? moment(data.documents.filter(doc => doc.type === 'IMSS').map(doc => doc.releaseDate)+'').format('LL') : '',
      registerDateCampaign: (data.documents || []).some(doc => doc.type.toUpperCase() === 'CREDENCIAL') ? moment(data.documents.filter(doc => doc.type === 'CREDENCIAL').map(doc => doc.releaseDate)+'').format('LL') : '',
      fatherLastName: data.fatherLastName ? data.fatherLastName : '',
      motherLastName: data.motherLastName ? data.motherLastName : '',
      firstName: data.firstName ? data.firstName : '',
      curp: data.curp ? data.curp : '',
      insured: (data.documents || []).some(doc => doc.type.toUpperCase() === 'IMSS') ? 'Si' : 'No',
      printCredential: (data.documents || []).some(doc => doc.type.toUpperCase() === 'CREDENCIAL' && doc.status[0].active) ? 'Si' : 'No'

    };
  }

  private _openDialog(component: ComponentType<any>, id?: string, data?: any) {
    return this.dialog.open(component, {
      id: id ? id : '',
      data: data ? data : null,
      disableClose: true,
      hasBackdrop: true,
      width: '50em'
    });
  }

  excelExportIMSS(){
    this.notificationServ.showNotification(eNotificationType.INFORMATION, 'EXPORTANDO DATOS', '');
    this.loadingService.setLoading(true);
    TableToExcel.convert(document.getElementById('tablaPlantillaExcelIMSS'), {
      name: 'Plantilla Alumnos IMSS.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
    this.loadingService.setLoading(false);
  }

  excelExportIMSSCampaign(){
    this.notificationServ.showNotification(eNotificationType.INFORMATION, 'EXPORTANDO DATOS', '');
    this.loadingService.setLoading(true);
    TableToExcel.convert(document.getElementById('tablaPlantillaExcelIMSSCampaign'), {
      name: 'Plantilla Alumnos IMSS Campaña.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
    this.loadingService.setLoading(false);
  }

  excelExportUninsured(){
    this.notificationServ.showNotification(eNotificationType.INFORMATION, 'EXPORTANDO DATOS', '');
    TableToExcel.convert(document.getElementById('tablaReporteUninsured'), {
      name: 'Alumnos No Asegurados.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
  }

  excelExportInsured(){
    this.notificationServ.showNotification(eNotificationType.INFORMATION, 'EXPORTANDO DATOS', '');
    TableToExcel.convert(document.getElementById('tablaReporteInsured'), {
      name: 'Alumnos Asegurados.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
  }

  excelExportCampaign(){
    this.notificationServ.showNotification(eNotificationType.INFORMATION, 'EXPORTANDO DATOS', '');
    TableToExcel.convert(document.getElementById('tablaReporteCampaign'), {
      name: 'Alumnos Campaña Credencializacion.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
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

  private _castStudentImss(row: any) {
    const nss: string[] = (row[0] || '').split('-');
    return {
      controlNumber: '',
      nss: nss.join(''),
      name: row[1] || '',
      date: row[3] || '',
      maxSemester: row[2] || '',
    };
  }

  generatePDF(student) {
    if (student.nss) {

      Swal.fire({
        title: 'Imprimir Credencial',
        text: `¿Está seguro de imprimir credencial del estudiante ${student.name}?`,
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonColor: 'green',
        cancelButtonColor: 'red',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.value) {
          this.printCredential(student);
        }
      });
    } else {
      this.loadingService.setLoading(false);
      this.notificationServ.showNotification(eNotificationType.ERROR, 'No tiene NSS asignado', '');
    }
  }

  async printCredential(student){
    this.loadingService.setLoading(true);
    await this.getDocuments(student._id);
    if (this.photoStudent !== '' && this.photoStudent !== 'assets/imgs/studentAvatar.png') {
      const doc = new jsPDF({
        unit: 'mm',
        format: [251, 158],
        orientation: 'landscape'
      });

      // cara frontal de la credencial
      doc.addImage(this.frontBase64, 'PNG', 0, 0, 88.6, 56);
      doc.addImage(this.photoStudent, 'PNG', 3.6, 7.1, 25.8, 31);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica');
      doc.setFontType('bold');
      doc.text(49, 30.75, doc.splitTextToSize(student.name, 35));
      doc.text(49, 38.6, doc.splitTextToSize(this.reduceCareerString(student.career), 35));
      doc.text(49, 46.5, doc.splitTextToSize(student.nss, 35));

      // cara trasera de la credencial
      doc.addPage();
      doc.addImage(this.backBase64, 'PNG', 0, 0, 88.6, 56);

      // Agregar años a la credencial
      const year = new Date();
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(4);
      doc.setFont('helvetica');
      doc.setFontType('bold');
      doc.text(9.5, 41.3,year.getFullYear()+'');
      doc.text(16.5, 41.3,(year.getFullYear()+1)+'');
      doc.text(23.5, 41.3,(year.getFullYear()+2)+'');
      doc.text(30.5, 41.3,(year.getFullYear()+3)+'');
      doc.text(37.5, 41.3,(year.getFullYear()+4)+'');

      // // Numero de control con codigo de barra
      doc.addImage(this.textToBase64Barcode(student.controlNumber), 'PNG', 46.8, 39.2, 33, 12);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.text(57, 53.5, doc.splitTextToSize(student.controlNumber, 35));
      // this.loading=false;
      this.loadingService.setLoading(false);
      window.open(doc.output('bloburl'), '_blank');

      this.studentProvider.registerCredentialStudent(student._id,true)
      .subscribe(_ => {
        this._getAllCampaign();
      }, _ => {
      });

    } else {
      this.loadingService.setLoading(false);
      this.notificationServ.showNotification(eNotificationType.ERROR, 'No cuenta con fotografía', '');
    }
  }

  getBase64ForStaticImages() {
    this.imageToBase64Serv.getBase64('assets/imgs/front45A.jpg').then(res1 => {
      this.frontBase64 = res1;
    });

    this.imageToBase64Serv.getBase64('assets/imgs/back3.jpg').then(res2 => {
      this.backBase64 = res2;
    });
  }

  async getDocuments(id) {
    this.photoStudent = '';
    this.imageDoc = null;
    this.showImg = false;

    await this.studentProvider.getDriveDocuments(id).toPromise().then(
      async docs => {
        let documents = docs.documents;
        if (documents) {

          this.imageDoc = documents.filter(docc => docc.filename.indexOf('png') !== -1 || docc.filename.indexOf('jpg') !== -1 ||  docc.filename.indexOf('PNG') !== -1 || docc.filename.indexOf('JPG') !== -1 ||  docc.filename.indexOf('jpeg') !== -1 || docc.filename.indexOf('JPEG') !== -1)[0];
          this.showImg = true;
          if (this.imageDoc) {
            this.haveImage = true;
            await this.inscriptionProv.getFile(this.imageDoc.fileIdInDrive, this.imageDoc.filename).toPromise().then(
              succss => {
                this.showImg = true;
                this.photoStudent = "data:image/jpg"+";base64,"+succss.file;
              },
              err => { this.photoStudent = 'assets/imgs/studentAvatar.png'; this.showImg = true; }
            );
          }else{
            this.haveImage = false;
            this.showImg = true;
            this.photoStudent = 'assets/imgs/studentAvatar.png';
          }
        } else {
          this.haveImage = false;
          this.showImg = true;
          this.photoStudent = 'assets/imgs/studentAvatar.png';
        }
      }
    );
  }

  reduceCareerString(career: string): string {
    if (career.length < 33) {
      return career;
    }

    switch (career) {
      case 'DOCTORADO EN CIENCIAS EN ALIMENTOS':
        return 'DOC. EN CIENCIAS EN ALIMENTOS';

      case 'INGENIERÍA EN GESTIÓN EMPRESARIAL':
        return 'ING. EN GESTION EMPRESARIAL';


      case 'INGENIERÍA EN SISTEMAS COMPUTACIONALES':
        return 'ING. EN SISTEMAS COMPUTACIONALES';

      case 'MAESTRÍA EN TECNOLOGÍAS DE LA INFORMACIÓN':
        return 'MAESTRÍA EN TEC. DE LA INFORMACIÓN';

      case 'MAESTRÍA EN CIENCIAS EN ALIMENTOS':
        return 'MAEST. EN CIENCIAS EN ALIMENTOS';

      default:
        return 'ING. EN TEC. DE LA INF. Y COM.';
    }

  }

  textToBase64Barcode(text) {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, { format: 'CODE128', displayValue: false });
    return canvas.toDataURL('image/png');
  }

  removePrintCredential(student){
    Swal.fire({
      title: 'Remover Credencial',
      text: `¿Está seguro de remover credencial impresa al estudiante ${student.name}?`,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: 'green',
      cancelButtonColor: 'red',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        this.loadingService.setLoading(true);
        this.studentProvider.registerCredentialStudent(student._id,false)
        .subscribe(_ => {
          this.loadingService.setLoading(false);
          this._getAllCampaign();
          this.notificationServ.showNotification(eNotificationType.SUCCESS, 'IMSS', 'Credencial removida con éxito');
        }, _ => {
          this.notificationServ.showNotification(eNotificationType.ERROR, 'IMSS', 'Error, no se pudo remover la credencial');
          this.loadingService.setLoading(false);
        });
      }
    });
  }

}

interface IIMSSTable {
  _id?: string;
  controlNumber?: string;
  name?: string;
  career?: string;
  nss?: string;
  registerDateImss?: string;
  action?: string;
  fatherLastName?
  motherLastName?: string;
  firstName?: string;
  curp?: string;
  insured?: string;
  printCredential?: string;
  registerDateCampaign?: string;
}
