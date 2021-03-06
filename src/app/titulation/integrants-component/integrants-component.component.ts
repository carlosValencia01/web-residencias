import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { sourceDataProvider } from 'src/app/providers/reception-act/sourceData.prov';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatTableDataSource, MatDialogRef, MAT_DIALOG_DATA, MatSort, MatPaginator } from '@angular/material';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-integrants-component',
  templateUrl: './integrants-component.component.html',
  styleUrls: ['./integrants-component.component.scss']
})
export class IntegrantsComponentComponent implements OnInit {
  public displayedColumns: string[];
  public dataSource: MatTableDataSource<IIntegrantsTable>;
  public frmIntegrants: FormGroup;
  private integrants: [{ name: string, controlNumber: string, career: string }];
  public careers: string[];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public isEditing = false;

  constructor(
    public dialogRef: MatDialogRef<IntegrantsComponentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private source: sourceDataProvider) {
    this.integrants = this.data.integrants;
    this.careers = [];
    this.careers = this.source.getCareers();
  }

  ngOnInit() {
    this.displayedColumns = ['name', 'controlNumber', 'career', 'edit', 'delete'];
    this.frmIntegrants = new FormGroup(
      {
        'name': new FormControl(null, Validators.required),
        'controlNumber': new FormControl(null, [Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.minLength(8),
        ]),
        'career': new FormControl('Seleccione la Carrera', Validators.required)
      });
    this.refresh();
  }

  refresh(): void {
    this.dataSource = new MatTableDataSource(this.integrants);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onRemove(data): void {
    Swal.fire({
      title: '¿Quitar integrante?',
      text: `Está por eliminar al integrante ${data.name}`,
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Quitar'
    }).then((result) => {
      if (result.value) {
        const indice = this.integrants.findIndex(x => x.controlNumber === data.controlNumber);
        if (indice !== -1) {
          this.integrants.splice(indice, 1);
          this.refresh();
        }
      }
    });
  }

  onRowEditSave(data): void {
    const indice = this.integrants.findIndex(x => x.controlNumber === data.controlNumber);
    this.frmIntegrants.setValue(
      {
        'name': this.integrants[indice].name,
        'controlNumber': this.integrants[indice].controlNumber,
        'career': this.integrants[indice].career,
      });
    this.frmIntegrants.get('controlNumber').disable();
    this.isEditing = true;
  }

  onSave() {
    const indice = this.integrants.findIndex(x => x.controlNumber === this.frmIntegrants.get('controlNumber').value);
    if (indice === -1) {
      this.integrants.push({
        name: this.frmIntegrants.get('name').value,
        controlNumber: this.frmIntegrants.get('controlNumber').value,
        career: this.frmIntegrants.get('career').value,
      });
    } else {
      this.integrants[indice] = {
        name: this.frmIntegrants.get('name').value,
        controlNumber: this.frmIntegrants.get('controlNumber').value,
        career: this.frmIntegrants.get('career').value,
      };
    }
    this.frmIntegrants.get('controlNumber').enable();
    this.isEditing = false;
    this.frmIntegrants.reset({
      career: 'Seleccione la Carrera'
    });
    this.refresh();
  }

  onSaveAll() {
    this.dialogRef.close(this.integrants);
  }
  onClose() {
    this.dialogRef.close();
  }

}
interface IIntegrantsTable {
  name?: string; controlNumber?: string; career?: string; edit?: string; delete?: string;
}
