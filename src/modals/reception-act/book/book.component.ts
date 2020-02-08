import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProgressPageComponent } from 'src/pages/reception-act/progress-page/progress-page.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { StudentProvider } from 'src/providers/shared/student.prov';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent implements OnInit {

  title = '';
  form : FormGroup;  
  minDate: Date;  
  career;
  date;
  bookNumber;
  
  constructor(
    public dialogRef: MatDialogRef<ProgressPageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,    
    private studentProv: StudentProvider,
    ) {
        console.log(data);
        this.title = this.data.operation === 'edit' ? 'Editar Evento' : this.title; 
        this.getStudentData(data.data);   
     }

  ngOnInit() {
    
  }

  onClose(){
    this.dialogRef.close({action:'close'});
  }

  onFormSubmit(book){      
    console.log(book);
    //this.dialogRef.close({action:'create',book});    
  }

  getStudentData(id) {
    this.studentProv.getStudentById(id).subscribe(res => {
      console.log(res.student[0].career);
      this.career = res.student[0].career;
      this.bookNumber = 1;
      this.date = new Date();
      //Obtener Libro Activo y de la carrera correspondiente
      this.validateForm();
    });
  }

  validateForm(){
    this.form = new FormGroup({          
      'date': new FormControl(this.date,[Validators.required]),        
      'bookNumber': new FormControl(this.bookNumber,[Validators.required]),
      'foja': new FormControl(null,[Validators.required]),
      'career': new FormControl(this.career,[Validators.required]),
    }); 
  }



}
