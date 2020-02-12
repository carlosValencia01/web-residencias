import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Observable} from 'rxjs';
import Swal from 'sweetalert2';

import {DepartmentProvider} from 'src/providers/shared/department.prov';
import {eOperation} from 'src/enumerators/reception-act/operation.enum';
import {IDepartment} from 'src/entities/shared/department.model';
import {IPosition} from 'src/entities/shared/position.model';
import {PositionProvider} from 'src/providers/shared/position.prov';

@Component({
  selector: 'app-new-position',
  templateUrl: './new-position.component.html',
  styleUrls: ['./new-position.component.scss']
})
export class NewPositionComponent implements OnInit {
  public positionForm: FormGroup;
  public filteredDepartments: Observable<Array<IDepartment>>;
  public filteredPositions: Observable<Array<IPosition>>;
  public title: string;
  private departments: Array<IDepartment>;
  private positions: Array<IPosition>;
  private operationMode: eOperation;
  private position: IPosition;
  private employeeId: string;
  private currentPositions: {actives, inactives};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private departmentProv: DepartmentProvider,
    private positionProv: PositionProvider,
    private dialogRef: MatDialogRef<NewPositionComponent>,
  ) {
    this.operationMode = this.data.operationMode;
    this.employeeId = this.data.employeeId;
    this.currentPositions = this.data.currentPositions;
    this.title = 'Nuevo puesto';
    if (this.operationMode === eOperation.EDIT) {
      this.position = <IPosition>this.data.position;
    }
  }

  ngOnInit() {
    this._initializeForm();
    this._getAllDepartments();

    this.filteredDepartments = this.positionForm.get('department').valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterAutocomplete(this.departments, value))
      );
    this.filteredPositions = this.positionForm.get('position').valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterAutocomplete(this.positions, value))
      );
  }

  private _initializeForm(): void {
    this.positionForm = new FormGroup({
      'department': new FormControl(
        (this.operationMode === eOperation.EDIT ? this.position.ascription.name : ''), Validators.required),
      'position': new FormControl(
        (this.operationMode === eOperation.EDIT ? this.position.name : ''), Validators.required)
    });
  }

  private _getAllDepartments(): void {
    this.departmentProv.getAllDepartments()
      .subscribe(res => {
        this.departments = res.departments;
      });
  }

  public getPositions(): void {
    const departmentId = this._findDepartmentId(this.positionForm.get('department').value);
    if (departmentId) {
      this.positionProv.getAvailablePositionsByDepartment(this.employeeId, departmentId)
        .subscribe(positions => {
          const activePositions = this.currentPositions.actives.map(({position}) => position.name.toUpperCase());
          this.positions = positions.filter(({name}) => !activePositions.includes(name.toUpperCase()));
          this.positionForm.get('position').reset();
        });
    }
  }

  private _filterAutocomplete(array: Array<any>, value: string): Array<any> {
    const filterValue = (value || '').toLowerCase();
    return (array && filterValue) ? array.filter(data => data.name.toLowerCase().includes(filterValue)) : null;
  }

  private _findDepartmentId(departmentName): string {
    return departmentName
      ? this.departments.filter(department => department.name.toLowerCase() === departmentName.toLowerCase())[0]._id
      : null;
  }

  private _findPosition(positionName): IPosition {
    return positionName
      ? this.positions.filter(position => position.name.toLowerCase() === positionName.toLowerCase())[0]
      : null;
  }

  onSubmit(): void {
    const positionName = this.positionForm.get('position').value;
    this.position = this._findPosition(positionName);
    if (this.position) {
      this.dialogRef.close(this.position);
    } else {
      Swal.fire(
        'Puesto no disponible',
        `El puesto ingresado no puede ser asignado al empleado.
        Para más información revise los motivos de no disponibilidad de un puesto.`,
        'info'
      );
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
