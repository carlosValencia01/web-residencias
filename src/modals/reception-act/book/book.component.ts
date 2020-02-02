import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProgressPageComponent } from 'src/pages/reception-act/progress-page/progress-page.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent implements OnInit {

  title = '';
  form : FormGroup;  
    
  minDate: Date;  
  
  constructor(
    public dialogRef: MatDialogRef<ProgressPageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,    
    ) {
            this.title = this.data.operation === 'edit' ? 'Editar Evento' : this.title;    
     }

  ngOnInit() {
    
    this.form = new FormGroup({          
      'date': new FormControl(null,[Validators.required]),        
      'bookNumber': new FormControl(null,[Validators.required]),
      'foja': new FormControl(null,[Validators.required]),
      'career': new FormControl(null,[Validators.required]),
    });     
  }

  onClose(){
    this.dialogRef.close({action:'close'});
  }

  onFormSubmit(book ){      

    this.dialogRef.close({action:'create',book});    
  }



}
