import { supabase } from "./supabaseClient";

// ---------------------------------------------------------------------------
// All Admin-role data access lives here. Nothing in this file touches
// supabaseClient.js — it only imports the already-configured client.
// ---------------------------------------------------------------------------

/** All employees (used by EmployeeList) */
export async function getAllEmployees() {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role, phone, address")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Attendance rows for a single date, joined with the employee name */
export async function getAttendanceByDate(dateStr) {
  const { data, error } = await supabase
    .from("attendance")
    .select(
      "id, employee_id, date, status, check_in, check_out, users:employee_id (name)",
    )
    .eq("date", dateStr);

  if (error) throw error;
  return data ?? [];
}

/** Count of leave requests still awaiting a decision */
export async function getPendingLeaveCount() {
  const { count, error } = await supabase
    .from("leaves")
    .select("id", { count: "exact", head: true })
    .eq("status", "Pending");

  if (error) throw error;
  return count ?? 0;
}

/** Quick top-strip numbers for "today" */
export async function getTodayStats(dateStr) {
  const [{ data: attendance, error: attErr }, totalEmployees, pendingLeaves] =
    await Promise.all([
      supabase.from("attendance").select("status").eq("date", dateStr),
      supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .then((r) => r.count ?? 0),
      getPendingLeaveCount(),
    ]);

  if (attErr) throw attErr;

  const present = (attendance ?? []).filter(
    (a) => a.status === "Present",
  ).length;
  const halfDay = (attendance ?? []).filter(
    (a) => a.status === "Half-day",
  ).length;
  const onLeave = (attendance ?? []).filter((a) => a.status === "Leave").length;
  const absent = (attendance ?? []).filter((a) => a.status === "Absent").length;

  return { totalEmployees, present, halfDay, onLeave, absent, pendingLeaves };
}

/** Employees currently "clocked in" (checked in, not checked out) today — powers the live pulse widget */
export async function getLiveCheckedIn(dateStr) {
  const { data, error } = await supabase
    .from("attendance")
    .select("employee_id")
    .eq("date", dateStr)
    .not("check_in", "is", null)
    .is("check_out", null);

  if (error) throw error;
  return data?.length ?? 0;
}
