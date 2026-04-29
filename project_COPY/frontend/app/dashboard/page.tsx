"use client";

import { redirect } from "next/navigation";

export default function DashboardPage() {
  // User /dashboard URL ekata giyaama kelinma summary tab ekata yawanna
  redirect("/dashboard/summery");
}