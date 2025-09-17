// types.ts

export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
}

// Matches `users` table
export interface User {
  id: string;      // uuid
  email: string;
  role: UserRole;
  name?: string;
  avatar?: string;
}

// Matches `sellers` table
export interface Seller {
  id: string;      // uuid
  name?: string;
  email: string;
  avatar?: string;
  specialty?: string;
}

// Matches `appointments` table (updated schema)
export interface Appointment {
  id: string;            // uuid
  event_id?: string;     // Google Calendar event ID
  title?: string;        // optional, can be derived from seller/buyer name
  start_time: string;    // raw timestamptz from DB
  end_time: string;      // raw timestamptz from DB
  start: Date;           // frontend-normalized Date
  end: Date;             // frontend-normalized Date
  seller_id: string;
  buyer_id: string;
  seller_name?: string;
  buyer_name?: string;
  seller_email?: string;
  buyer_email: string;
  meeting_link?: string;
  status: string;
  created_at?: string;
  with?: string;         // display-friendly field for UI
}

// For availability/time-slot UI
export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface Availability {
  days: { [key: string]: boolean };
  start_time: string;
  end_time: string;
}
