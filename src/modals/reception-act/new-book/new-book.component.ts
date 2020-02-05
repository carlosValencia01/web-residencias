import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { ICareer } from 'src/entities/shared/career.model';
import { CareerProvider } from 'src/providers/shared/career.prov';
import { BookProvider } from 'src/providers/reception-act/book.prov';

const years = require('ye-ars');

@Component({
  selector: 'app-new-book',
  templateUrl: './new-book.component.html',
  styleUrls: ['./new-book.component.scss']
})
export class NewBookComponent implements OnInit {
  title = 'Nuevo Libro';
  bookForm: FormGroup;
  loading: boolean;
  opcionTitulacion = 'TITULACIÓN INTEGRAL';
  cAsigned = false;
  nombreLibro = '';
  enabledName = true;
  public careers: Array<ICareer>;
  public searchText: string;
  private assignedCareers: Array<ICareer>;
  private unassignedCareers: Array<ICareer>;


  constructor(
    public dialogRef: MatDialogRef<NewBookComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private notificationsServices: NotificationsServices,
    private careerProvider: CareerProvider,
    private bookProvider: BookProvider
  ) {
    this.validateForm();
  }

  ngOnInit() {
    this._getAllCareers();
    this._cleanCareersAssignment();
  }

  validateForm() {
    this.bookForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      number: new FormControl('', [Validators.required]),
      registerDate: new FormControl(new Date(), [Validators.required]),
      titleOption: new FormControl('', [Validators.required])
    });
  }

  onClose() {
    this.dialogRef.close({ action: 'close' });
  }

  async onFormSubmit(form: NgForm) {
    this.loading = true;
    await this.createBook(form);
  }

  async createBook(data) {
    data.careers = this.assignedCareers;
    this.bookProvider.newBook(data).subscribe(res => {});
    this.loading = false;
    this.onClose();
    this.notificationsServices.showNotification(eNotificationType.SUCCESS, 'Éxito', 'Libro Creado.');
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
      if (this.assignedCareers.length == 1) {
        this.nombreLibro = this.assignedCareers[i].fullName;
      } else if (i == this.assignedCareers.length - 1) {
        if(this.assignedCareers[i].shortName.indexOf('ING.')){
          this.nombreLibro += ' Y ' + this.assignedCareers[i].fullName;
        } else {
          this.nombreLibro += ' E ' + this.assignedCareers[i].fullName;
        }
      } else if (i == this.assignedCareers.length - 2) {
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
      if (this.assignedCareers.length == 1) {
        this.nombreLibro = this.assignedCareers[i].fullName;
      } else if (i == this.assignedCareers.length - 1) {
        if(this.assignedCareers[i].shortName.indexOf('ING.')){
          this.nombreLibro += ' Y ' + this.assignedCareers[i].fullName;
        } else {
          this.nombreLibro += ' E ' + this.assignedCareers[i].fullName;
        }
      } else if (i == this.assignedCareers.length - 2) {
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
      });
  }

  private _cleanCareersAssignment() {
    this.assignedCareers = [];
    this.unassignedCareers = [];
  }

  editName(){
    this.enabledName = !this.enabledName;
  }

}
