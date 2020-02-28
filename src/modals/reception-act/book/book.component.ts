import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProgressPageComponent } from 'src/pages/reception-act/progress-page/progress-page.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { BookProvider } from 'src/providers/reception-act/book.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent implements OnInit {

  title = '';
  form: FormGroup;
  minDate: Date;
  career;
  date;
  bookNumber;
  existBook = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ProgressPageComponent>,
    private studentProv: StudentProvider,
    private boockProv: BookProvider,
    private notificationsServices: NotificationsServices,
  ) {
    this.title = this.data.operation === 'edit' ? 'Editar Evento' : this.title;
    this.getStudentData(data.data);
  }

  ngOnInit() {

  }

  onClose() {
    this.dialogRef.close({action: 'close'});
  }

  onFormSubmit(book) {
    this.dialogRef.close({action: 'create', book});
  }

  getStudentData(id) {
    this.studentProv.getStudentById(id).subscribe(data => {
      const career = data.student[0].career;
      this.boockProv.getAllActiveBooks().subscribe(res => {
        const numberBooks = res.map(({number}) => number);
        const dateBooks = res.map(({registerDate}) => registerDate);
        const assignCareers = res.map(({careers}) => careers.map(({fullName}) => fullName));
        const nameBooks = res.map(({name}) => name);
        assignCareers.forEach((carrera, index) => {
          if (!this.existBook) {
            if (carrera.includes(career)) {
              this.career = nameBooks[index];
              this.existBook = true;
              this.bookNumber = numberBooks[index];
              this.date = new Date(dateBooks[index]);
              this.validateForm();
              return;
            }
          }
          if (index === assignCareers.length - 1) {
            this.notificationsServices
              .showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'No existe libro para la carrera del alumno.');
            this.onClose();
          }
        });

      });
    });
  }

  validateForm() {
    this.form = new FormGroup({
      'date': new FormControl(this.date, [Validators.required]),
      'bookNumber': new FormControl(this.bookNumber, [Validators.required]),
      'foja': new FormControl(null, [Validators.required]),
      'career': new FormControl(this.career, [Validators.required]),
    });
  }
}
