"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Calendar, ChevronLeft, ChevronRight, LogOut, Users, Activity, FolderOpen } from "lucide-react"
import { Badge } from "../components/ui/badge"

// Define the shape of the user object
interface User {
  username: string
  name: string
  role?: string
  type?: string
}

// Define the props for AdminDashboard
interface AdminDashboardProps {
  user: User
  onLogout: () => void
}

interface WorkUpdate {
  id: number;
  username: string;
  name: string;
  userType: "software" | "hardware"; // ✅ Add this
  date: string;
  projectType: string;
  projectName: string;
  workDone: string;
  task: string;
  helpTaken: string;
  status: string;
  timestamp: string;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps){
const [allWorkUpdates, setAllWorkUpdates] = useState<WorkUpdate[]>([])
const [selectedEmployee, setSelectedEmployee] = useState("")
const [selectedProjectType, setSelectedProjectType] = useState("")
const [employees, setEmployees] = useState<User[]>([])
const [currentMonth, setCurrentMonth] = useState(new Date())
const [selectedDate, setSelectedDate] = useState<string | null>(null)

useEffect(() => {
  fetch("http://localhost:5000/api/all-users")
    .then((res) => res.json())
    .then((users: User[]) => setEmployees(users))

  fetch("http://localhost:5000/api/all-work-updates")
    .then((res) => res.json())
    .then((updates: WorkUpdate[]) => {
      updates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setAllWorkUpdates(updates)
    })
}, [])

  const getFilteredEmployees = () => {
    if (!selectedProjectType || selectedProjectType === "All Project Types") return employees
    return employees.filter((emp) => (emp.type || "").toLowerCase() === selectedProjectType.toLowerCase())
  }

  const getFilteredUpdates = () => {
    let filtered = allWorkUpdates
    if (selectedProjectType && selectedProjectType !== "All Project Types") {
      filtered = filtered.filter((update) => update.projectType.toLowerCase() === selectedProjectType.toLowerCase())
    }
    if (selectedEmployee && selectedEmployee !== "All Employees") {
      const employee = employees.find((emp) => emp.name === selectedEmployee)
      if (employee) filtered = filtered.filter((update) => update.username === employee.username)
    }
    return filtered
  }
const getUpdatesForDate = (dateStr: string) => 
  getFilteredUpdates().filter((update) => update.date === dateStr)

  const getStats = () => {
    const thisMonth = new Date()
    const thisMonthUpdates = allWorkUpdates.filter((update) => {
      const updateDate = new Date(update.date)
      return updateDate.getMonth() === thisMonth.getMonth() && updateDate.getFullYear() === thisMonth.getFullYear()
    })
    return {
      totalEmployees: employees.length,
      updatesThisMonth: thisMonthUpdates.length,
      activeProjects: new Set(allWorkUpdates.map((u) => u.projectType.toLowerCase())).size,
    }
  }

  const stats = getStats()
  const filteredUpdates = getFilteredUpdates()
  const filteredEmployees = getFilteredEmployees()

  return (
    <div className="min-h-screen relative" style={{
      backgroundImage: `linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1)),
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="admin-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="%236366f1" strokeWidth="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23admin-grid)"/></svg>')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }}>
      {/* Header */}
      <div className="backdrop-blur-md bg-white/10 shadow-2xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/30">
                <span className="text-white text-2xl font-bold">👑</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 drop-shadow-lg">Admin Dashboard</h1>
                <p className="text-lg text-gray-700 drop-shadow">Welcome, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12 border-3 border-white/30 shadow-xl">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-bold">
                  {user.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" onClick={onLogout} className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/30 shadow-xl font-semibold">
                <LogOut className="w-5 h-5 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-md bg-white/20 border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center text-gray-700 font-medium">
                <Users className="w-5 h-5 mr-2" /> Total Employees
              </CardDescription>
              <CardTitle className="text-3xl text-gray-900 drop-shadow">{stats.totalEmployees}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="backdrop-blur-md bg-white/20 border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center text-gray-700 font-medium">
                <Activity className="w-5 h-5 mr-2" /> Work Updates This Month
              </CardDescription>
              <CardTitle className="text-3xl text-gray-900 drop-shadow">{stats.updatesThisMonth}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="backdrop-blur-md bg-white/20 border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center text-gray-700 font-medium">
                <FolderOpen className="w-5 h-5 mr-2" /> Active Projects
              </CardDescription>
              <CardTitle className="text-3xl text-gray-900 drop-shadow">{stats.activeProjects}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 backdrop-blur-md bg-white/20 border-white/30 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-gray-900 drop-shadow">Filters</CardTitle>
            <CardDescription className="text-gray-700">Select project type and employee name to view specific work updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-800">Project Type</label>
                <Select value={selectedProjectType} onValueChange={(value) => { setSelectedProjectType(value); setSelectedEmployee("") }}>
                  <SelectTrigger className="backdrop-blur-sm bg-white/30 border-white/40">
                    <SelectValue placeholder="Select Project Type" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-md bg-white/90">
                    <SelectItem value="All Project Types">All Project Types</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="hardware">Hardware</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-800">Employee Name</label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="backdrop-blur-sm bg-white/30 border-white/40">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-md bg-white/90 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
                    <SelectItem value="All Employees">All Employees</SelectItem>
                    {filteredEmployees.map((emp) => (
                      <SelectItem key={emp.username} value={emp.name}>
                        {emp.name} ({emp.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(selectedProjectType || selectedEmployee) && (
              <div className="mt-4 p-3 backdrop-blur-sm bg-blue-500/20 rounded-lg border border-blue-300/30">
                <p className="text-sm font-medium text-blue-900">Showing: {selectedProjectType || "All Types"} {selectedProjectType && selectedEmployee && " • "} {selectedEmployee || "All Employees"}</p>
                <p className="text-xs text-blue-800 mt-1">{filteredUpdates.length} work updates found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calendar and Team Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CalendarCard currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} filteredUpdates={filteredUpdates} selectedDate={selectedDate} setSelectedDate={setSelectedDate} selectedEmployee={selectedEmployee} selectedProjectType={selectedProjectType} />
          <TeamOverviewCard filteredEmployees={filteredEmployees} allWorkUpdates={allWorkUpdates} selectedProjectType={selectedProjectType} />
        </div>

        {/* Recent Updates */}
        <RecentUpdatesCard filteredUpdates={filteredUpdates} />
      </div>
    </div>
  )
}

/* ---------------------- Calendar Component ---------------------- */
interface CalendarCardProps {
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
  filteredUpdates: WorkUpdate[]
  selectedDate: string | null
  setSelectedDate: (date: string | null) => void
  selectedEmployee: string
  selectedProjectType: string
}

function CalendarCard({
  currentMonth,
  setCurrentMonth,
  filteredUpdates,
  selectedDate,
  setSelectedDate,
  selectedEmployee,
  selectedProjectType
}: CalendarCardProps) {
  return (
    <Card className="backdrop-blur-md bg-white/20 border-white/30 shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-gray-900 drop-shadow">
            <Calendar className="w-6 h-6 mr-2" />
            Team Work Calendar - {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            {(selectedEmployee || selectedProjectType) && (
              <Badge variant="secondary" className="ml-2 backdrop-blur-sm bg-white/30">
                Filtered
              </Badge>
            )}
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/30"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/30"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-gray-700">
          Blue: Work days | Red: Leave days | Green: Weekend work. Click dates to view details.
        </CardDescription>
      </CardHeader>
      <CardContent>
  <AdminWorkCalendar
    workUpdates={filteredUpdates}
    currentMonth={currentMonth}
    onDateClick={setSelectedDate}
    selectedDate={selectedDate}
  />

  {/* Popup Modal for Selected Date */}
 {selectedDate && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] p-6 relative overflow-hidden">
      {/* Close button */}
      <button
        onClick={() => setSelectedDate(null)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
      >
        ✕
      </button>

      {/* Title with date */}
      <h4 className="font-medium mb-4">
        Work Updates for {new Date(selectedDate).toLocaleDateString()}
        {(selectedEmployee || selectedProjectType) && (
          <span className="text-sm font-normal text-muted-foreground ml-2">(Filtered View)</span>
        )}
      </h4>

      {/* Scrollable content */}
      <div className="space-y-4 overflow-y-auto max-h-[30vh] pr-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100">
        {filteredUpdates.filter(u => u.date === selectedDate).length === 0 ? (
          <p className="text-sm text-muted-foreground">No work updates found for this date.</p>
        ) : (
          filteredUpdates.filter(u => u.date === selectedDate).map(update => (
            <div
              key={`${update.username}-${update.id}`}
              className="text-sm p-3 bg-purple-50 rounded border-l-4 border-blue-500"
            >
              {/* ✅ Employee name */}
              <div className="flex items-center space-x-2 mb-2">
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="text-xs">
                    {update.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-gray-900">{update.name}</span>
                <Badge
                  variant={update.status === "leave" ? "destructive" : "outline"}
                  className="capitalize"
                >
                  {update.status === "leave" ? "Leave" : update.projectType}
                </Badge>
              </div>

              {update.status === "work" ? (
                <>
                  <p><strong>Work:</strong> {update.workDone}</p>
                  {update.task && <p><strong>Task:</strong> {update.task}</p>}
                  {update.helpTaken && <p><strong>Help:</strong> {update.helpTaken}</p>}
                </>
              ) : (
                <p><strong>Status:</strong> <span className="text-red-600">On Leave</span></p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)}
</CardContent>
</Card>)
}

/* ---------------------- Team Overview ---------------------- */

interface TeamOverviewCardProps {
  filteredEmployees: User[]
  allWorkUpdates: WorkUpdate[]
  selectedProjectType: string
}

function TeamOverviewCard({ filteredEmployees, allWorkUpdates, selectedProjectType }: TeamOverviewCardProps) {
  return (
    <Card className="backdrop-blur-md bg-white/20 border-white/30 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-gray-900 drop-shadow">Team Overview</CardTitle>
        <CardDescription className="text-gray-700">
          {selectedProjectType && selectedProjectType !== "All Project Types"
            ? `${selectedProjectType} team members and their work activity`
            : "Current team members and their specializations"}
        </CardDescription>
      </CardHeader>
      <CardContent>
  {filteredEmployees.length === 0 ? (
    <p className="text-gray-600 text-center py-8">
      {selectedProjectType && selectedProjectType !== "All Project Types"
        ? `No ${selectedProjectType} employees found.`
        : "No employees found. Employees will appear here once they start adding work updates."}
    </p>
  ) : (
    // 🔹 Added scrollable wrapper
    <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
      {filteredEmployees.map((emp) => {
        const empUpdates = allWorkUpdates.filter((u) => u.username === emp.username)
        const thisMonthUpdates = empUpdates.filter((update) => {
          const updateDate = new Date(update.date)
          const thisMonth = new Date()
          return (
            updateDate.getMonth() === thisMonth.getMonth() &&
            updateDate.getFullYear() === thisMonth.getFullYear()
          )
        })

        return (
          <div
            key={emp.username}
            className="flex items-center justify-between p-4 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              <Avatar className="border-2 border-white/30">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                  {emp.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">{emp.name}</p>
                <p className="text-sm text-gray-700 capitalize">{emp.type} Developer</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{thisMonthUpdates.length} updates</p>
              <p className="text-xs text-gray-600">this month</p>
            </div>
          </div>
        )
      })}
    </div>
  )}
</CardContent>
</Card>)
}

/* ---------------------- Recent Updates ---------------------- */

interface RecentUpdatesCardProps {
  filteredUpdates: WorkUpdate[]
}

export function RecentUpdatesCard({ filteredUpdates }: RecentUpdatesCardProps) {
  // Group updates by date
  const updatesByDate: Record<string, WorkUpdate[]> = {}
  filteredUpdates.forEach((update) => {
    if (!updatesByDate[update.date]) updatesByDate[update.date] = []
    updatesByDate[update.date].push(update)
  })

  // Sort dates descending
  const sortedDates = Object.keys(updatesByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  const renderTable = (updates: WorkUpdate[]) => (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="border p-2 text-left">Employee</th>
            <th className="border p-2 text-left">Project</th>
            <th className="border p-2 text-left">Work Done</th>
            <th className="border p-2 text-left">Task</th>
            <th className="border p-2 text-left">Help Taken</th>
            <th className="border p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {updates.map((update) => (
            <tr key={`${update.username}-${update.id}`} className="hover:bg-gray-50">
              <td className="border p-2 flex items-center space-x-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                    {update.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <span>{update.name}</span>
              </td>
              <td className="border p-2">{update.projectName || "-"}</td>
              <td className="border p-2">{update.workDone || "-"}</td>
              <td className="border p-2">{update.task || "-"}</td>
              <td className="border p-2">{update.helpTaken || "-"}</td>
              <td className="border p-2 capitalize">{update.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => {
        const updatesForDate = updatesByDate[date]
        const softwareUpdates = updatesForDate.filter(u => u.userType === "software")
        const hardwareUpdates = updatesForDate.filter(u => u.userType === "hardware")

        return (
          <Card key={date} className="backdrop-blur-md bg-white/20 border-white/30 shadow-2xl mt-8">
            <CardHeader>
              <CardTitle className="text-gray-900 drop-shadow">Work Updates - {new Date(date).toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Software Employees */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Software Employees</h3>
                {softwareUpdates.length > 0 ? renderTable(softwareUpdates) : (
                  <p className="text-gray-600 text-center py-4">No software updates found for this date.</p>
                )}
              </div>

              {/* Hardware Employees */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Hardware Employees</h3>
                {hardwareUpdates.length > 0 ? renderTable(hardwareUpdates) : (
                  <p className="text-gray-600 text-center py-4">No hardware updates found for this date.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}


/* ---------------------- Work Calendar ---------------------- */
interface AdminWorkCalendarProps {
  workUpdates: WorkUpdate[]
  currentMonth: Date
  onDateClick: (dateStr: string) => void
  selectedDate: string | null
}

function AdminWorkCalendar({ workUpdates, currentMonth, onDateClick, selectedDate }: AdminWorkCalendarProps) {
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const getUpdatesForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return workUpdates.filter((update) => update.date === dateStr)
  }
  const isWeekend = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date.getDay() === 0 || date.getDay() === 6
  }
  const handleDateClick = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    if (getUpdatesForDay(day).length > 0) onDateClick(dateStr)
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="grid grid-cols-7 gap-1 text-sm">
      {days.map((day) => (
        <div key={day} className="p-2 text-center font-medium text-muted-foreground">{day}</div>
      ))}
      {Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} className="p-2"></div>)}
      {Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1
        const dayUpdates = getUpdatesForDay(day)
        const hasUpdates = dayUpdates.length > 0
        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
        const isSelected = selectedDate === dateStr
        const weekend = isWeekend(day)

        let bgColor = "hover:bg-gray-100"
        let textColor = ""

        if (hasUpdates) {
          const hasLeave = dayUpdates.some((u) => u.status === "leave")
          const hasWork = dayUpdates.some((u) => u.status === "work")

          if (hasLeave && !hasWork) bgColor = isSelected ? "bg-red-600 text-white" : "bg-red-100 text-red-800 hover:bg-red-200"
          else if (hasWork && weekend) bgColor = isSelected ? "bg-green-600 text-white" : "bg-green-100 text-green-800 hover:bg-green-200"
          else bgColor = isSelected ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800 hover:bg-blue-200"

          textColor = "font-medium"
        }

        return (
          <div
            key={day}
            className={`p-2 text-center rounded cursor-pointer transition-colors min-h-[50px] flex flex-col ${bgColor} ${textColor}`}
            onClick={() => handleDateClick(day)}
          >
            <div>{day}</div>
            {hasUpdates && (
              <div className="text-xs mt-1 font-medium">
                {dayUpdates.length} {dayUpdates.length === 1 ? "update" : "updates"}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
