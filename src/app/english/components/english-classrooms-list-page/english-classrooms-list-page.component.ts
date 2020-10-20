import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatTabGroup } from '@angular/material/tabs';

// TABLA
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// Importar Servicios
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';

// Importar Proveedores
import { ClassroomProvider } from 'src/app/english/providers/classroom.prov';

// Importar Componentes

// Importar Enumeradores
import { EDaysSchedule } from 'src/app/english/enumerators/days-schedule.enum';

// Importar Modales

// Importar modelos
import { IClassroom } from '../../entities/classroom.model';

@Component({
  selector: 'app-english-classrooms-list-page',
  templateUrl: './english-classrooms-list-page.component.html',
  styleUrls: ['./english-classrooms-list-page.component.scss']
})
export class EnglishClassroomsListPageComponent implements OnInit {


  // AULAS
  classrooms: IClassroom[];
  classroomForm;
  updateClassroomForm;
  scheduleClassroom: Array<any>
  weekdays = [1, 2, 3, 4, 5, 6]; //Dias de la semana
  hourStart = "07:00"; //Tiempo de inicio
  hourEnd = "21:00"; //Tiempo de finalización
  segment = 60; //Cantidad en minutos de los segmentos
  dataHours = []; //Horas que se van a mostrar
  dataSchedule = []; //Arreglo de los dias seleccionados
  dialogRef: any;
  dayschedule = EDaysSchedule; //Enumerador de los dias de la semana
  searchClassroom = '';
  searchGA = '';
  dataSourceClassrooms: MatTableDataSource<any>;
  @ViewChild('matPaginatorClassrooms') paginatorClassrooms: MatPaginator;
  @ViewChild(MatSort) sortClassrooms: MatSort;
  @ViewChild(MatSort) sortGroups: MatSort;
  @ViewChild("viewCreateClassroom") dialogRefViewCreateClassroom: TemplateRef<any>;
  @ViewChild("scheduleClassroomAux") dialogRefScheduleClassroomAux: TemplateRef<any>;
  @ViewChild("viewScheduleClassroom") dialogRefViewScheduleClassroom: TemplateRef<any>;
  @ViewChild("viewUpdateClassroom") dialogRefViewUpdateClassroom: TemplateRef<any>;
  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;

  constructor(private _CookiesService: CookiesService,
    private _ActivatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private classroomProv: ClassroomProvider,
    public dialog: MatDialog,) {
    if (!this._CookiesService.isAllowed(this._ActivatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.createFormClassroom();
    this.createClassrooms();
  }

  createFormClassroom() {
    this.classroomForm = this.formBuilder.group({
      name: ['', Validators.required],
      schedule: ['', Validators.required],
      capacity: ['30', [Validators.required, Validators.min(1)]],
    });

    this.classroomForm.get('schedule').valueChanges.subscribe(option => {
      switch (option) {
        case '1':
          this.generateAutoSchedule();
          break;
        case '2':
          this.openDialogTableSchedule('1', null);
          break;
      }
    });
  }

  createDataHours() { //Genera las Horas en segmentos

    this.dataHours = [];

    const start = this.getMinutes(this.hourStart); //Convierte la hora de inicio en minutos
    const end = this.getMinutes(this.hourEnd); //Convierte la hora de fin en minutos

    for (let hour = start; hour < end; hour = hour + this.segment) { //Recorrer de inicio a fin incrementando por segmentos
      this.dataHours.push(this.getHour(hour)); //Guardar el segmento de hora
    }

  }

  getHour(minutes): String { //Convierte minutos a tiempo en formato 24-h
    let h = Math.floor(minutes / 60); //Consigue las horas
    let m = minutes % 60; //Consigue los minutos
    let hh = h < 10 ? '0' + h : h; //Asigna un 0 al inicio de la hora si es menor a 10
    let mm = m < 10 ? '0' + m : m; //Asigna un 0 al inicio de los minutos si es menor a 10
    return hh + ':' + mm; //Retorna los minutos en tiempo Ej: "24:00"
  }


  generateSchedule() { //Genera el arreglo en el que se guardaran los valores seleccionados
    this.dataSchedule = [];
    this.dataHours.forEach(a => { //Recorre cada una de las horas
      let week = []; //define arreglo de dias de la semana
      this.weekdays.forEach(b => { //Recorre cada dia de la semana
        week.push(""); //Agrega valor al dia
      });
      this.dataSchedule.push(week); //Agrega los dias de la semana a la hora
    });
  }

  selectHour(hour) { //Seleccionar hora de la Tabla
    //Si todos los campos estan vacios
    if (this.dataSchedule[hour][0] == "" && this.dataSchedule[hour][1] == "" && this.dataSchedule[hour][2] == "" &&
      this.dataSchedule[hour][3] == "" && this.dataSchedule[hour][4] == "" && this.dataSchedule[hour][5] == "") {
      for (let i = 0; i < 5; i++) {//De Lunes a Viernes
        this.dataSchedule[hour][i] = this.dataHours[hour]; //Asignar la hora seleccionada
      }
    } else {//Si no
      for (let i = 0; i < 6; i++) { //De lunes a Sabado
        this.dataSchedule[hour][i] = ""; //Dejar de seleccionar esos dias
      }
    }
  }

  openDialogTableSchedule(type, schedule) {
    let view: any;
    switch (type) {
      case "1":
        this.segment = 60;
        this.createDataHours();
        this.generateSchedule();
        view = this.dialogRefScheduleClassroomAux;
        break;

      case "2":
        this.segment = 30;
        this.createDataHours();
        this.generateSchedule();
        this.getSchedule(schedule, 'status');
        view = this.dialogRefViewScheduleClassroom;
        break;
    }
    this.dialogRef = this.dialog.open(view, { hasBackdrop: true, height: '90%', width: '80%' });
    this.dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        this.classroomForm.get('schedule').setValue('');
      }
    });
  }

  getSchedule(schedule, get) {
    schedule.forEach(element => {

      const psitionHour = this.dataHours.indexOf(this.getHour(element.startHour));

      if (psitionHour > -1) {

        switch (get) {
          case 'status':
            this.dataSchedule[psitionHour][element.day - 1] = element.status;
            break;

          case 'time':
            this.dataSchedule[psitionHour][element.day - 1] = this.dataHours[psitionHour];
            break;
        }

      }
    });
  }

  showHour(hour): boolean { //Mostrar el renglon de la hora
    //Si todos los campos estan vacios
    if (hour[0] == "" && hour[1] == "" && hour[2] == "" &&
      hour[3] == "" && hour[4] == "" && hour[5] == "") {
      return false; //Ocultar
    } else {
      return true; //Mostrar
    }
  }

  generateAutoSchedule() {
    this.scheduleClassroom = [];

    this.segment = 30;

    const start = this.getMinutes(this.hourStart);
    const end = this.getMinutes(this.hourEnd);

    for (let hour = start; hour < end; hour = hour + this.segment) {
      this.weekdays.forEach(day => {
        this.dataHours.push(this.getHour(hour));
        let data = {
          day: day,
          startHour: hour,
          endDate: hour + this.segment,
          status: 'available'
        }
        this.scheduleClassroom.push(data);
      });
    }
  }

  getMinutes(hour): number {
    var hh = parseFloat(hour.split(":", 2)[0])
    var mm = parseFloat(hour.split(":", 2)[1])
    var time = mm + (hh * 60);
    return time;
  }

  createClassrooms() {
    this.loadingService.setLoading(true);
    this.classroomProv.getAllClassroom().subscribe(res => {
      this.classrooms = res.classrooms;
      this.dataSourceClassrooms = new MatTableDataSource(this.classrooms);
      this.dataSourceClassrooms.paginator = this.paginatorClassrooms;
      this.dataSourceClassrooms.sort = this.sortClassrooms;
      this.applyFilter();
    }, error => {
    }, () => this.loadingService.setLoading(false));
  }
  applyFilter() {
    this.dataSourceClassrooms.filter = this.searchClassroom.trim().toLowerCase();
  }
  createScheduleClassroom() {

    this.scheduleClassroom = [];

    this.segment = 30;

    this.dataSchedule.forEach(hourForDay => {

      this.weekdays.forEach(day => {
        if (hourForDay[day - 1]) {

          let startHour = this.getMinutes(hourForDay[day - 1]);
          let endDate = startHour + this.segment;

          let startData = {
            day: day,
            startHour: startHour,
            endDate: endDate,
            status: 'available'
          }

          this.scheduleClassroom.push(startData);

          //
          let endData = {
            day: day,
            startHour: endDate,
            endDate: endDate + this.segment,
            status: 'available'
          }

          this.scheduleClassroom.push(endData);

        }
      });
    });

    if (this.scheduleClassroom.length == 0) {
      Swal.fire({
        title: 'ATENCIÓN!',
        text: 'Es necesario agregar un horario.',
        showConfirmButton: false,
        timer: 2000,
        type: 'warning'
      })
      return false;
    };

    return true;
  }

  onCreateClassroom() {

    var classroom = {
      name: this.classroomForm.get('name').value,
      schedule: this.scheduleClassroom,
      capacity: this.classroomForm.get('capacity').value,

    };

    this.classroomProv.createClassroom(classroom).subscribe(res => {
      this.dialog.closeAll();
      this.ngOnInit();
      Swal.fire({
        title: 'Aula registrada con éxito!',
        showConfirmButton: false,
        timer: 2500,
        type: 'success'
      });
    },
      error => { });
  }

  deleteClassroom(classroomId, classroomName) {

    Swal.fire({
      title: 'Borrar Aula',
      text: `¿Está seguro de eliminar el aula: ` + classroomName + ` ?`,
      type: 'warning',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'green',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
      focusCancel: true
    }).then((result) => {
      if (result.value) {

        this.loadingService.setLoading(true);
        this.classroomProv.deleteClassroom(classroomId).subscribe(res => {
          this.ngOnInit();
          Swal.fire({
            title: 'Eliminada!',
            text: 'El aula se ha eliminado exitosamente.',
            showConfirmButton: false,
            timer: 2500,
            type: 'success'
          })
        }, error => {

        }, () => this.loadingService.setLoading(false));

      }
    });

  }

  openDialogCreateClassroom() {
    this.dialogRef = this.dialog.open(this.dialogRefViewCreateClassroom, { hasBackdrop: true, height: '70%', width: '40%' });
  }

  openDialogUpdateClassroom(classroom) {

    this.segment = 60;
    this.createDataHours();
    this.generateSchedule();
    this.getSchedule(classroom.schedule, 'time');

    this.updateClassroomForm = this.formBuilder.group({
      id: [classroom._id, Validators.required],
      name: [classroom.name, Validators.required],
      capacity: [classroom.capacity, [Validators.required, Validators.min(1)]],
    });

    this.dialogRef = this.dialog.open(this.dialogRefViewUpdateClassroom, { hasBackdrop: true, height: '90%', width: '80%' });

    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onUpdateClassroom();
      }
    });
  }

  verifySchedule() {
    if (this.createScheduleClassroom()) {
      this.dialogRef.close(true);
    }
  }

  onUpdateClassroom() {

    const id = this.updateClassroomForm.get('id').value;

    var classroom = {
      name: this.updateClassroomForm.get('name').value,
      schedule: this.scheduleClassroom,
      capacity: this.updateClassroomForm.get('capacity').value,

    };
    this.classroomProv.updateClassroom(id, classroom).subscribe(res => {
      this.ngOnInit();
      Swal.fire({
        title: 'Actualización exitosa!',
        showConfirmButton: false,
        timer: 2500,
        type: 'success'
      });
    },
      error => { });
  }

}
