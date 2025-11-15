import { AuthComponent } from "@/Components/UI/sign-up";
import { Zap } from "lucide-react";

// A simple custom logo for TaskRush
const TaskRushLogo = () => (
  <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-md p-1.5 shadow-lg">
    <Zap className="h-4 w-4" />
  </div>
);

export default function TaskRushAuthDemo() {
  return (
    <AuthComponent 
      logo={<TaskRushLogo />} 
      brandName="TaskRush" 
    />
  );
}
