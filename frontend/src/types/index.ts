export interface User {
  username: string;
  name: string;
  role: "admin" | "employee";
  type: "software" | "hardware";
}

export interface WorkUpdate {
  id: string;
  username: string;
  name: string;
  date: string;
  projectType: string;
  workDone?: string;
  task?: string;
  helpTaken?: string;
  status: "work" | "leave";
  userType: "software" | "hardware";
  timestamp: string;
}
