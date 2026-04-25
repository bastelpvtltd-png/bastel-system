"use client";

import { redirect } from "next/navigation";

export default function SystemPage() {
  // User /system URL ekata giyaama kelinma open-user-accounts ekata yawanna
  redirect("/system/open-user-accounts");
}