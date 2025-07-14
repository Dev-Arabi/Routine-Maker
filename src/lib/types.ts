export interface Profile {
  id: string
  email: string
  role: "user" | "admin"
  created_at: string
}

export interface Routine {
  id: string
  name: string
  class_number: number
  created_by: string
  created_at: string
  updated_at: string
  routine_entries?: RoutineEntry[]
}

export interface RoutineEntry {
  id: string
  routine_id: string
  day_of_week: string
  subject_name: string
  start_time: string
  end_time: string
  created_at: string
}

export type DayOfWeek = "Friday" | "Saturday" | "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday"
