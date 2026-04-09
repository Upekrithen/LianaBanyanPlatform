import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type StaffAccessGateProps = {
  children: React.ReactNode;
  loadingText?: string;
  deniedText?: string;
};

export function StaffAccessGate({
  children,
  loadingText = "Loading...",
  deniedText = "Staff access required",
}: StaffAccessGateProps) {
  const { user } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  if (roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">{loadingText}</div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">{deniedText}</p>
            <Button variant="outline" onClick={() => navigate("/")} className="mt-4">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
