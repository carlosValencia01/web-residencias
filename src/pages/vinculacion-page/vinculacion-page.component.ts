import { Component, OnInit, ViewChild } from '@angular/core';
import * as Papa from 'papaparse';
import { IStudent } from 'src/entities/student.model';
import { StudentProvider } from 'src/providers/student.prov';
import { NotificationsServices } from 'src/services/notifications.service';
// import { EnglishComponent } from 'src/modals/english/english.component';
import { eNotificationType } from 'src/enumerators/notificationType.enum';
import { CookiesService } from 'src/services/cookie.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource, MatDialog, MatPaginator, MatSort } from '@angular/material';
import { EnglishComponent } from 'src/modals/english/english.component';

@Component({
  selector: 'app-vinculacion-page',
  templateUrl: './vinculacion-page.component.html',
  styleUrls: ['./vinculacion-page.component.css'],
  // providers: [DialogService]
})

export class VinculacionPageComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  students: IStudent[] = [];
  displayedColumns: string[];
  dataSource: MatTableDataSource<IEnglishTable>;
  search: string;

  constructor(
    public studentProvider: StudentProvider,
    private notificationServ: NotificationsServices,
    private cookiesService: CookiesService,
    public dialog: MatDialog,
    private router: Router, private routeActive: ActivatedRoute) {
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.displayedColumns = ['numeroControl', 'nombre', 'carrera', 'liberacion', 'action'];
    this.loadStudentsWithEnglish();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  loadStudentsWithEnglish(): void {
    this.students = [];
    this.studentProvider.StudentWithEnglish().subscribe(data => {
      data.students.forEach(element => {
        const student: IStudent = {
          _id: element._id,
          controlNumber: element.controlNumber,
          fullName: element.fullName,
          career: element.career,
          english: new Date(element.documents[0].releaseDate).toLocaleDateString()
        };
        this.students.push(student);
        this.refresh();
      });
    }, error => {
      this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un error al recuperar los datos, intente nuevamente', '');
    });
  }
  refresh(): void {
    this.dataSource = new MatTableDataSource(<IEnglishTable[]>this.students.slice());
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  onUpload(event) {
    // Se convierte el archivo csv a un arreglo de arrays
    const Students: IStudent[] = [];
    const estudiantes = this.students;
    const provider = this.studentProvider;
    const notificacion = this.notificationServ;
    Papa.parse(event.files[0], {
      complete: function (results) {
        if (results.data.length > 0) {
          results.data.forEach((element, index) => {
            if (index > 0) {
              const Student: IStudent = {
                controlNumber: element[0],
                fullName: element[1],
                career: element[2],
                document: { type: 'Ingles', 'status': 'Activo' }
              };
              Students.push(Student);
            }
          });
          provider.csvEnglish(Students).subscribe(res => {
            res.Data.forEach(e => {
              const lStudent: IStudent = {
                _id: e._id,
                controlNumber: e.controlNumber,
                fullName: e.fullName,
                career: e.career,
                english: new Date(e.document.releaseDate).toLocaleDateString()
              };
              const indice = estudiantes.findIndex(x => x._id === e._id);
              if (indice !== -1) {
                estudiantes[indice] = lStudent;
              } else {
                estudiantes.push(lStudent);
              }
            });
            notificacion.showNotification(eNotificationType.SUCCESS, 'La importación ha sido un éxito', '');
          }, error => {
            this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un error al recuperar los datos, ' +
              'intente nuevamente', '');
          });
        }
      }
    });

  }

  getStudent() {
    this.students = [];
    if (typeof(this.search) !== 'undefined' && this.search !== '') {
      this.studentProvider.searchStudentWithEnglish(this.search)
      .subscribe(data => {
        data.students.forEach(element => {
          const student: IStudent = {
            _id: element._id,
            controlNumber: element.controlNumber,
            fullName: element.fullName,
            career: element.career,
            english: new Date(element.documents[0].releaseDate).toLocaleDateString()
          };
          this.students.push(student);
          this.refresh();
        });
      }, error => {
        this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un error al recuperar los datos, intente nuevamente', '');
      });
    } else {
      this.loadStudentsWithEnglish();
    }

  }

  addNewStudent() {
    const ref = this.dialog.open(EnglishComponent, {
      width: '45em',
      disableClose: true,
      hasBackdrop: true,
    });

    ref.afterClosed().subscribe((student: IStudent) => {
      if (student) {
        student.document = { type: 'Ingles', 'status': 'Activo' };
        this.studentProvider.csvAddStudentEnglish(student).subscribe(data => {
          // tslint:disable-next-line:no-shadowed-variable
          const student: IStudent = {
            _id: data.student._id,
            controlNumber: data.student.controlNumber,
            fullName: data.student.fullName,
            career: data.student.career,
            english: new Date(data.student.documents[0].releaseDate).toLocaleDateString()
          };
          const i = this.students.findIndex(x => x._id === student._id);
          if (i !== -1) {
            this.students[i] = student;
          } else {
            this.students.push(student);
          }
          this.refresh();
          this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Estudiante agregado exitosamente', '');
        }, error => {
          this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un problema ' + error, '');
        });
      }
    });
  }

  onRowRemove(row: IStudent) {
    this.studentProvider.csvRemoveStudentEnglish(row._id).subscribe(
      res => {
        this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Estudiante eliminado', '');
        this.students.splice(this.students.indexOf(row), 1);
        this.refresh();
      }, error => {
        this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un problema: ' + error.message, '');
      }
    );
  }
}

interface IEnglishTable {
  _id?: string; controlNumber?: string; fullName?: string; career?: string; action?: string;
}
// @ViewChild('fileUpload') fileUpload: FileUpload;

// menuRoute: MenuItem[];
// home: MenuItem;
// students: IStudent[] = [];
// columns: any[];
// search: string;

// constructor(public studentProvider: StudentProvider, private notificationServ: NotificationsServices,
//   public dialogService: DialogService, private cookiesService: CookiesService, private router: Router,
//   private routeActive: ActivatedRoute) {
//   if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
//     this.router.navigate(['/']);
//   }
//   this.home = { icon: 'pi pi-home' };
// }

// ngOnInit() {
//   this.menuRoute = [
//     { label: 'Vinculación' },
//     { label: 'Ingles', icon: 'pi pi-external-link' }
//   ];

//   this.columns = [
//     { field: '_id', header: 'Id', display: 'none' },
//     { field: 'controlNumber', header: 'Número Control', display: 'table-cel' },
//     { field: 'fullName', header: 'Nombre', display: 'table-cel' },
//     { field: 'career', header: 'Carrera', display: 'table-cel' },
//     { field: 'english', header: 'Liberación', display: 'table-cel' }
//   ];
//   this.loadStudentsWithEnglish();
// }

// loadStudentsWithEnglish(): void {
//   this.students = [];
//   this.studentProvider.StudentWithEnglish().subscribe(data => {
//     data.students.forEach(element => {
//       let student: IStudent = {
//         _id: element._id,
//         controlNumber: element.controlNumber,
//         fullName: element.fullName,
//         career: element.career,
//         english: new Date(element.documents[0].releaseDate).toLocaleDateString()
//       };
//       this.students.push(student);
//     });
//   }, error => {
//     this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un error al recuperar los datos, intente nuevamente', '');
//   });
// }

// onUpload(event) {
//   //Se convierte el archivo csv a un arreglo de arrays
//   let Students: IStudent[] = [];
//   let estudiantes = this.students;
//   let provider = this.studentProvider;
//   let notificacion = this.notificationServ;
//   Papa.parse(event.files[0], {
//     complete: function (results) {
//       if (results.data.length > 0) {
//         results.data.forEach((element, index) => {
//           if (index > 0) {
//             let Student: IStudent = {
//               controlNumber: element[0],
//               fullName: element[1],
//               career: element[2],
//               document: { type: "Ingles", "status": "Activo" }
//             };
//             Students.push(Student);
//           }
//         });
//         provider.csvEnglish(Students).subscribe(res => {
//           res.Data.forEach(e => {
//             let lStudent: IStudent = {
//               _id: e._id,
//               controlNumber: e.controlNumber,
//               fullName: e.fullName,
//               career: e.career,
//               english: new Date(e.document.releaseDate).toLocaleDateString()
//             }
//             let indice = estudiantes.findIndex(x => x._id === e._id);
//             if (indice !== -1)
//               estudiantes[indice] = lStudent;
//             else
//               estudiantes.push(lStudent);
//           });
//           notificacion.showNotification(eNotificationType.SUCCESS, 'La importación ha sido un éxito', '');
//         }, error => {
//           this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un error al recuperar los datos, ' +
//              'intente nuevamente', '');
//         });
//       }
//     }
//   });
//   this.fileUpload.clear();
// }

// getStudents() {
//   this.students = [];
//   this.studentProvider.searchStudentWithEnglish(this.search)
//     .subscribe(data => {
//       data.students.forEach(element => {
//         let student: IStudent = {
//           _id: element._id,
//           controlNumber: element.controlNumber,
//           fullName: element.fullName,
//           career: element.career,
//           english: new Date(element.documents[0].releaseDate).toLocaleDateString()
//         };
//         this.students.push(student);
//       });
//     }, error => {
//       this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un error al recuperar los datos, intente nuevamente', '');
//     });
// }

// addNewStudent() {
//   const ref = this.dialogService.open(EnglishComponent, {
//     header: 'Nuevo Registro',
//     width: '50%',
//     contentStyle: { "max-height": "350px", "overflow": "auto" }
//   });

//   ref.onClose.subscribe((student: IStudent) => {
//     if (student) {
//       student.document = { type: "Ingles", "status": "Activo" };
//       this.studentProvider.csvAddStudentEnglish(student).subscribe(data => {
//         let student: IStudent = {
//           _id: data._id,
//           controlNumber: data.controlNumber,
//           fullName: data.fullName,
//           career: data.career,
//           english: new Date(data.documents[0].releaseDate).toLocaleDateString()
//         };
//         this.students.push(student);
//         this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Estudiante agregado exitosamente', '');
//       }, error => {
//         this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un problema ' + error, '');
//       });
//     }
//   });
// }

// onRowRemove(row: IStudent) {
//   this.studentProvider.csvRemoveStudentEnglish(row._id).subscribe(
//     res => {
//       this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Estudiante eliminado', '');
//       this.students.splice(this.students.indexOf(row), 1);
//     }, error => {
//       this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un problema: ' + error.message, '');
//     }
//   );
// }
