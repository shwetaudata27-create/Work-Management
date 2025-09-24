"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Calendar, ChevronLeft, ChevronRight, LogOut, Plus, Edit, Save, X, Clock } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import { Badge } from "../components/ui/badge"

interface User {
  username: string
  name: string
  type: string
}

interface EmployeeDashboardProps {
  user: User
  onLogout: () => void
}

interface WorkUpdate {
  id?: string
  date: string
  projectType: string
  projectName: string
  workDone: string
  task: string
  helpTaken: string
  status: "work" | "leave"
  timestamp?: string
}

export function EmployeeDashboard({ user, onLogout }: EmployeeDashboardProps) {
  const [workUpdates, setWorkUpdates] = useState<WorkUpdate[]>([])
  const [editingUpdate, setEditingUpdate] = useState<WorkUpdate | null>(null)
  const [newUpdate, setNewUpdate] = useState<WorkUpdate>({
    date: new Date().toISOString().split("T")[0],
    projectType: user.type,
    projectName: "",
    workDone: "",
    task: "",
    helpTaken: "",
    status: "work",
  })
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const { toast } = useToast()

  const API_URL = "http://localhost:5000.onrender.com/api"

  const fetchWorkUpdates = async () => {
  try {
    const res = await fetch(`${API_URL}/work-updates/${user.username}`);
    const data = await res.json();
    setWorkUpdates(data);

    // ✅ Check if today's update is missing
    const todayStr = new Date().toISOString().split("T")[0];
    const todayUpdate = data.find((u: WorkUpdate) => u.date === todayStr);

    const now = new Date();
    const hour = now.getHours();

    if (!todayUpdate && hour >= 20) {
      // Auto-mark leave
      await autoMarkLeave(todayStr);
    }
  } catch (err) {
    console.error("Failed to fetch work updates", err);
  }
};

const autoMarkLeave = async (date: string) => {
  try {
    const res = await fetch(`${API_URL}/work-update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        projectType: user.type,
        projectName: "",
        workDone: "No work update submitted",
        task: "",
        helpTaken: "",
        status: "leave",
        username: user.username,
        name: user.name,
        userType: user.type,
        timestamp: new Date().toISOString(),
      }),
    });
    const data = await res.json();
    if (data.success) {
      fetchWorkUpdates();
      toast({
        title: "Leave Marked Automatically",
        description: `Since no update was submitted by 8 PM, leave has been recorded for ${date}.`,
      });
    }
  } catch (err) {
    console.error("Failed to auto-mark leave", err);
  }
};

//  useEffect(() => {
//     fetchWorkUpdates()
//   }, [user.username])
useEffect(() => {
  fetchWorkUpdates();

  const interval = setInterval(() => {
    fetchWorkUpdates();
  }, 5 * 60 * 1000); // every 5 minutes

  return () => clearInterval(interval);
}, [user.username]);

  const saveNewUpdate = async (update: WorkUpdate) => {
    try {
      const res = await fetch(`${API_URL}/work-update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...update, username: user.username, name: user.name, userType: user.type }),
      })
      const data = await res.json()
      if (data.success) fetchWorkUpdates()
    } catch (err) {
      console.error("Failed to save work update", err)
      toast({ title: "Error", description: "Failed to save update", variant: "destructive" })
    }
  }

  const saveEditUpdate = async (update: WorkUpdate) => {
    try {
      const res = await fetch(`${API_URL}/work-update/${update.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      })
      const data = await res.json()
      if (data.success) fetchWorkUpdates()
    } catch (err) {
      console.error("Failed to edit work update", err)
      toast({ title: "Error", description: "Failed to edit update", variant: "destructive" })
    }
  }

  const isEditable = (update: WorkUpdate) => {
  if (!update.timestamp) return false
  const now = new Date()
  const updateTime = new Date(update.timestamp)
  const diffMinutes = (now.getTime() - updateTime.getTime()) / (1000 * 60)
  return diffMinutes <= 5
}

  const handleAddUpdate = async () => {
  const todayStr = new Date().toISOString().split("T")[0]
  const alreadyExists = workUpdates.some((u) => u.date === todayStr)
  if (alreadyExists) {
    toast({
      title: "Update Already Exists",
      description: "You have already added your update for today.",
      variant: "destructive",
    })
    return
  }

  if (newUpdate.status === "work" && (!newUpdate.workDone.trim() || !newUpdate.projectName.trim())) {
    toast({
      title: "Error",
      description: "Please fill in both project name and work description",
      variant: "destructive",
    })
    return
  }

  const update = { ...newUpdate, timestamp: new Date().toISOString() }
  await saveNewUpdate(update)
  setNewUpdate({
    date: todayStr,
    projectType: user.type,
    projectName: "",
    workDone: "",
    task: "",
    helpTaken: "",
    status: "work",
  })
  toast({
    title: newUpdate.status === "leave" ? "Leave Marked" : "Work Update Added",
    description: newUpdate.status === "leave"
      ? "Your leave has been recorded"
      : "Your work progress has been recorded successfully",
  })
}
const handleDeleteUpdate = async (updateId: string) => {
  try {
    const res = await fetch(`${API_URL}/work-update/${updateId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      fetchWorkUpdates(); // refresh list
      toast({ title: "Deleted", description: "Work update deleted successfully" });
    }
  } catch (err) {
    toast({ title: "Error", description: "Failed to delete update", variant: "destructive" });
  }
};

  const handleEditUpdate = (update: WorkUpdate) => {
    if (!isEditable(update)) {
      toast({
        title: "Edit Not Allowed",
        description: "Updates can only be edited within 5 minutes of creation",
        variant: "destructive",
      })
      return
    }
    setEditingUpdate({ ...update })
  }
  const handleSaveEdit = async () => {
  if (!editingUpdate) return; // ✅ prevent null
  await saveEditUpdate(editingUpdate)
  setEditingUpdate(null)
  toast({ title: "Update Saved", description: "Your work update has been modified successfully" })
}


  const handleCancelEdit = () => {
    setEditingUpdate(null)
  }

  const getUpdatesForDate = (dateStr: string) => {
  return workUpdates.filter((update) => update.date === dateStr)
}

  const getMonthStats = () => {
    const currentMonthUpdates = workUpdates.filter((update) => {
      const updateDate = new Date(update.date)
      return updateDate.getMonth() === currentMonth.getMonth() &&
             updateDate.getFullYear() === currentMonth.getFullYear()
    })
    return {
      updatesThisMonth: currentMonthUpdates.length,
      daysWorked: currentMonthUpdates.filter((u) => u.status === "work").length,
      leaveDays: currentMonthUpdates.filter((u) => u.status === "leave").length,
    }
  }

  const stats = getMonthStats()

  const getProjectColors = (type: string) => {
  switch (type) {
    case "software":
      return {
        gradient: "from-blue-600 via-purple-600 to-indigo-700",
        accent: "bg-blue-500",
        light: "bg-blue-50",
        border: "border-blue-200",
        placeholder: "bg-blue-500",
        backgroundImage: "linear-gradient(to right, #e7e7e7ff, #5ccfc2ff, #a8c2ecff)",
      }
    case "hardware":
      return {
        gradient: "from-orange-600 via-red-600 to-pink-700",
        accent: "bg-orange-500",
        light: "bg-orange-50",
        border: "border-orange-200",
       backgroundImage: "linear-gradient(135deg, #b3d384ff 0%, #b4a07dff 50%, #332f30ff 100%)",
      }
    default:
      return {
        gradient: "from-blue-600 via-purple-600 to-indigo-700",
        accent: "bg-blue-500",
        light: "bg-blue-50",
        border: "border-blue-200",
      }
  }
}

  const projectColors = getProjectColors(user.type)

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: projectColors.backgroundImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div
                className={`w-16 h-16 ${projectColors.accent} rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-sm bg-white/20 border border-white/30`}
              >
                <span className="text-black text-2xl font-bold">
                  {user.type === "software"
                    ? "💻"
                    : user.type === "hardware"
                      ? "🔧"
                      : user.type === "prototype"
                        ? "🚀"
                        : "⚙️"}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black drop-shadow-lg">
                    {user.name} - {(user.type ? user.type.charAt(0).toUpperCase() + user.type.slice(1) : "General")} Dashboard
                </h1>

                <p className="text-black text-lg">Track your {user.type} project work updates</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12 border-3 border-white/30 shadow-xl">
                <AvatarFallback className="bg-white/20 text-black font-bold text-lg backdrop-blur-sm">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="secondary"
                onClick={onLogout}
                className="bg-white/20 hover:bg-white/30 text-black border-white/30 backdrop-blur-sm shadow-xl font-semibold"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="backdrop-blur-md bg-white/20 border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/25">
            <CardHeader className="pb-2">
              <CardDescription className="text-black/80 font-medium">Project Type</CardDescription>
              <CardTitle className="text-3xl capitalize flex items-center text-black drop-shadow">
                {user.type}
                <Badge variant="secondary" className={`ml-2 capitalize ${projectColors.accent} text-black shadow-lg`}>
                  {user.type}
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="backdrop-blur-md bg-white/20 border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/25">
            <CardHeader className="pb-2">
              <CardDescription className="text-black/80 font-medium">Updates This Month</CardDescription>
              <CardTitle className="text-3xl text-black drop-shadow">{stats.updatesThisMonth}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="backdrop-blur-md bg-white/20 border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/25">
            <CardHeader className="pb-2">
              <CardDescription className="text-black/80 font-medium">Days Worked</CardDescription>
              <CardTitle className="text-3xl text-black drop-shadow">{stats.daysWorked}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="backdrop-blur-md bg-white/20 border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/25">
            <CardHeader className="pb-2">
              <CardDescription className="text-black/80 font-medium">Leave Days</CardDescription>
              <CardTitle className="text-3xl text-black drop-shadow">{stats.leaveDays}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="backdrop-blur-md bg-white/15 border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-black drop-shadow">
                <Plus className="w-6 h-6 mr-2" />
                Add Work Update
              </CardTitle>
              <CardDescription className="text-black/80">
                Record your daily work progress or mark leave for today only
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Label htmlFor="date" className="font-semibold text-black drop-shadow">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={newUpdate.date}
                    readOnly
                    className="border-2 bg-white/20 backdrop-blur-sm border-white/30 text-black placeholder-white/60 cursor-not-allowed"
                    title="Work updates can only be added for today's date;"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <Label htmlFor="status" className="font-semibold text-black drop-shadow">
                    Status
                  </Label>
                  <Select
                    value={newUpdate.status}
                    onValueChange={(value) => setNewUpdate({ ...newUpdate, status: value as "work" | "leave" })}
                  >
                    <SelectTrigger className="border-2 border-white/30 bg-white/20 backdrop-blur-sm text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-md bg-white/90">
                      <SelectItem value="work">Work Day</SelectItem>
                      <SelectItem value="leave">I am on Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newUpdate.status === "work" && (
                <>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="projectName" className="font-semibold text-black drop-shadow">
                      Project Name *
                    </Label>
                    <Input
                      id="projectName"
                      placeholder="Enter the project name you're working on..."
                      value={newUpdate.projectName}
                      onChange={(e) => setNewUpdate({ ...newUpdate, projectName: e.target.value })}
                        className="border-2 border-white/30 bg-white/20 backdrop-blur-sm text-black/80 placeholder-white/60 focus:placeholder-white/80"
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="workDone" className="font-semibold text-black drop-shadow">
                      Work Done *
                    </Label>
                    <Textarea
                      id="workDone"
                      placeholder="Describe what you accomplished..."
                      value={newUpdate.workDone}
                      onChange={(e) => setNewUpdate({ ...newUpdate, workDone: e.target.value })}
                      rows={3}
                      className="border-2 border-white/30 bg-white/20 backdrop-blur-sm text-black placeholder-white/60"
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="task" className="font-semibold text-black drop-shadow">
                      Task/Assignment (Optional)
                    </Label>
                    <Textarea
                      id="task"
                      placeholder="Any specific task or assignment details..."
                      value={newUpdate.task}
                      onChange={(e) => setNewUpdate({ ...newUpdate, task: e.target.value })}
                      rows={2}
                      className="border-2 border-white/30 bg-white/20 backdrop-blur-sm text-black placeholder-white/60"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="helpTaken" className="font-semibold text-black drop-shadow">
                      Taken Anyone's Help?
                    </Label>
                    <Input
                      id="helpTaken"
                      placeholder="Did you take help from anyone? (Optional)"
                      value={newUpdate.helpTaken}
                      onChange={(e) => setNewUpdate({ ...newUpdate, helpTaken: e.target.value })}
                      className="border-2 border-white/30 bg-white/20 backdrop-blur-sm text-black placeholder-white/60"
                    />
                  </div>
                </>
              )}

            <div className="flex flex-col space-y-5">
              <Button
                onClick={handleAddUpdate}
                className={`w-full ${projectColors.accent} hover:opacity-90 text-black font-bold py-4 text-lg shadow-2xl backdrop-blur-sm border border-white/30`}
              >
                {newUpdate.status === "leave" ? "Mark Leave" : "Add Work Update"}
              </Button>
            </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/15 border-white/30 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl text-black drop-shadow">
                  <Calendar className="w-6 h-6 mr-2" />
                  {user.name}'s Work Calendar -{" "}
                  {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="border-2 border-white/30 bg-white/20 backdrop-blur-sm text-wblackhite hover:bg-white/30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="border-2 border-white/30 bg-white/20 backdrop-blur-sm text-black hover:bg-white/30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="flex items-center space-x-4 text-black/80">
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded mr-1"></span>Work days
                </span>
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded mr-1"></span>Leave days
                </span>
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded mr-1"></span>Weekend work
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkCalendar
                workUpdates={workUpdates}
                currentMonth={currentMonth}
                onDateClick={setSelectedDate}
                selectedDate={selectedDate}
              />
              {selectedDate && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white/20 backdrop-blur-md rounded-lg border border-white/30 p-6 w-96 max-h-[80vh] overflow-y-auto relative">
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 text-white"
        onClick={() => setSelectedDate(null)}
      >
        <X className="w-4 h-4" />
      </Button>
      <h3 className="text-lg font-bold mb-4 text-white drop-shadow">
        Updates for {new Date(selectedDate).toLocaleDateString()}
      </h3>
      {getUpdatesForDate(selectedDate).map((update) => (
        <div
          key={update.id}
          className="mb-4 p-3 bg-white/20 rounded shadow border border-white/30 text-white"
        >
          <p><strong>Status:</strong> {update.status}</p>
          {update.projectName && <p><strong>Project:</strong> {update.projectName}</p>}
          <p><strong>Work Done:</strong> {update.workDone}</p>
          {update.task && <p><strong>Task:</strong> {update.task}</p>}
          {update.helpTaken && <p><strong>Help:</strong> {update.helpTaken}</p>}
        </div>
      ))}
    </div>
  </div>
)}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 backdrop-blur-md bg-white/15 border-white/30 shadow-2xl">
  <CardHeader className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md rounded-t-lg border-b border-white/20">
    <CardTitle className="text-xl text-black drop-shadow">
      My Work Updates - {user.type ? user.type.charAt(0).toUpperCase() + user.type.slice(1) : "General"} Projects
    </CardTitle>
    <CardDescription className="text-black">
      Your recent work updates (editable for 5 minutes after creation)
    </CardDescription>
  </CardHeader>

  <CardContent className="overflow-x-auto">
    <table className="w-full table-auto text-black border-collapse">
      <thead>
        <tr className="bg-white/20">
          <th className="px-4 py-2">Date</th>
          <th className="px-4 py-2">Status</th>
          <th className="px-4 py-2">Project</th>
          <th className="px-4 py-2">Work Done</th>
          <th className="px-4 py-2">Task</th>
          <th className="px-4 py-2">Help Taken</th>
          <th className="px-4 py-2">Action</th>
        </tr>
      </thead>
      <tbody>
        {workUpdates.map((update) => {
          const editable = isEditable(update) && update.status === "work"; // Only editable for 5 minutes
          return (
            <tr key={update.id} className="hover:bg-black/10">
              <td className="border px-4 py-2">{new Date(update.date).toLocaleDateString()}</td>
              <td className="border px-4 py-2">{update.status === "leave" ? "Leave" : update.projectType}</td>
              <td className="border px-4 py-2">{update.projectName}</td>
              <td className="border px-4 py-2">{update.workDone}</td>
              <td className="border px-4 py-2">{update.task}</td>
              <td className="border px-4 py-2">{update.helpTaken}</td>
              <td className="border px-4 py-2 space-x-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteUpdate(update.id!)}
                >
                  Delete
                </Button>
                {editable && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditUpdate(update)}
                  >
                    Edit
                  </Button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </CardContent>
</Card>

      </div>
    </div>
  )
}

interface WorkCalendarProps {
  workUpdates: WorkUpdate[]
  currentMonth: Date
  onDateClick: (dateStr: string) => void
  selectedDate: string | null
}

function WorkCalendar({ workUpdates, currentMonth, onDateClick, selectedDate }: WorkCalendarProps) {

  const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

  const getFirstDayOfMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
}

  const getUpdateForDate = (day: number): WorkUpdate | undefined => {
  const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  return workUpdates.find((update) => update.date === dateStr)
}

  const isWeekend = (day: number): boolean => {
  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
  return date.getDay() === 0 || date.getDay() === 6
}

  const handleDateClick = (day: number): void => {
  const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  const update = getUpdateForDate(day)
  if (update) {
    onDateClick(dateStr)
  }
}

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="grid grid-cols-7 gap-2 text-sm">
      {days.map((day) => (
        <div key={day} className="p-3 text-center font-bold text-gray-600 bg-gray-100 rounded">
          {day}
        </div>
      ))}
      {Array.from({ length: firstDay }, (_, i) => (
        <div key={`empty-${i}`} className="p-3"></div>
      ))}
      {Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1
        const update = getUpdateForDate(day)
        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
        const isSelected = selectedDate === dateStr
        const weekend = isWeekend(day)

        let bgColor = "hover:bg-gray-100 border-2 border-gray-200"
        let textColor = "text-gray-700"

        if (update) {
          if (update.status === "leave") {
            bgColor = isSelected
              ? "bg-red-600 text-black border-red-600"
              : "bg-red-100 text-red-800 hover:bg-red-200 border-red-300"
          } else if (weekend) {
            bgColor = isSelected
              ? "bg-blue-600 text-black border-blue-600"
              : "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
          } else {
            bgColor = isSelected
              ? "bg-blue-600 text-black border-blue-600"
              : "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
          }
          textColor = "font-bold"
        } else if (weekend) {
          bgColor = "bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
        }

        return (
          <div
            key={day}
            className={`p-3 text-center rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${bgColor} ${textColor} shadow-sm`}
            onClick={() => handleDateClick(day)}
          >
            {day}
          </div>
        )
      })}
    </div>
  )
}
