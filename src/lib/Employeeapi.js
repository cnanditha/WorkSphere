// src/lib/employeeApi.js
// Data-access layer for the Employee role (Role B).
import { supabase } from "./supabaseClient";

const todayISO = () => new Date().toISOString().slice(0, 10);

/* ------------------------------ Profile ------------------------------ */

export async function fetchMyProfile(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role, phone, address")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateMyProfile(userId, { phone, address }) {
  const { data, error } = await supabase
    .from("users")
    .update({ phone, address })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ---------------------------- Attendance ---------------------------- */

export async function fetchTodayAttendance(userId) {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("employee_id", userId)
    .eq("date", todayISO())
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchMyAttendanceHistory(userId, days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("employee_id", userId)
    .gte("date", since.toISOString().slice(0, 10))
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function checkIn(userId) {
  const existing = await fetchTodayAttendance(userId);
  if (existing) return existing;
  const { data, error } = await supabase
    .from("attendance")
    .insert({
      employee_id: userId,
      date: todayISO(),
      status: "Present",
      check_in: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function checkOut(userId) {
  const existing = await fetchTodayAttendance(userId);
  if (!existing) throw new Error("You haven't checked in yet today.");
  const { data, error } = await supabase
    .from("attendance")
    .update({ check_out: new Date().toISOString() })
    .eq("id", existing.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ------------------------------ Leaves ------------------------------ */

export async function fetchMyLeaveSummary(userId) {
  const { data, error } = await supabase
    .from("leaves")
    .select("id, type, start_date, end_date, status")
    .eq("employee_id", userId)
    .order("start_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/* ---------------------------- Realtime ---------------------------- */

export function subscribeToMyAttendance(userId, onChange) {
  const channel = supabase
    .channel(`employee-attendance-${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "attendance", filter: `employee_id=eq.${userId}` },
      onChange
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeToMyLeaves(userId, onChange) {
  const channel = supabase
    .channel(`employee-leaves-${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "leaves", filter: `employee_id=eq.${userId}` },
      onChange
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export { todayISO };