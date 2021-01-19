import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {ControlStudentProv} from '../../../providers/social-service/control-student.prov';
import {LoadingService} from '../../../services/app/loading.service';
import {CookiesService} from '../../../services/app/cookie.service';
import {NotificationsServices} from '../../../services/app/notifications.service';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';
import {InitConstancy} from '../../../entities/social-service/initConstancyRequest';
import {ImageToBase64Service} from '../../../services/app/img.to.base63.service';
import {InitConstancyModel} from '../../../entities/social-service/initConstancy.model';
import {InscriptionsProvider} from '../../../providers/inscriptions/inscriptions.prov';

@Component({
  selector: 'app-control-subprincipal-page',
  templateUrl: './control-subprincipal-page.component.html',
  styleUrls: ['./control-subprincipal-page.component.scss']
})
export class ControlSubprincipalPageComponent implements OnInit {
  public selectedTab: FormControl;
  public search: string;

  @ViewChild(MatSort) sortAll: MatSort;
  @ViewChild('matPaginatorAll') paginatorAll: MatPaginator;
  public displayedColumnsAll: string[];
  public displayedColumnsAllName: string[];
  public dataSourceAll: MatTableDataSource<any>;

  @ViewChild(MatSort) sortForSign: MatSort;
  @ViewChild('matPaginatorForSign') paginatorForSign: MatPaginator;
  public displayedColumnsForSign: string[];
  public displayedColumnsForSignName: string[];
  public dataSourceForSign: MatTableDataSource<any>;

  private userData;

  private studentToSign: Array<any> = new Array<any>();
  public flagStudentToSign = true;

  initConstancy: InitConstancy;
  formDocument: InitConstancyModel;

  constructor( private controlStudentProv: ControlStudentProv,
               private loadingService: LoadingService,
               private cookiesService: CookiesService,
               public imgSrv: ImageToBase64Service,
               private inscriptionsProv: InscriptionsProvider,
               private notificationsService: NotificationsServices ) {
    this.userData = this.cookiesService.getData().user;
    this.selectedTab = new FormControl(0);
  }

  ngOnInit() {
    this._getAll();
    this.displayedColumnsAll = ['no', 'fullName', 'controlNumber', 'career', 'status', 'actions'];
    this.displayedColumnsAllName = ['Nombre', 'Número de control', 'Carrera', 'Estatus'];
    this.displayedColumnsForSign = ['select', 'no', 'fullName', 'controlNumber', 'career', 'status', 'actions'];
    this.displayedColumnsForSignName = ['Nombre', 'Número de control', 'Carrera', 'Estatus'];
    this.initConstancy = new InitConstancy(this.imgSrv, this.cookiesService);
  }

  public changeTab(event) {
    this.selectedTab.setValue(event);
    switch (event) {
      case 0:
        return this._getAll();
      case 1:
        return this._getForSign();
    }
  }

  public applyFilter(filterValue: string) {
    switch (this.selectedTab.value) {
      case 0:
        this.dataSourceAll.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceAll.paginator) {
          this.dataSourceAll.paginator.firstPage();
        }
        break;
      case 1:
        this.dataSourceForSign.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceForSign.paginator) {
          this.dataSourceForSign.paginator.firstPage();
        }
    }
  }

  signDocument(event, student) {
    student.check = event.checked;
    if (event.checked) {
      this.studentToSign.push(student);
      this.flagStudentToSign = false;
    } else {
      const index = this.studentToSign.findIndex(st => st.controlNumber === student.controlNumber);
      this.studentToSign.splice(index, 1);
      if (this.studentToSign.length === 0) {
        this.flagStudentToSign = true;
      }
    }
  }

  selectAll(event) {
    this.dataSourceForSign.data.forEach(fs => {
      if (event.checked) {
        if (!fs.check) {
          fs.check = true;
          this.studentToSign.push(fs);
        }
      } else {
        fs.check = false;
        this.studentToSign.pop();
      }
    });
    if (!event.checked) {
      this.flagStudentToSign = true;
    }
  }

  signConstancyDoc() {
    if (this.studentToSign.length === 0) {
      this.notificationsService.showNotification(eNotificationType.ERROR, 'Atención', 'No hay alumnos en estatus de firma');
      return;
    }
    for (const student of this.studentToSign) {
      this.loadingService.setLoading(true);
      const controlStudentId = student.id;
      this.controlStudentProv.getControlStudentById(controlStudentId)
        .subscribe(response => {
          const formDoc = this._castToDoc(response.controlStudent);
          this.initConstancy.setConstancyRequest(formDoc);
          this.saveDocument(this.initConstancy.documentSend(),
            true, '', response.controlStudent.studentId.folderIdSocService.idFolderInDrive, controlStudentId)
            .then(() => {
              this.controlStudentProv.updateGeneralControlStudent(controlStudentId,
                {'verification.signs.constancy.signSubPrincipalDate': new Date(),
                  'verification.signs.constancy.signSubPrincipalName': this.userData.name.fullName,
                  'verification.constancy': 'approved',
                  'status': 'approved'} )
                .subscribe( res => {
                  // this._pushHistoryDocumentStatus('SE CREO', 'CREACIÓN DE DOCUMENTO DE SOLICITUD', this.userData.name.fullName);
                  this.notificationsService.showNotification(eNotificationType.SUCCESS, res.msg, '');
                  this.refreshForSign();
                  this.loadingService.setLoading(false);
                }, () => {
                  this.notificationsService.showNotification(eNotificationType.INFORMATION, 'Atención',
                    'No se ha podido guardar la información de firma del responsable');
                  this.loadingService.setLoading(false);
                });
            }).catch(() => {
            this.notificationsService.showNotification(eNotificationType.INFORMATION, 'Error',
              'Vuelva a intentarlo mas tarde.');
            this.loadingService.setLoading(false);
          });
        });
    }
  }

  saveDocument(document, statusDoc: boolean, fileId: string, studentFolderId: string, controlStudentId: string) {
    return new Promise((resolve, reject) => {
      const documentInfo = {
        mimeType: 'application/pdf',
        nameInDrive: 'ITT-POC-08-08 Constancia de Servicio Social.pdf',
        bodyMedia: document,
        folderId: studentFolderId,
        newF: statusDoc,
        fileId: fileId
      };

      this.inscriptionsProv.uploadFile2(documentInfo).subscribe(
        async updated => {
          if (updated.action === 'create file') {
            const documentInfo4 = {
              doc: {
                filename: updated.name,
                type: 'DRIVE',
                fileIdInDrive: updated.fileId
              },
              status: {
                name: 'ACEPTADO',
                active: true,
                message: 'El departamento lo envio por primera vez'
              }
            };

            await this.controlStudentProv.uploadDocumentDrive(controlStudentId, documentInfo4).subscribe( () => {
                this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Se ha generado la constancia de Servicio Social del Estudiante', '');
                resolve();
              },
              err => {
                console.log(err);
                reject();
              });
          } else {
            const docStatus = {
              name: 'ACEPTADO',
              active: true,
              message: 'El departamento actualizo el documento'
            };
            await this.controlStudentProv.updateDocumentLog(controlStudentId, {filename: updated.filename, status: docStatus})
              .subscribe( () => {
                this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Exito', 'Solicitud actualizada correctamente.');
                resolve();
              }, err => {
                console.log(err);
                reject();
              });
          }
        },
        err => {
          console.log(err);
          reject();
        }
      );
    });
  }

  _getAll() {
    this.loadingService.setLoading(true);
    // Obtener las solicitudes aprovadas
    this.controlStudentProv.getAllControlStudents().subscribe(res => {
        const request = res.controlStudents.map(this._castToTable);
        this._refreshAll(request);
      }, () => {
        this.notificationsService.showNotification(eNotificationType.ERROR,
          'Error', 'Ha sucedido un error en la descarga de la información');
        this.loadingService.setLoading(false);
      }, () => {
        this.loadingService.setLoading(false);
      }
    );
  }

  _getForSign() {
    this.loadingService.setLoading(true);
    // Obtener las solicitudes aprovadas
    this.controlStudentProv.getControlStudentByGeneralStatus('preSign').subscribe(res => {
        const readyToSign = res.controlStudents.filter(c => c.verification.constancy === 'firstSign');
        const request = readyToSign.map(this._castToTable);
        this._refreshForSign(request);
      }, () => {
        this.notificationsService.showNotification(eNotificationType.ERROR,
          'Error', 'Ha sucedido un error en la descarga de la información');
        this.loadingService.setLoading(false);
      }, () => {
        this.loadingService.setLoading(false);
      }
    );
  }

  public refreshAll() {
    this._getAll();
  }

  public refreshForSign() {
    this._getForSign();
    this.selectAll({checked: false});
  }

  private _refreshAll(data: Array<any>): void {
    this.dataSourceAll = new MatTableDataSource(data);
    this.dataSourceAll.paginator = this.paginatorAll;
    this.dataSourceAll.sort = this.sortAll;
  }

  private _refreshForSign(data: Array<any>): void {
    this.dataSourceForSign = new MatTableDataSource(data);
    this.dataSourceForSign.paginator = this.paginatorForSign;
    this.dataSourceForSign.sort = this.sortForSign;
  }

  _castToTable(data) {
    return {
      id: data._id,
      check: false,
      fullName: data.studentId.fullName,
      controlNumber: data.controlNumber,
      career: data.studentId.career,
      status: data.status === 'solicitude' ? 'Solicitud' :
        data.status === 'process' ? 'Proceso' :
        data.status === 'preAssigned' ? 'Registro de constancia' :
        data.status === 'preSign' ? 'Constancia firmada por Vinculación' : 'Liberado'
    };
  }

  private _castToDoc(data) {
    return {
      student: data.studentId,
      dependencyName: data.dependencyName,
      dependencyDepartmentManager: data.dependencyDepartmentManager,
      dependencyProgramName: data.dependencyProgramName,
      initialDate: data.initialDate,
      tradeConstancyDocumentNumber: data.tradeConstancyDocumentNumber,
      performanceLevelConstancyDocument: data.performanceLevelConstancyDocument,
      departmentSignName: data.verification.signs.constancy.signDepartmentName,
      departmentSignDate: data.verification.signs.constancy.signDepartmentDate
    };
  }
}
