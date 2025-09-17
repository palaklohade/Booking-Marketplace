// src/services/api.ts
import { supabase } from "./supabase";
import { Seller, TimeSlot, Appointment, Availability } from "../types";

/**
 * Fetch appointments for a given user (seller or buyer)
 */
export const fetchAppointments = async (userId: string): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching appointments:", error);
      return [];
    }

    return (data || []).map((appt) => ({
      ...appt,
      start: new Date(appt.start_time),
      end: new Date(appt.end_time),
    }));
  } catch (err) {
    console.error("Unexpected error fetching appointments:", err);
    return [];
  }
};

/**
 * Fetch availability for a given seller
 */
export const fetchAvailability = async (sellerId: string): Promise<Availability | null> => {
  try {
    const { data, error } = await supabase
      .from("availability")
      .select("*")
      .eq("seller_id", sellerId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching seller availability:", error);
      return null;
    }

    if (!data) return null;

    return {
      days: data.days,
      start_time: data.start_time,
      end_time: data.end_time,
    } as Availability;
  } catch (err) {
    console.error("Unexpected error fetching seller availability:", err);
    return null;
  }
};

/**
 * Save or update seller availability
 */
export const saveAvailability = async (
  availability: Availability,
  sellerId: string
): Promise<Availability | null> => {
  try {
    const { data, error } = await supabase
      .from("availability")
      .upsert(
        {
          seller_id: sellerId,
          days: availability.days,
          start_time: availability.start_time,
          end_time: availability.end_time,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "seller_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Error saving availability:", error);
      return null;
    }

    return data
      ? {
          days: data.days,
          start_time: data.start_time,
          end_time: data.end_time,
        }
      : null;
  } catch (err) {
    console.error("Unexpected error saving availability:", err);
    return null;
  }
};

/**
 * Fetch all sellers
 */
export const fetchSellers = async (): Promise<Seller[]> => {
  try {
    const { data, error } = await supabase
      .from("sellers")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching sellers:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Unexpected error fetching sellers:", err);
    return [];
  }
};

/**
 * Fetch a single seller's details
 */
export const fetchSeller = async (sellerId: string): Promise<Seller | null> => {
  try {
    const { data, error } = await supabase
      .from("sellers")
      .select("*")
      .eq("id", sellerId)
      .single();

    if (error) {
      console.error("Error fetching single seller:", error);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error("Unexpected error fetching single seller:", err);
    return null;
  }
};

/**
 * Create a new appointment
 */
export const createAppointment = async (
  seller: Seller,
  buyer: { id: string; name?: string; email: string },
  slot: TimeSlot
): Promise<Appointment | null> => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        seller_id: seller.id,
        seller_name: seller.name || "",
        seller_email: seller.email || "",
        buyer_id: buyer.id,
        buyer_name: buyer.name || "",
        buyer_email: buyer.email,
        start_time: slot.start.toISOString(),
        end_time: slot.end.toISOString(),
        title: `Appointment: ${buyer.name || buyer.email} ↔ ${seller.name || seller.email}`,
        status: "confirmed",
        meeting_link: "", // make sure column in DB matches this name
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating appointment:", error);
      return null;
    }

    return {
      ...data,
      start: new Date(data.start_time),
      end: new Date(data.end_time),
    };
  } catch (err) {
    console.error("Unexpected error creating appointment:", err);
    return null;
  }
};

/**
 * Generate bookable time slots for a specific seller on a given date.
 */
export const getAvailableTimeSlots = (
  availability: Availability | null,
  date: Date
): TimeSlot[] => {
  if (!availability) {
    return [];
  }

  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
  if (!availability.days[dayOfWeek]) {
    return [];
  }

  const slots: TimeSlot[] = [];
  const [startHour, startMinute] = availability.start_time.split(":").map(Number);
  const [endHour, endMinute] = availability.end_time.split(":").map(Number);

  const now = new Date();
  let currentSlot = new Date(date);
  currentSlot.setHours(startHour, startMinute, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(endHour, endMinute, 0, 0);

  while (currentSlot.getTime() + 30 * 60 * 1000 <= endTime.getTime()) {
    const slotEnd = new Date(currentSlot.getTime() + 30 * 60 * 1000);
    // Only add slots that are in the future
    if (slotEnd > now) {
      slots.push({
        start: new Date(currentSlot),
        end: slotEnd,
      });
    }
    currentSlot = slotEnd;
  }
  return slots;
};