import DashboardLayout from "../components/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
