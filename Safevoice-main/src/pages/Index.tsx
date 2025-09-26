import { useState } from "react";
import { Navigate } from "react-router-dom";
import { setRole, getRole } from "@/lib/role";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { User, FileText } from "lucide-react";

const Index = () => {
  const [role, setRoleState] = useState(getRole() || "");
  const [redirect, setRedirect] = useState(false);

  const handleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setRoleState(selectedRole);
    setRedirect(true);
  };

  if (redirect && role) {
    // First redirect to auth page for authentication
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to SafeVoice</h1>
        <p className="text-xl text-gray-600">Please select your role to continue</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full px-4">
        <Card className="w-full transform transition-all duration-200 hover:scale-105 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <User className="h-8 w-8 text-blue-600" />
              <span>Primary User</span>
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Submit reports, document incidents, and manage evidence securely.
              Ideal for victims, witnesses, and support workers.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                ✓ Submit detailed incident reports
              </li>
              <li className="flex items-center gap-2">
                ✓ Upload and manage evidence
              </li>
              <li className="flex items-center gap-2">
                ✓ Access support resources
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => handleSelect("primary")}
              className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
              variant="default"
            >
              Continue as Primary User
            </Button>
          </CardFooter>
        </Card>

        <Card className="w-full transform transition-all duration-200 hover:scale-105 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <FileText className="h-8 w-8 text-green-600" />
              <span>Reviewer</span>
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Review and process submitted reports, manage cases, and coordinate responses.
              For authorized personnel only.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                ✓ Review submitted reports
              </li>
              <li className="flex items-center gap-2">
                ✓ Process and verify evidence
              </li>
              <li className="flex items-center gap-2">
                ✓ Manage case workflow
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => handleSelect("reviewer")}
              className="w-full py-6 text-lg bg-green-600 hover:bg-green-700"
              variant="default"
            >
              Continue as Reviewer
            </Button>
          </CardFooter>
        </Card>
      </div>

      {role && (
        <div className="mt-8 text-center">
          <p className="text-lg">
            Selected role: <span className="font-semibold text-primary">{role}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            You will be redirected to login...
          </p>
        </div>
      )}
    </div>
  );
};

export default Index;
