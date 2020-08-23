export interface IClassroom {
  _id?: string;
  name: string;
  capacity: number;
  schedule: IClassroomSchedule[];
}

interface IClassroomSchedule {
  day: number; // Lunes: 1 - Sábado: 6
  startHour: number; // En minutos
  endDate: number; // En minutos
  status: string;
}
