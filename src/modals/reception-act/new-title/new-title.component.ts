import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { CookiesService } from 'src/services/app/cookie.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { EmployeeAdviserComponent } from '../employee-adviser/employee-adviser.component';
import { eOperation } from 'src/enumerators/reception-act/operation.enum';
import * as moment from 'moment';
import { sourceDataProvider } from 'src/providers/reception-act/sourceData.prov';
import { eRequest } from 'src/enumerators/reception-act/request.enum';
import { eStatusRequest } from 'src/enumerators/reception-act/statusRequest.enum';
import Swal from 'sweetalert2';
import { RequestProvider } from 'src/providers/reception-act/request.prov';
moment.locale('es');
@Component({
  selector: 'app-new-title',
  templateUrl: './new-title.component.html',
  styleUrls: ['./new-title.component.scss']
})
export class NewTitleComponent implements OnInit {
  public existError: string = '';
  public existWarning: string = '';
  public frmNewTitle: FormGroup;
  public controlNumber: string;
  public nip: string;
  private juryInfo: Array<{ name: string, title: string, cedula: string }>;
  public options: Array<string>;
  public products: Array<Array<string>>;
  public index: number = 0;
  public title: string;
  public date: Date;
  public notFound: boolean;
  public showLoading: boolean;
  private event: { appointment: Date, minutes: number, abbreviation: string };
  public request: {
    studentId: string, student: string, controlNumber: string, career: string,
    projectName?: string, phase?: string, status?: string, proposedDate?: Date, proposedHour?: number,
    duration?: number, place?: string, jury?: Array<{ name: string, title: string, cedula: string }>,
    titulationOption?: string, product?: string, isIntegral?: boolean
  };
  constructor(
    public dialogRef: MatDialogRef<NewTitleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private _StudentProvider: StudentProvider,
    private _NotificationsServices: NotificationsServices,
    private _CookiesService: CookiesService,
    private _sourceDataProvider: sourceDataProvider,
    private _RequestProvider: RequestProvider
  ) {
    this.date = data.operation === eOperation.NEW ? data.date : new Date(data.event.start);
    this.event = { appointment: this.date, minutes: (this.date.getHours() * 60 + this.date.getMinutes()), abbreviation: data.operation === eOperation.NEW ? '' : data.event.title.split(' ')[1] };
    this.title = "NUEVA TITULACIÓN A LAS " + moment(this.date).format('LT');
    this.options = [
      'I - TESIS PROFESIONAL',
      'II - ELABORACIÓN DE TEXTOS, PROTOTIPOS O INSTRUCTIVOS PARA PRÁCTICAS DE LABORATORIO O TALLER',
      'III - PARTICIPACIÓN EN PROYECTOS DE INVESTIGACIÓN',
      'IV - DISEÑO O REDISEÑO DE EQUIPO, APARATOS O MAQUINARIA',
      'V - CURSOS ESPECIALES DE TITULACIÓN',
      'VI - EXAMEN GLOBAL POR ÁREAS DE CONOCIMIENTO Y/O EGEL',
      'VII - MEMORIA DE EXPERIENCIA PROFESIONAL',
      'VIII - ESCOLARIDAD POR PROMEDIO',
      'IX - ESCOLARIDAD POR ESTUDIOS DE POSGRADOS',
      'X - MEMORIA DE RESIDENCIA PROFESIONAL',
      'XI - TITULACIÓN INTEGRAL'
    ]

    this.products = [
      ['ELABORAR TESIS'],
      ['ELABORACIÓN DE MATERIALES DIDÁCTICOS'],
      ['EL ALUMNO PARTICIPA EN INVESTIGACIONES'],
      ['ELABORACIÓN DE ALGÚN DISEÑO'],
      ['CURSOS QUE OFRECE EL INSTITUTO'],
      ['EXÁMENES ESCRITOS Y/O ORALES, DE UNA ESPECIALIDAD'],
      ['ELABORACIÓN DE UNA MEMORIA DEL ÁREA EN QUE LABORAN QUE SEA AFÍN A LA CARRERA'],
      ['OBTENER UN PROMEDIO DE 9.0 EN ADELANTE'],
      ['UN PROMEDIO DE 80 POR CADA MATERIA'],
      ['ELABORACIÓN DE UNA MEMORIA RELACIONADA CON LA RESIDENCIA PROFESIONAL REALIZADA'],
      ['PROYECTO INTEGRADOR', 'PROYECTO PRODUCTIVO', 'PROYECTO DE INNOVACIÓN TECNOLÓGICA',
        'PROYECTO DE EMPRENDEDURISMO', 'PROYECTO INTEGRAL DE EDUCACIÓN DUAL', 'ESTANCIA',
        'TESIS PROFESIONAL', 'PARTICIPACIÓN EN PROYECTOS DE INVESTIGACIÓN',
        'EXAMEN GLOBAL POR ÁREAS DE CONOCIMIENTO'],
    ]

    this.juryInfo = [
      { name: '', title: '', cedula: '' },
      { name: '', title: '', cedula: '' },
      { name: '', title: '', cedula: '' },
      { name: '', title: '', cedula: '' }
    ];
  }

  ngOnInit() {
    this.frmNewTitle = new FormGroup({
      'student': new FormControl(null, Validators.required),
      'career': new FormControl(null, Validators.required),
      'controlNumber': new FormControl(null, Validators.required),
      'duration': new FormControl('60', Validators.required),
      'place': new FormControl('Magna de Titulación (J3)', Validators.required),
      'option': new FormControl(0, Validators.required),
      'product': new FormControl('ELABORAR TESIS', Validators.required),
      'president': new FormControl(null, Validators.required),
      'secretary': new FormControl(null, Validators.required),
      'vocal': new FormControl(null, Validators.required),
      'substitute': new FormControl(null, Validators.required),
      'project': new FormControl(null, Validators.required)
    });
  }
  changedItem(index: any) {
    this.index = index;
  }
  onClose() {
    this.controlNumber = '';
    this.nip = '';
    this.notFound = false;
    this.existError = '';
    this.existWarning = '';
  }

  onSearch() {
    this.existError = '';
    this.existWarning = '';
    this.showLoading=true;
    if (this.notFound) {
      this.notFound = false;
      if (typeof (this.controlNumber) !== 'undefined' && this.controlNumber.trim() !== '' && typeof (this.nip) !== 'undefined' && this.nip.trim() !== '') {
        this._StudentProvider.getByControlNumberSII({ controlNumber: this.controlNumber, nip: this.nip }).subscribe(
          student => {
            this.showLoading=false;
            this.nip = '';
            this.controlNumber = '';
            this.request = {
              studentId: student._id,
              student: student.fullName,
              career: student.career,
              controlNumber: student.controlNumber,
              phase: eRequest.REALIZED,
              status: eStatusRequest.NONE
            };
            if (!student.isGraduate || !student.englishApproved) {
              let errorGraduate = !student.isGraduate ? 'no esta graduado' : '';
              let errorEnglish = !student.englishApproved ? 'carece de la liberación de ingles' : '';
              let errorCompleted: 'no esta graduado y carece de la liberación de ingles';
              this.existWarning = `El estudiante ${!student.isGraduate ?
                (!student.englishApproved ? errorCompleted : errorGraduate) :
                (!student.englishApproved ? errorEnglish : '')}`;
            }
            this.frmNewTitle.get("student").setValue(this.request.student);
            this.frmNewTitle.get("career").setValue(this.request.career);
            this.frmNewTitle.get("controlNumber").setValue(this.request.controlNumber);
          }, error => {
            this.showLoading=false;
            const errorJson = JSON.parse(error._body);
            this.request = { studentId: '', student: '', career: '', controlNumber: '' };
            this.frmNewTitle.get("student").setValue(this.request.student);
            this.frmNewTitle.get("career").setValue(this.request.career);
            this.frmNewTitle.get("controlNumber").setValue(this.request.controlNumber);
            this.existError = errorJson.error;
            this.notFound = true;
            // this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto Recepcional', errorJson.error);
          });
      }
    }
    else {
      if (typeof (this.controlNumber) !== 'undefined' && this.controlNumber.trim() !== '') {
        this._StudentProvider.getByControlNumber(this.controlNumber).subscribe(students => {
          this.showLoading=false;
          if (typeof (students) !== 'undefined' && typeof (students.student) !== 'undefined' && students.student.length > 0) {
            this.request = {
              studentId: students.student[0]._id,
              student: students.student[0].fullName,
              career: students.student[0].career,
              controlNumber: students.student[0].controlNumber,
              phase: eRequest.REALIZED,
              status: eStatusRequest.NONE
            };
            this.frmNewTitle.get("student").setValue(this.request.student);
            this.frmNewTitle.get("career").setValue(this.request.career);
            this.frmNewTitle.get("controlNumber").setValue(this.request.controlNumber);
          } else {            
            this.existError = "Número de control no encontrado";
            this.notFound = true;
            this.request = { studentId: '', student: '', career: '', controlNumber: '' };
            this.frmNewTitle.get("student").setValue(this.request.student);
            this.frmNewTitle.get("career").setValue(this.request.career);
            this.frmNewTitle.get("controlNumber").setValue(this.request.controlNumber);
          }
        }, error => {
          this.showLoading=false;
          this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto Recepcional', error);
        });
      }
    }
  }

  selectEmployee(button: string): void {
    this.frmNewTitle.get(button).markAsUntouched();
    this.frmNewTitle.get(button).setErrors(null);
    this.existError = '';
    const ref = this.dialog.open(EmployeeAdviserComponent, {
      data: {
        carrer: this._CookiesService.getPosition().ascription.careers.length > 0 ? this._CookiesService.getPosition().ascription.careers[0].fullName : ''
      },
      disableClose: true,
      hasBackdrop: true,
      width: '50em'
    });

    ref.afterClosed().subscribe((result) => {

      if (typeof (result) != "undefined") {
        if (this.juryInfo.findIndex(x => x.name === result.ExtraInfo.name) !== -1) {
          // this._NotificationsServices.showNotification(eNotificationType.ERROR, "Acto Recepcional", "Empleado ya asignado");
          this.existError = "Empleado ya asignado";
        } else {
          switch (button) {
            case "president": {
              this.frmNewTitle.patchValue({ 'president': typeof (result) !== 'undefined' ? result.Employee : "" });
              this.juryInfo[0].name = result.ExtraInfo.name;
              this.juryInfo[0].title = result.ExtraInfo.title;
              this.juryInfo[0].cedula = result.ExtraInfo.cedula;
              break;
            }
            case "secretary": {

              this.frmNewTitle.patchValue({ 'secretary': typeof (result) !== 'undefined' ? result.Employee : "" });
              this.juryInfo[1].name = result.ExtraInfo.name;
              this.juryInfo[1].title = result.ExtraInfo.title;
              this.juryInfo[1].cedula = result.ExtraInfo.cedula;
              break;
            }
            case "vocal": {
              this.frmNewTitle.patchValue({ 'vocal': typeof (result) !== 'undefined' ? result.Employee : "" });
              this.juryInfo[2].name = result.ExtraInfo.name;
              this.juryInfo[2].title = result.ExtraInfo.title;
              this.juryInfo[2].cedula = result.ExtraInfo.cedula;
              break;
            }
            case "substitute": {
              this.frmNewTitle.patchValue({ 'substitute': typeof (result) !== 'undefined' ? result.Employee : "" });
              this.juryInfo[3].name = result.ExtraInfo.name;
              this.juryInfo[3].title = result.ExtraInfo.title;
              this.juryInfo[3].cedula = result.ExtraInfo.cedula;
              break;
            }
          }
        }
      }
    });

  }

  onSubmit() {
    this.existError = '';
    this.request.proposedDate = this.date;
    this.request.proposedHour = this.date.getHours() * 60 + this.date.getMinutes();
    this.request.duration = Number(this.frmNewTitle.get('duration').value);
    this.request.place = this.frmNewTitle.get('place').value;
    this.request.jury = this.juryInfo;
    this.request.projectName = this.frmNewTitle.get('project').value;
    this.request.titulationOption = this.options[Number(this.frmNewTitle.get('option').value)];
    this.request.product = this.frmNewTitle.get('product').value;
    this.request.isIntegral = false;
    const tmpSearch = this._sourceDataProvider.getCareerAbbreviation().find(x => x.carrer === this.request.career);
    if (this.data.operation === eOperation.NEW) {
      this.event.abbreviation = tmpSearch.abbreviation;
      this.addEvent();
    }
    else {
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
              this.addEvent();
            }
          });
        } else {
          this.addEvent();
        }

      }
      else {
        this._NotificationsServices.showNotification(eNotificationType.ERROR, "Titulacion App", "Carrera no encontrada, reporte el problema a coordinación");
      }
    }
  }

  addEvent(): void {

    this._RequestProvider.titled(this.request).subscribe(data => {
      if (typeof (data) !== 'undefined') {
        this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Acto Recepcional', 'Evento Asignado');
        this.dialogRef.close({
          career: this.request.career,
          value: {
            id: data.request._id,
            student: [this.request.student],
            project: this.request.projectName,
            phase: "Realizado",
            proposedDate: this.event.appointment,
            proposedHour: this.event.minutes,
            jury: this.request.jury,
            place: this.request.place,
            duration: this.request.duration,
            option: this.request.titulationOption,
            product: this.request.product
          }
        });
      }
    }, error => {
      this.existError = JSON.parse(error._body).message;
      // this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto Recepcional', message);
    });
  }
}
