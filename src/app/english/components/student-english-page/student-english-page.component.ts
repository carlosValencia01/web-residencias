import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import Swal from 'sweetalert2';

//Importar Servicios
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';

//Importar Proveedores
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { EnglishStudentProvider } from 'src/app/english/providers/english-student.prov';
import { RequestCourseProvider } from 'src/app/english/providers/request-course.prov';
import { EnglishCourseProvider } from 'src/app/english/providers/english-course.prov';

//Importar Componentes
import { FormRequestCourseComponent } from 'src/app/english/components/student-english-page/form-request-course/form-request-course.component';

//Importar Enumeradores
import { EStatusEnglishStudent, EStatusEnglishStudentDB } from 'src/app/english/enumerators/status-english-student.enum';
import { ICourse } from '../../entities/course.model';
import { SelectCourseLevelComponent } from '../select-course-level/select-course-level.component';
import { eNotificationType } from '../../../enumerators/app/notificationType.enum';

// Importar modelos
import { IEnglishStudent } from '../../entities/english-student.model';
import { IStudent } from '../../../entities/shared/student.model';
import { IPeriod } from '../../../entities/shared/period.model';
import { IRequestCourse } from '../../entities/request-course.model';

@Component({
  selector: 'app-student-english-page',
  templateUrl: './student-english-page.component.html',
  styleUrls: ['./student-english-page.component.scss']
})
export class StudentEnglishPageComponent implements OnInit {

  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;
  data; //Datos del usuario
  currentStudent: IStudent; //Datos del estuduante
  englishStudent: IEnglishStudent; //Perfil de ingles del estudiante
  requestStudent: IRequestCourse []; 
  lastRequestStudent: IRequestCourse; 
  showImg = false; //Mostrar Foto
  imageDoc; //Imagen del Drive
  photoStudent = ''; //Foto a mostrar
  activePeriod: IPeriod;
  statusEnglishStudent = EStatusEnglishStudent; //Enumerador del estatus del perfil de ingles del estudiante

  englishCourses: ICourse[]; //Cursos de ingles activos

  constructor(
    private _CookiesService: CookiesService,
    private _ActivatedRoute: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private studentProv: StudentProvider,
    private inscriptionProv: InscriptionsProvider,
    private englishStudentProv: EnglishStudentProvider,
    private englishCourseProv: EnglishCourseProvider,
    private requestCourseProv: RequestCourseProvider,
    public dialog: MatDialog,
    private notification: NotificationsServices,
  ) {
    if (!this._CookiesService.isAllowed(this._ActivatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.data = _CookiesService.getData().user; //Obtener los datos del usuario

    this.getDocuments(); //Obtener la Foto de perfil
  }

  ngOnInit() {
    const _id = this.data._id; // ID del Estudiante

    //Obtener el estudiante con la ID
    this.studentProv.getStudentById(_id)
      .subscribe(async (res) => {
        this.currentStudent = JSON.parse(JSON.stringify(res.student[0])); // Guardar al estudiante

        this.englishStudent = await this._getEnglishStudent(this.currentStudent._id as string);
        this.englishCourses = await this._getAllActiveEnglishCourses();

        if (!this.englishCourses || !this.englishCourses.length) {
          return this.notification.showNotification(eNotificationType.INFORMATION, 'Cursos de inglés', 'No hay cursos activos para selección');
        }

        if (!this.englishStudent) {
          await this._getPreviousInfoEnglishCourses();
        }

        this.requestStudent = await this._getRequests(this.englishStudent._id) as IRequestCourse[];
        this.lastRequestStudent = this.requestStudent[this.requestStudent.length-1];

        if (this.englishStudent && this.englishStudent.courseType) {
          this.englishCourses = this.englishCourses.filter(course => course._id === this.englishStudent.courseType._id);
        }

      }, (_) => {
        this.notification.showNotification(eNotificationType.ERROR, 'Cursos inglés', 'Ocurrió un error al obtener el estudiante');
      });

  }

  public getStudentStatusMessage(): string {
    if(this.lastRequestStudent){
      return this.statusEnglishStudent[this.lastRequestStudent.status];
    }
  }

  public verifyNotification(): void { //Verificar si existe notificación a mostrar

    if (this.englishStudent.status == 'rejected') { //En caso de que se haya rechazado la solicitud
      Swal.fire({
        title: 'Atención',
        text: 'El curso en el horario solicitado no fue aperturado, seleccione otra opción',
        type: 'warning',
      }).then((result) => {

        const englishStudent = {
          $set: { status: 'no_choice' } //Cambiar el estatus
        };

        this.loadingService.setLoading(true);

        // Canbiar el estatus en la BD.
        this.englishStudentProv.updateEnglishStudent(englishStudent, this.englishStudent._id).subscribe(res => {
          this.englishStudent.status = 'no_choice'; // Cambiar el estatus en la variable local
        }, error => { }, () => this.loadingService.setLoading(false));
      });
    }
  }

  private getDocuments(): void { //Obtener la Foto de perfil
    this.showImg = false;
    this.studentProv.getDriveDocuments(this.data._id).subscribe( //Obtener documentos del Drive
      docs => {
        let documents = docs.documents;
        if (documents) { //Si existen documentos en el Drive

          //Obtener Foto del Drive
          this.imageDoc = documents.filter(docc => docc.filename.indexOf('png') !== -1 || docc.filename.indexOf('jpg') !== -1 || docc.filename.indexOf('PNG') !== -1 || docc.filename.indexOf('JPG') !== -1 || docc.filename.indexOf('jpeg') !== -1 || docc.filename.indexOf('JPEG') !== -1)[0];
          if (this.imageDoc) {

            this.inscriptionProv.getFile(this.imageDoc.fileIdInDrive, this.imageDoc.filename).subscribe(
              succss => { //Si existe Foto en el Drive
                this.showImg = true;
                const extension = this.imageDoc.filename.substr(this.imageDoc.filename.length - 3, this.imageDoc.filename.length);
                this.photoStudent = "data:image/" + extension + ";base64," + succss.file;
              },
              err => { this.photoStudent = 'assets/imgs/studentAvatar.png'; this.showImg = true; }
            );
          } else { //Si no existe Foto en el Drive
            this.loadingService.setLoading(false);
            this.photoStudent = 'assets/imgs/studentAvatar.png';
            this.showImg = true;
          }
        } else { //Si no existen documentos en el Drive
          this.loadingService.setLoading(false);
          this.photoStudent = 'assets/imgs/studentAvatar.png';
          this.showImg = true;
        }
      }
    );
  }

  public openDialog(courseSelected: any): void {
    const dialogRef = this.dialog.open(FormRequestCourseComponent, {
      data: {
        courseSelected: courseSelected,
        level: this.englishStudent.level,
        groupId: "",
        currentPhone: this.englishStudent.currentPhone
      },
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        this.activePeriod = await new Promise((resolve) => {
          this.englishCourseProv.getActivePeriod().subscribe(data => resolve(data.period));
        }) as IPeriod;
        const data = {
          englishStudent: this.englishStudent._id,
          group: result.groupId,
          requestDate: new Date(),
          level: this.englishStudent.level + 1,
          period: this.activePeriod._id
        };

        this.requestCourseProv.createRequestCourse(data).subscribe(res => {
          if (res) {
            this.englishStudent.currentPhone = result.currentPhone;
            this.englishStudent.status = 'waiting';
            this.englishStudentProv.updateEnglishStudent(this.englishStudent, this.englishStudent._id).subscribe(res2 => {
              Swal.fire({
                title: 'Solicitud enviada!',
                showConfirmButton: false,
                timer: 1500,
                type: 'success'
              });
              this.tabGroup.selectedIndex = 0;
              this.ngOnInit();
            });
          }
        });
      }
    });
  }

  public openDialogRejectRequest(englishStudentId) {
    Swal.fire({
      title: 'Cancelar Solicitud',
      text: `Está por cancelar la solicitud enviada. ¿Desea continuar?`,
      type: 'warning',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'green',
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {

        const data = {
          status: 'cancelled',
          active: false
        };

        this.loadingService.setLoading(true);
        this.requestCourseProv.updateRequestById(this.lastRequestStudent._id, data).subscribe(res => {

          const englishStudent = {
            $set: { status: 'no_choice' }
          }
          this.englishStudentProv.updateEnglishStudent(englishStudent, englishStudentId).subscribe(res2 => {

            this.loadingService.setLoading(false);
            Swal.fire(
              'Solicitud Cancelada',
              'La solicitud al curso ha sido cancelada.',
              'success'
            );
            this.ngOnInit();
          }, () => {
            this.loadingService.setLoading(false);
          });

        }, () => {
          this.loadingService.setLoading(false);
        });

      }
    });

  }

  public selectNewCourse() {
    this.tabGroup.selectedIndex = 1;
  }

  private async _getPreviousInfoEnglishCourses(): Promise<void> {
    await Swal
      .fire({
        title: 'Cursos de inglés',
        text: '¿Tienes cursado algún módulo de inglés?',
        type: 'question',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonText: 'Si, tengo módulos cursados',
        cancelButtonText: 'No tengo módulos cursados',
        confirmButtonColor: 'green',
        cancelButtonColor: 'red',
      })
      .then(async ({ value, dismiss }) => {
        let previousCourseData: IProfileInfo = {
          course: undefined,
          level: 0,
          lastLevelInfo: undefined,
        };

        if (!value && dismiss.toString() === 'close') {
          return this.router.navigate(['/']);
        }

        if (value) {
          const dialogRef = this.dialog.open(SelectCourseLevelComponent,
            { disableClose: true, hasBackdrop: true, maxWidth: '95vw', data: { courses: this.englishCourses } });

          dialogRef
            .afterClosed()
            .subscribe(async (data: { course: ICourse, level: number }) => {
              if (data) {
                this.englishStudent = await this._saveEnglishStudent(data);
                if (this.englishStudent && this.englishStudent.courseType) {
                  this.englishCourses = this.englishCourses.filter(({ _id }) => _id === this.englishStudent.courseType._id);
                }
              } else {
                this._getPreviousInfoEnglishCourses();
              }
            });
        } else {
          this.englishStudent = await this._saveEnglishStudent(previousCourseData);
        }
      });
  }

  private async _saveEnglishStudent(data: IProfileInfo): Promise<IEnglishStudent> {
    // Crear el perfil en caso de no existir.
    const englishStudent: IEnglishStudent = {
      studentId: this.currentStudent._id as string,
      courseType: data.course,
      currentPhone: this.currentStudent.phone as string,
      status: data.course &&
        data.level === data.course.totalSemesters
        ? EStatusEnglishStudentDB.NOT_RELEASED : undefined,
      totalHoursCoursed: data.course
        ? data.level * data.course.semesterHours
        : data.level,
      level: data.level,
      lastLevelInfo: data.lastLevelInfo,
    };

    const newEnglishStudent = await this._createEnglishStudent(englishStudent);
    newEnglishStudent.courseType = data.course;
    newEnglishStudent.studentId = this.currentStudent;

    return newEnglishStudent;
  }

  private _getEnglishStudent(studentId: string): Promise<IEnglishStudent> {
    return new Promise((resolve) => {
      this.englishStudentProv.getEnglishStudentByStudentId(studentId)
        .subscribe(
          (res: { englishStudent: IEnglishStudent }) => resolve(res.englishStudent),
          (_) => resolve(null)
        );
    });
  }
  private _getRequests(studentId: string): Promise<IRequestCourse[]> {
    return new Promise((resolve) => {
      this.requestCourseProv.getRequestCourse(studentId)
        .subscribe(
          (res: { requestCourses: IRequestCourse[] }) => resolve(res.requestCourses),
          (_) => resolve(null)
        );
    });
  }

  private _createEnglishStudent(englishStudent: IEnglishStudent): Promise<IEnglishStudent> {
    return new Promise((resolve) => {
      this.englishStudentProv.createEnglishStudent(englishStudent)
        .subscribe(
          (student: IEnglishStudent) => resolve(student),
          (_) => resolve(null)
        );
    });
  }

  private _getAllActiveEnglishCourses(): Promise<ICourse[]> {
    return new Promise((resolve) => {
      this.englishCourseProv
        .getAllEnglishCourseActive()
        .subscribe(
          (res: { englishCourses: ICourse[] }) => resolve(res.englishCourses),
          (_) => resolve([])
        );
    });
  }

}

interface IProfileInfo {
  course: ICourse;
  level: number;
  lastLevelInfo?: {
    startHour: number;
    endHour: number;
    teacher: string;
    period: string;
  }
}
