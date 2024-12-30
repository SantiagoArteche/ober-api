enum taskStatus {
  "pending",
  "in progress",
  "completed",
}

export interface Task {
  _id?: string;
  name: string;
  description?: string;
  assignedTo: string[];
  status: taskStatus;
  startDate?: Date;
  endDate: Date;
  projectId: string;
}

export interface TaskParams {
  status?: string;
  endDate?: Date;
  userAssigned?: string;
}
