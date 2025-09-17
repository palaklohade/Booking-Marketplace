# Booking Marketplace Dashboard 

This project is a full-stack application for a two-sided marketplace, allowing sellers to set their availability and buyers to book appointments. It features separate dashboards for each user type, with real-time updates and seamless data flow.

## Features

  * **Seller Dashboard**: Sellers can set and update their working days and hours.
  * **Buyer Dashboard**: Buyers can browse a list of sellers and book appointments based on the sellers' availability.
  * **Dynamic Booking**: The booking modal fetches and generates available time slots based on the seller's defined availability.
  * **Appointment Management**: Both parties can view their scheduled meetings in a clean, organized list.
  * **Database Integration**: All availability and appointment data is persisted using a Supabase backend.
  * **Secure Authentication**: User sessions are managed using Supabase Auth.

##  Tech Stack

  * **Frontend**: React, TypeScript, Tailwind CSS
  * **State Management**: React Hooks (`useState`, `useEffect`)
  * **Routing**: React Router DOM
  * **Backend**: Supabase (PostgreSQL)
  * **API**: RESTful API calls to Supabase for all data operations

##  Database Schema

The application relies on a well-structured database schema to manage users, sellers, appointments, and availability.

### `users` table

This table stores general user information and is linked to Supabase's authentication service.

```sql
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null,
  name text,
  avatar text
);
```

### `sellers` table

This table contains specific details for users who are sellers, linked via a foreign key.

```sql
create table public.sellers (
  id uuid primary key references public.users(id) on delete cascade,
  name text,
  email text not null,
  google_refresh_token text,
  created_at timestamptz default now(),
  avatar text,
  specialty text default 'General Consultation'::text
);
```

### `availability` table

This table stores each seller's weekly availability. The `seller_id` is a primary key, ensuring a one-to-one relationship.

```sql
create table public.availability (
  seller_id uuid primary key references public.sellers(id) on delete cascade,
  days jsonb not null,
  start_time text not null,
  end_time text not null,
  updated_at timestamptz not null default now()
);
```

### `appointments` table

This table records all confirmed bookings, with foreign keys linking to both the buyer and seller.

```sql
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  title text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  seller_id uuid references public.sellers(id) not null,
  buyer_id uuid references public.users(id) not null,
  seller_name text,
  buyer_name text,
  seller_email text,
  buyer_email text not null,
  meeting_link text,
  status text not null
);
```

## How to Run Locally

### Prerequisites

  * Node.js
  * npm or yarn
  * A Supabase project with the above database schemas configured.

### Setup

1.  Clone the repository:

    ```bash
    git clone <repository_url>
    cd <project-folder>
    ```

2.  Install dependencies:

    ```bash
    npm install
    # or
    yarn
    ```

3.  Create a `.env.local` file in the root directory and add your Supabase credentials:

    ```
    REACT_APP_SUPABASE_URL=YOUR_SUPABASE_URL
    REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

4.  Run the development server:

    ```bash
    npm start
    # or
    yarn start
    ```

Open your browser and navigate to `http://localhost:3000`.
