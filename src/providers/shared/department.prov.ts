import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Api } from 'src/providers/app/api.prov';
import { IDepartment } from 'src/entities/shared/department.model';

@Injectable()
export class DepartmentProvider {
  constructor(
    private api: Api,
  ) { }

  getAllDepartments() {
    return this.api.get('department/all')
      .pipe(map(departments => departments.json()));
  }

  createDepartment(department: IDepartment) {
    return this.api.post('department/create', department)
      .pipe(map(res => res.json()));
  }

  updateDepartment(department: IDepartment) {
    return this.api.put(`department/update/${department._id}`, department)
      .pipe(map(res => res.json()));
  }

  removeDepartment(departmentId: string) {
    return this.api.delete(`department/remove/${departmentId}`)
      .pipe(map(res => res.json()));
  }  

  getDepartmentBossSecretary(department : string) {
    return this.api.get(`department/DepartmentBossSecretary/${department}`)
      .pipe(map(res => res.json()));
  }
}
