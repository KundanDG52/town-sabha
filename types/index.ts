export interface StoredUser {
  userId: string;
  name: string;
}

export interface AttendRequest {
  userId?: string;
  name?: string;
  mobile?: string;
}

export type AttendStatus = "registered" | "marked" | "duplicate" | "error";

export interface AttendResponse {
  status: AttendStatus;
  userId?: string;
  name?: string;
  message?: string;
}

export type AppScreen =
  | "scanner"
  | "register"
  | "success"
  | "duplicate"
  | "loading";
