import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Api } from 'src/app/providers/app/api.prov';

@Injectable()
export class GroupProvider {

  constructor(private api: Api) { }

  createGroup(group) {
    return this.api.post('sg-cle/group/create', group)
      .pipe(map(created => created.json()));
  }

  public assignGroupEnglishTeacher(groupId: string, employeeId: string) {
    return this.api.post(`sg-cle/group/${groupId}/assign-teacher`, { teacher: employeeId })
      .pipe(map(res => res.json()));
  }

  getGroupById(id: string) {
    return this.api.get('sg-cle/group/byid/'+id)
      .pipe(map(group => group.json()));
  }

  getAllGroup() {
    return this.api.get('sg-cle/group/all')
      .pipe(map(group => group.json()));
  }

  getAllGroupOpened() {
    return this.api.get('sg-cle/group/all/opened')
      .pipe(map(group => group.json()));
  }

  getAllGroupOpenedByCourseAndLevel(data) {
    return this.api.get('sg-cle/group/all/opened/by-course-and-level', data)
      .pipe(map(group => group.json()));
  }

  getActivePeriod() {
    return this.api.get('period/active').pipe(map(res => res.json()));
  }

  getAllStudentsGroup(_groupId) {
    return this.api.get('sg-cle/group/students/' + _groupId).pipe(map(res => res.json()));
  }

  getAllGroupByTeacher(_teacherId, clientId: string) {
    return this.api.get(`sg-cle/group/teacher/${ _teacherId}/${clientId}`).pipe(map(res => res.json()));
  }
  saveAverages(data) {
    return this.api.put('sg-cle/group/students/average', data).pipe(map(res => res.json()));
  }
  saveSingleAverage(data) {
    return this.api.put('sg-cle/group/students/single/average', data).pipe(map(res => res.json()));
  }
}
