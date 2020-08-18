export interface ICourse {
  _id?: string;
  name: string;
  dailyHours: number;
  semesterHours: number;
  totalSemesters: number;
  totalHours: number;
  startPeriod: any; // Cambiar a IPeriod
  endPeriod: any; // Cambiar a IPeriod
  status: string;
}
