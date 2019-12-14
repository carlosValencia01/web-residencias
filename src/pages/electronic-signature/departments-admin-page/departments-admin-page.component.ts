import {ActivatedRoute, Router} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import Swal from 'sweetalert2';

import {CookiesService} from 'src/services/app/cookie.service';
import {DepartmentProvider} from 'src/providers/shared/department.prov';
import {IDepartment} from 'src/entities/shared/department.model';
import {NotificationsServices} from 'src/services/app/notifications.service';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';

@Component({
  selector: 'app-departments-admin-page',
  templateUrl: './departments-admin-page.component.html',
  styleUrls: ['./departments-admin-page.component.scss']
})
export class DepartmentsAdminPageComponent implements OnInit {
  public departmentForm: FormGroup;
  public departments: Array<IDepartment>;
  public titleCardForm: string;
  public searchText: string;
  public showFormPanel: boolean;
  public isViewDetails: boolean;
  private isEditing: boolean;
  private currentDepartment: IDepartment;
  private departmentsCopy: Array<IDepartment>;

  constructor(
    private activateRoute: ActivatedRoute,
    private cookiesService: CookiesService,
    private departmentProv: DepartmentProvider,
    private notification: NotificationsServices,
    private router: Router,
  ) {
    if (!this.cookiesService.isAllowed(this.activateRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this._initializeForm();
    this._getAllDepartments();
  }

  public newDepartment() {
    this.titleCardForm = 'Creando departamento';
    this.currentDepartment = null;
    this.departmentForm.enable();
    this.departmentForm.reset();
    this.showFormPanel = true;
    this.isViewDetails = false;
    this.isEditing = false;
  }

  public searchDepartment() {
    const search = (this.searchText || '').toLowerCase();
    this.departments = this.departmentsCopy
      .filter(department => JSON.stringify(department).toLowerCase().includes(search));
  }

  public viewDepartment(department: IDepartment) {
    this.titleCardForm = 'Detalles del departamento';
    this.currentDepartment = null;
    this._fillForm(department);
    this.departmentForm.markAsUntouched();
    this.departmentForm.disable();
    this.showFormPanel = true;
    this.isEditing = false;
    this.isViewDetails = true;
  }

  public editDepartment(department: IDepartment) {
    this.titleCardForm = 'Actualizando departamento';
    this.currentDepartment = department;
    this.departmentForm.enable();
    this._fillForm(department);
    this.showFormPanel = true;
    this.isViewDetails = false;
    this.isEditing = true;
  }

  public removeDepartment(department: IDepartment) {
    Swal.fire({
      title: 'Ésta acción no se podrá revertir',
      text: `El departamento ${department.name} se borrará totalmente. ¿Desea borrarlo?`,
      type: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'blue',
      confirmButtonText: 'Borrar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        this.departmentProv.removeDepartment(department._id)
          .subscribe(_ => {
            this.notification.showNotification(eNotificationType.SUCCESS, 'Departamento borrado con éxito', '');
            if (this.isEditing && this.currentDepartment._id === department._id) {
              this.isEditing = false;
              this.titleCardForm = 'Creando puesto';
            }
            this._removeDepartment(department);
          }, error => {
            const message = JSON.parse(error._body).message;
            this.notification.showNotification(eNotificationType.ERROR,
              'No se pudo borrar el departamento', error ? message : 'Inténtelo de nuevo');
          });
      }
    });
  }

  public closeFormPanel() {
    this.departmentForm.reset();
    this.showFormPanel = false;
    this.isEditing = false;
    this.isViewDetails = false;
    this.currentDepartment = null;
  }

  public saveDepartment() {
    const department = this._getFormData();
    if (this.isEditing) {
      this.currentDepartment.name = department.name;
      this.currentDepartment.shortName = department.shortName;
      // this.currentDepartment.careers = ;
      this.departmentProv.updateDepartment(this.currentDepartment)
        .subscribe(_ => {
          this.notification.showNotification(eNotificationType.SUCCESS, 'Departamento modificado con éxito.', '');
          this._updateDepartment(this.currentDepartment);
        }, _ => {
          this.notification.showNotification(eNotificationType.ERROR, 'No se pudo actualizar el departamento.', 'Inténtelo de nuevo.');
        });
    } else {
      const departmentExists = this.departmentsCopy.filter(depto => depto.name.toLowerCase().includes(department.name.toLowerCase()))[0];
      if (!departmentExists) {
        this._createDepartment(department);
      } else {
        Swal.fire({
          title: '¡Coincidencia encontrada!',
          text: `Se ha encontrado el departamento ${departmentExists.name},
               con nombre similar al que intenta crear. ¿Desea crear el nuevo departamento?`,
          type: 'warning',
          allowOutsideClick: false,
          showCancelButton: true,
          confirmButtonColor: 'green',
          cancelButtonColor: 'blue',
          confirmButtonText: 'Crear',
          cancelButtonText: 'Cancelar',
          focusCancel: true
        }).then((result) => {
          if (result.value) {
            this._createDepartment(department);
          }
        });
      }
    }
  }

  private _initializeForm() {
    this.departmentForm = new FormGroup({
      'name': new FormControl(null, Validators.required),
      'shortName': new FormControl(null, Validators.required)
    });
  }

  private _getFormData() {
    return {
      name: this.departmentForm.get('name').value,
      shortName: this.departmentForm.get('shortName').value
    };
  }

  private _fillForm(department: IDepartment) {
    this.departmentForm.setValue({
      'name': department.name,
      'shortName': department.shortName
    });
  }

  private _getAllDepartments() {
    this.departmentProv.getAllDepartments()
      .subscribe(res => {
        this.departments = res.departments || [];
        this.departmentsCopy = this.departments;
        if (this.searchText) {
          this.searchDepartment();
        }
        if (this.isEditing || this.isViewDetails) {
          this.closeFormPanel();
        }
      });
  }

  private _createDepartment(department: IDepartment) {
    this.departmentProv.createDepartment(department)
      .subscribe(depto => {
        this.departmentForm.reset();
        this.notification.showNotification(eNotificationType.SUCCESS, 'Departamento creado con éxito.', '');
        this._addDepartment(depto);
      }, _ => {
        this.notification.showNotification(eNotificationType.ERROR, 'No se pudo crear el departamento.', 'Inténtelo de nuevo.');
      });
  }

  private _addDepartment(department: IDepartment) {
    this.departmentsCopy.push(department);
    this.searchDepartment();
  }

  private _removeDepartment(department: IDepartment) {
    const index = this.departmentsCopy.findIndex(depto => depto._id === department._id);
    this.departmentsCopy.splice(index, 1);
    this.searchDepartment();
    if (this.isViewDetails) {
      this.closeFormPanel();
    }
  }

  private _updateDepartment(department: IDepartment) {
    const index = this.departmentsCopy.findIndex(depto => depto._id === department._id);
    this.departmentsCopy.splice(index, 1, department);
    this.searchDepartment();
    if (this.isEditing || this.isViewDetails) {
      this.closeFormPanel();
    }
  }
}
