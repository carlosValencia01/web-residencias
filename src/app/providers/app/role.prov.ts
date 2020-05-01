import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Api } from 'src/app/providers/app/api.prov';
import { iRole } from 'src/app/entities/app/role.model';

@Injectable()
export class RoleProvider {
  constructor(
    private api: Api,
  ) { }

  public getAllRoles() {
    return this.api.get('role')
      .pipe(map(res => res.json()));
  }

  public createRole(data: iRole) {
    return this.api.post('role', data)
      .pipe(map(res => res.json()));
  }

  public updateRole(roleId: string, newRole: iRole) {
    return this.api.put(`role/${roleId}`, newRole)
      .pipe(map(res => res.json()));
  }

  public removeRole(roleId: string) {
    return this.api.delete(`role/${roleId}`)
      .pipe(map(res => res.json()));
  }

}
