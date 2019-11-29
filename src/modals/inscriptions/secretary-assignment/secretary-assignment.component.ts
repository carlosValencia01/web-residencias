import { Component, OnInit, Inject, ViewChild,ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import { CareerProvider } from 'src/providers/shared/career.prov';
import { UserProvider } from 'src/providers/app/user.prov';
@Component({
  selector: 'app-secretary-assignment',
  templateUrl: './secretary-assignment.component.html',
  styleUrls: ['./secretary-assignment.component.scss']
})
export class SecretaryAssignmentComponent implements OnInit {

  title = '    ASIGNACIÓN DE CARRERAS ';
  careers = [];
  secretaries = [];

  // Career selection chips
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  careerCtrl = new FormControl();
  filteredCareers: Observable<string[]>;
  @ViewChild('careerInput') careerInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  constructor(
    public dialogRef: MatDialogRef<SecretaryAssignmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private careerProv: CareerProvider,    
    private userProv: UserProvider,    
  ) {
            
    this.getSecretaries();    
    
   }

  ngOnInit() {
    this.userProv.refreshNeeded$.subscribe(
      ()=>{
        this.getSecretaries();
      }
    );
  }

  onClose(){
    this.dialogRef.close({action:'close'});
  }
  
  getCareers(){
    this.careerProv.getAllCareers().subscribe(
      res=>{
        if(res.careers){
          this.careers = res.careers;                             
          
          // for(let i=0; i< this.secretaries.length; i++){
          //   let notin = [];
          //   for(let j=0; j<this.secretaries[i].careers.length;j++){            
          //       notin = notin.length === 0 ? this.careers.filter( 
          //         car=> car._id !== this.secretaries[i].careers[j].careerId._id) :
          //         notin.filter(car=> car._id !== this.secretaries[i].careers[j].careerId._id);              
          //   }                        
          //   this.secretaries[i].noCareers = notin.length === 0 ? this.careers : notin;
          // }                    
          
          this.filteredCareers = this.careerCtrl.valueChanges.pipe(
            startWith(null),
            map((career: string | null) => career ? this._filter(career) : this.careers.slice()));                       
        }
      });
  }
  getSecretaries(){
    this.userProv.getSecretaries().subscribe(
      users=>{          
        this.secretaries = users.users;      
        this.getCareers();         
      }
    );
  }



  updateCareers(careerId,action,secreId){
    
    this.userProv.updateCareers(secreId,{careerId:careerId},action).subscribe(
      se=>{
      }
    );
    console.log(careerId,'setc',action);
    
  }

  add(event: MatChipInputEvent): void {
    // Add fruit only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    
    if (!this.matAutocomplete.isOpen) {
      console.log('add');
      const input = event.input;
      const value = event.value;
      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.careerCtrl.setValue(null);
    }
  }

  remove(career, secre): void {
    // const index = this.careers.indexOf(career);
    this.updateCareers(career._id,'delete', secre._id);
    // if (index >= 0) {
    //   this.careers.splice(index, 1);
    // }
  }

  selected(event: MatAutocompleteSelectedEvent,secre): void {
    // this.careers.push(event.option.viewValue);
    // this.careerInput.nativeElement.value = '';
    const career = event.option.value;    
    
    let exists = secre.careers.filter( caree => caree.careerId._id === career._id).length === 0;
    console.log(exists);
    
    if(exists) this.updateCareers(career._id,'insert', secre._id);
    
    this.careerCtrl.setValue(null);
  }

  private _filter(value: any): string[] {
    const filterValue = value.fullName ? value.fullName : value.trim().toLocaleLowerCase();
    return this.careers.filter(career => career.fullName.toLowerCase().indexOf(filterValue) !== -1);
  }
}
