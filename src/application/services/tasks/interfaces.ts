enum taskStatus {
  "pending",
  "in progress",
  "completed",
}

export interface Task {
  title: string;
  description: string;
  assignedTo: string[];
  status: taskStatus;
}
