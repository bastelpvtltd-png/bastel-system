import { redirect } from "next/navigation";

export default function AutomationPage() {
  // මෙතන අනිවාර්යයෙන්ම return එකකට කලින් redirect වෙන්න ඕනේ
  redirect("/automation/boat-note");
}