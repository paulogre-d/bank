import Link from "next/link";
import DashboardOverview from "../components/dashboard/DashboardOverview";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardOverview />
    </div>
  );
}
