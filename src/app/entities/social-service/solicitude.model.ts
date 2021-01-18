
export interface SolicitudeModel {
  dependencyName?: string;
  dependencyPhone?: string;
  dependencyAddress?: string;
  dependencyHeadline?: string;
  dependencyHeadlinePosition?: string;
  dependencyDepartment?: string;
  dependencyDepartmentManager?: string;
  dependencyDepartmentManagerEmail?: string;
  dependencyProgramName?: string;
  dependencyProgramModality?: string;
  initialDate?: Date;
  dependencyActivities?: string;
  dependencyProgramType?: Category;
  dependencyProgramObjective?: string;
  dependencyProgramLocationInside?: string;
  dependencyProgramLocation?: string;
  
  studentCity?: string;
  studentGender?: string;
  studentPhone?: string;
  studentState?: string;
  studentStreet?: string;
  studentSuburb?: string;
  
}

interface Category {
  option: string;
  value: string;
}
