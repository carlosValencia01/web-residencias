import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { sourceDataProvider } from 'src/providers/reception-act/sourceData.prov';
import Swal from 'sweetalert2';
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { eStatusRequest } from 'src/enumerators/reception-act/statusRequest.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { eOperation } from 'src/enumerators/reception-act/operation.enum';
import * as moment from 'moment';
moment.locale('es');
@Component({
  selector: 'app-new-event',
  templateUrl: './new-event.component.html',
  styleUrls: ['./new-event.component.scss']
})
export class NewEventComponent implements OnInit {
  frmNewEvent: FormGroup;
  dataSource: MatTableDataSource<IRowStudent>;
  dataStudent: Array<IRowStudent>;
  search: string = '';
  selectRow: IRowStudent;
  // dataExist: boolean = true;
  event: { appointment: Date, minutes: number, abbreviation: string };
  displayedColumns: Array<string>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  title: string;
  constructor(public dialogRef: MatDialogRef<NewEventComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _StudentProvider: StudentProvider,
    private _NotificationsServices: NotificationsServices,
    private _sourceDataProvider: sourceDataProvider,
    private _RequestProvider: RequestProvider,
    private _CookiesService: CookiesService) {
    this.dataStudent = [];
    // let tmpDate: Date;
    // if (data.operation === eOperation.NEW) {
    //   tmpDate = new Date(data.date);
    //   this.event = { appointment: tmpDate, minutes: (tmpDate.getHours() * 60 + tmpDate.getMinutes()), abbreviation: 'None' };
    // } else {
    //   tmpDate = new Date(data.event.start);
    //   this.event = { appointment: tmpDate, minutes: (tmpDate.getHours() * 60 + tmpDate.getMinutes()), abbreviation: data.event.title.split(' ')[1] };
    // }
    // console.log("operation", data.operation);
    const tmpDate = data.operation === eOperation.NEW ? data.date : new Date(data.event.start);
    // console.log("operation",tmpDate);
    this.event = { appointment: tmpDate, minutes: (tmpDate.getHours() * 60 + tmpDate.getMinutes()), abbreviation: data.operation === eOperation.NEW ? '' : data.event.title.split(' ')[1] };
    // console.log("evento", this.event);
    this.displayedColumns = ['controlNumber', 'fullName', 'career', 'select']
    this.title = "NUEVO EVENTO A LAS " + moment(tmpDate).format('LT');
    // this.onRefresh();
  }

  ngOnInit() {
    this.frmNewEvent = new FormGroup({
      'place': new FormControl(null, Validators.required),
      'student': new FormControl(null, Validators.required),
      'duration': new FormControl('60', Validators.required)
    });
    this.onSearch();
  }

  onRefresh(): void {
    this.dataSource = new MatTableDataSource(this.dataStudent);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onSelect(row): void {
    if (typeof (row) !== 'undefined') {
      this.selectRow = row;
      this.frmNewEvent.get('student').setValue(row.fullName);
    }
  }

  onSearch(): void {
    // this.dataExist = false;
    // if (this.search.trim() !== '') {
    // this._StudentProvider.searchStudents(this.search).subscribe(res => {
    this._RequestProvider.StudentsToSchedule().subscribe(res => {
      const tmpData: Array<any> = res.Students;
      this.dataStudent = [];
      if (tmpData.length != 0) {
        // this.dataExist = true;
        tmpData.forEach(e => {
          this.dataStudent.push({ _id: e.Student[0]._id, fullName: e.Student[0].fullName, career: e.Student[0].career, controlNumber: e.Student[0].controlNumber, select: '', request: e._id })
        });
      }
      this.onRefresh();
    }, err => {
      this._NotificationsServices.showNotification(eNotificationType.ERROR, "Titulación App", err);
    });
    // }
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  onSubmit(): void {
    const tmpSearch = this._sourceDataProvider.getCareerAbbreviation().find(x => x.carrer === this.selectRow.career);
    if (this.data.operation === eOperation.NEW) {
      this.event.abbreviation = tmpSearch.abbreviation;
      this.addEvent(this.selectRow.request, this.event);
    } else {
      let existsEvent: boolean = false;
      if (typeof (tmpSearch) !== 'undefined') {
        if (tmpSearch.abbreviation === this.event.abbreviation) {
          existsEvent = true;
        } else {
          switch (tmpSearch.abbreviation) {
            case 'ISIC': {
              existsEvent = this.event.abbreviation === 'ITIC';
              break;
            }
            case 'ITIC': {
              existsEvent = this.event.abbreviation === 'ITIC';
            }
            case 'IQUI': {
              existsEvent = this.event.abbreviation === 'IBQA';
              break;
            }
            case 'IBQA': {
              existsEvent = this.event.abbreviation === 'IQUI';
            }
          }
        }
        if (existsEvent) {
          Swal.fire({
            title: '¿Está seguro de confirmar este espacio?',
            text: 'Ya existe un evento del mismo departamento a esa hora.¡No podrás revertir esto!',
            type: 'question',
            showCancelButton: true,
            allowOutsideClick: false,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Aceptar'
          }).then((result) => {
            if (result.value) {
              this.addEvent(this.selectRow.request, this.event);
            }
          });
        } else {
          this.addEvent(this.selectRow.request, this.event);
        }

      }
      else {
        this._NotificationsServices.showNotification(eNotificationType.ERROR, "Titulacion App", "Carrera no encontrada, reporte el problema a coordinación");
      }
    }
  }

  addEvent(request: string, appointment: { appointment: Date, minutes: number, abbreviation: string }): void {
    const data = {
      operation: eStatusRequest.ASSIGN,
      appointment: appointment.appointment,
      minutes: appointment.minutes,
      place: this.frmNewEvent.get('place').value,
      doer: this._CookiesService.getData().user.name.fullName,
      duration: this.frmNewEvent.get('duration').value
    };
    this._RequestProvider.updateRequest(request, data).subscribe(data => {
      // console.log("values_neevent", data);
      if (typeof (data) !== 'undefined') {
        this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Evento Asignado');
        this.dialogRef.close({
          career: this.selectRow.career,
          value: {
            id: data.request._id,
            student: [this.selectRow.fullName],
            phase: "Realizado",
            proposedDate: this.event.appointment,
            proposedHour: this.event.minutes,
            jury: data.request.jury,
            project: data.request.projectName,
            place: data.request.place,
            duration: data.request.duration,
            option: 'XI - TITULACIÓN INTEGRAL',
            product: 'MEMORIA DE RESIDENCIA PROFESIONAL'
          }
        });
      }
    }, error => {
      this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Titulación App', error);
    });
  }
}

interface IRowStudent {
  _id: string, controlNumber: string, fullName: string, career: string, select: string, request?: string
}
