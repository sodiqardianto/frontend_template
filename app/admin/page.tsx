"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, FileText, TrendingUp, Activity } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "2,543",
      change: "+12.5%",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Documents",
      value: "1,234",
      change: "+8.2%",
      icon: FileText,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Growth",
      value: "23.5%",
      change: "+4.1%",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Active Now",
      value: "573",
      change: "+2.3%",
      icon: Activity,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <>
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-500 font-medium">
                    {stat.change}
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-4 pb-4 border-b border-border last:border-0"
                >
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">New user registered</p>
                    <p className="text-xs text-muted-foreground">
                      user{item}@example.com joined the platform
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item}h ago
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full p-3 text-left rounded-lg hover:bg-accent transition-colors duration-200 border border-border">
              <div className="font-medium text-sm">Create New User</div>
              <div className="text-xs text-muted-foreground mt-1">
                Add a new user to the system
              </div>
            </button>
            <button className="w-full p-3 text-left rounded-lg hover:bg-accent transition-colors duration-200 border border-border">
              <div className="font-medium text-sm">Generate Report</div>
              <div className="text-xs text-muted-foreground mt-1">
                Create a new analytics report
              </div>
            </button>
            <button className="w-full p-3 text-left rounded-lg hover:bg-accent transition-colors duration-200 border border-border">
              <div className="font-medium text-sm">View Logs</div>
              <div className="text-xs text-muted-foreground mt-1">
                Access system activity logs
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
