import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { ICareer } from 'src/entities/shared/career.model';
import { CareerProvider } from 'src/providers/shared/career.prov';
import { BookProvider } from 'src/providers/reception-act/book.prov';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-book',
  templateUrl: './update-book.component.html',
  styleUrls: ['./update-book.component.scss']
})
export class UpdateBookComponent implements OnInit {
  title = 'Modificar Libro';
  oldBook;
  bookForm: FormGroup;
  loading: boolean;
  opcionTitulacion = '';
  cAsigned = false;
  nombreLibro = '';
  enabledName = true;
  activeBooks;
  assignCareers;
  numberBooks;
  titulationBook;
  existCareer = false;
  carreraRepetida = '';
  indexNumberBook = '';
  titulationOption = '';

  public careers: Array<ICareer>;
  public searchText: string;
  public assignedCareers: Array<ICareer>;
  private unassignedCareers: Array<ICareer>;

  constructor(
    public dialogRef: MatDialogRef<UpdateBookComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private notificationsServices: NotificationsServices,
    private careerProvider: CareerProvider,
    private bookProvider: BookProvider,
  ) {
    this.oldBook = data.oldBook;
    this.getBook();
  }

  ngOnInit() {

  }

  async getBook(){
    this.assignedCareers = this.oldBook.careers;
    this.nombreLibro = this.oldBook.name;
    this.opcionTitulacion = this.oldBook.titleOption ? this.oldBook.titleOption : "XI - TITULACIÓN INTEGRAL";
    this._getAllCareers();
    this._cleanCareersAssignment();
    this.getActiveBooks();
    this.validateForm();
  }

  validateForm() {
    this.bookForm = new FormGroup({
      name: new FormControl(this.oldBook.name, [Validators.required]),
      number: new FormControl(this.oldBook.number, [Validators.required]),
      registerDate: new FormControl(new Date(), [Validators.required]),
      titleOption: new FormControl(this.oldBook.titleOption, [Validators.required])
    });
  }

  onClose() {
    this.dialogRef.close({ action: 'close' });
  }

  async onFormSubmit(form: NgForm) {
    this.loading = true;
    await this.updateBook(form);
  }

  async updateBook(data) {
    data.careers = this.assignedCareers;
    data.status = this.oldBook.status;
    this.assignCareers.forEach((carreraA, index) => {
      if (!this.existCareer) {
        data.careers.forEach((carrera) => {
          if (!this.existCareer) {
            if (carreraA.includes(carrera.fullName)) {
              if (this.titulationBook[index] === data.titleOption) {
                if (this.numberBooks[index] === data.number) {
                  this.carreraRepetida = carrera.shortName;
                  this.indexNumberBook = data.number;
                  this.titulationOption = data.titleOption;
                  this.existCareer = true;
                } else {
                  return;
                }
              } else {
                return;
              }
            }
          } else {
            return;
          }
        });
      }
    });
    if (this.existCareer) {
      this.existCareer = false;
      Swal.fire({
        title: 'Ya existe un libro con la siguiente información',
        type: 'info',
        html:
          '<p>Carrera: <b>' + this.carreraRepetida + '</b><p/>' +
          '<p>Típo de Titulación: <b>' + this.titulationOption + '</b><p/>' +
          '<p>Número de Libro: <b>' + this.indexNumberBook + '</b><p/>',
        allowOutsideClick: false,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      });

    } else {
        // Modificar elemento
        this.existCareer = false;
        this.bookProvider.updateInfoBook(this.oldBook._id,{data}).subscribe(res => {});
        this.onClose();
        this.notificationsServices.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Libro actualizado con éxito');
    }
    this.loading = false;
  }

  public isCareerAssigned(career: ICareer): boolean {
    return this.assignedCareers.findIndex(_career => _career._id === career._id) !== -1;
  }

  public deallocateCareer(career: ICareer) {
    this.unassignedCareers.push(career);
    const index = this.assignedCareers.findIndex(_career => _career._id === career._id);
    this.assignedCareers.splice(index, 1);

    this.nombreLibro = '';
    for (let i = 0; i < this.assignedCareers.length; i++) {
      if (this.assignedCareers.length === 1) {
        this.nombreLibro = this.assignedCareers[i].fullName;
      } else if (i === this.assignedCareers.length - 1) {
        if (this.assignedCareers[i].shortName.indexOf('ING.')) {
          this.nombreLibro += ' Y ' + this.assignedCareers[i].fullName;
        } else {
          this.nombreLibro += ' E ' + this.assignedCareers[i].fullName;
        }
      } else if (i === this.assignedCareers.length - 2) {
        this.nombreLibro += this.assignedCareers[i].fullName;
      } else {
        this.nombreLibro += this.assignedCareers[i].fullName + ', ';
      }
    }
  }

  public assignCareer(career: ICareer) {
    this.assignedCareers.push(career);
    const index = this.unassignedCareers.findIndex(_career => _career._id === career._id);
    this.unassignedCareers.splice(index, 1);

    this.nombreLibro = '';
    
    for (let i = 0; i < this.assignedCareers.length; i++) {
      if (this.assignedCareers.length === 1) {
        this.nombreLibro = this.assignedCareers[i].fullName;
      } else if (i === this.assignedCareers.length - 1) {
        if (this.assignedCareers[i].shortName.indexOf('ING.')) {
          this.nombreLibro += ' Y ' + this.assignedCareers[i].fullName;
        } else {
          this.nombreLibro += ' E ' + this.assignedCareers[i].fullName;
        }
      } else if (i === this.assignedCareers.length - 2) {
        this.nombreLibro += this.assignedCareers[i].fullName;
      } else {
        this.nombreLibro += this.assignedCareers[i].fullName + ', ';
      }
    }
  }

  private _getAllCareers() {
    this.careerProvider.getAllCareers()
      .subscribe(res => {
        this.careers = res.careers;
        this._careersAssignment(this.oldBook);
      });
  }

  private _cleanCareersAssignment() {
    this.assignedCareers = [];
    this.unassignedCareers = [];
  }

  private _careersAssignment(book) {
    this.assignedCareers = book.careers;
    this.unassignedCareers = this.careers.filter(career => !this.isCareerAssigned(career));
  }

  editName() {
    this.enabledName = !this.enabledName;
  }

  getActiveBooks() {
    this.bookProvider.getAllBooks().subscribe(res => {
      this.assignCareers = res.map(({careers}) => careers.map(({fullName}) => fullName));
      this.numberBooks = res.map(({number}) => number);
      this.titulationBook = res.map(({titleOption}) => titleOption);

    });
  }

}
