import {ActivatedRoute, Router} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import Swal from 'sweetalert2';

import {CareerProvider} from 'src/providers/shared/career.prov';
import {CookiesService} from 'src/services/app/cookie.service';
import {DepartmentProvider} from 'src/providers/shared/department.prov';
import {eNotificationType} from 'src/enumerators/app/notificationType.enum';
import {ICareer} from 'src/entities/shared/career.model';
import {IDepartment} from 'src/entities/shared/department.model';
import {NotificationsServices} from 'src/services/app/notifications.service';

@Component({
  selector: 'app-departments-admin-page',
  templateUrl: './departments-admin-page.component.html',
  styleUrls: ['./departments-admin-page.component.scss']
})
export class DepartmentsAdminPageComponent implements OnInit {
  public departmentForm: FormGroup;
  public departments: Array<IDepartment>;
  public careers: Array<ICareer>;
  public titleCardForm: string;
  public searchText: string;
  public showFormPanel = false;
  public isViewDetails = false;
  private isEditing = false;
  private currentDepartment: IDepartment;
  private departmentsCopy: Array<IDepartment>;
  private assignedCareers: Array<ICareer>;
  private unassignedCareers: Array<ICareer>;

  constructor(
    private activateRoute: ActivatedRoute,
    private careerProvider: CareerProvider,
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
    this._getAllCareers();
    this._cleanCareersAssignment();
  }

  public newDepartment() {
    this.titleCardForm = 'Creando departamento';
    this.currentDepartment = null;
    this._cleanCareersAssignment();
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
    this._careersAssignment(department);
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
    this._careersAssignment(department);
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
    this._cleanCareersAssignment();
  }

  public saveDepartment() {
    const department = this._getFormData();
    if (this.isEditing) {
      this.currentDepartment.name = department.name;
      this.currentDepartment.shortName = department.shortName;
      this.currentDepartment.careers = department.careers;
      this.departmentProv.updateDepartment(this.currentDepartment)
        .subscribe(_ => {
          this.notification.showNotification(eNotificationType.SUCCESS, 'Departamento modificado con éxito.', '');
          this._updateDepartment(this.currentDepartment);
          this._cleanCareersAssignment();
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

  public isCareerAssigned(career: ICareer): boolean {
    return this.assignedCareers.findIndex(_career => _career._id === career._id) !== -1;
  }

  public assignCareer(career: ICareer) {
    this.assignedCareers.push(career);
    const index = this.unassignedCareers.findIndex(_career => _career._id === career._id);
    this.unassignedCareers.splice(index, 1);
  }

  public deallocateCareer(career: ICareer) {
    this.unassignedCareers.push(career);
    const index = this.assignedCareers.findIndex(_career => _career._id === career._id);
    this.assignedCareers.splice(index, 1);
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
      shortName: this.departmentForm.get('shortName').value,
      careers: this.assignedCareers
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
        this._cleanCareersAssignment();
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

  private _careersAssignment(department: IDepartment) {
    this.assignedCareers = department.careers;
    this.unassignedCareers = this.careers.filter(career => !this.isCareerAssigned(career));
  }
}
