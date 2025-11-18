import { motion } from "framer-motion";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Award,
  Layers,
  Calendar,
  Target,
} from "lucide-react";

export default function Dashboard() {
  const quickStats = [
    {
      icon: <Layers size={24} />,
      label: "Total Projects",
      value: "12",
      change: "+2 this week",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Clock size={24} />,
      label: "In Progress",
      value: "5",
      change: "3 due soon",
      color: "from-orange-500 to-amber-500",
    },
    {
      icon: <CheckCircle2 size={24} />,
      label: "Completed",
      value: "7",
      change: "58% complete",
      color: "from-emerald-500 to-green-500",
    },
    {
      icon: <Award size={24} />,
      label: "Approved",
      value: "4",
      change: "Great work!",
      color: "from-purple-500 to-pink-500",
    },
  ];

  const recentActivity = [
    {
      title: "Submitted E-commerce Project",
      time: "2 hours ago",
      type: "success",
    },
    {
      title: "Started React Dashboard Module",
      time: "5 hours ago",
      type: "info",
    },
    { title: "Completed API Integration", time: "1 day ago", type: "success" },
    {
      title: "New Project Assigned: Blog System",
      time: "2 days ago",
      type: "warning",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-xl p-8 text-white"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome Back! 👋</h1>
          <p className="text-purple-100">
            Here's what's happening with your projects today.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl text-white shadow-md`}
                >
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-800">
                  {stat.value}
                </div>
              </div>
              <div className="font-semibold text-gray-700 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-500">{stat.change}</div>
            </motion.div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/30"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-purple-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "success"
                        ? "bg-green-500"
                        : activity.type === "info"
                        ? "bg-blue-500"
                        : "bg-amber-500"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {activity.title}
                    </div>
                    <div className="text-sm text-gray-500">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/30"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-orange-600" />
              Upcoming Deadlines
            </h3>
            <div className="space-y-3">
              {[
                {
                  project: "E-commerce Frontend",
                  due: "In 3 days",
                  priority: "high",
                },
                {
                  project: "API Documentation",
                  due: "In 5 days",
                  priority: "medium",
                },
                {
                  project: "Database Design",
                  due: "In 1 week",
                  priority: "low",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-purple-50 border border-purple-100"
                >
                  <div>
                    <div className="font-semibold text-gray-800">
                      {item.project}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{item.due}</div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : item.priority === "medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.priority.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/30"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Target size={20} className="text-indigo-600" />
            Your Progress This Month
          </h3>
          <div className="space-y-4">
            {[
              {
                skill: "React Development",
                progress: 85,
                color: "bg-blue-500",
              },
              { skill: "Node.js Backend", progress: 70, color: "bg-green-500" },
              {
                skill: "Database Design",
                progress: 60,
                color: "bg-purple-500",
              },
              { skill: "UI/UX Design", progress: 45, color: "bg-pink-500" },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">
                    {item.skill}
                  </span>
                  <span className="font-bold text-gray-800">
                    {item.progress}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className={`h-full ${item.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
