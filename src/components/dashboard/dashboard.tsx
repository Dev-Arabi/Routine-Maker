"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreateRoutineDialog } from "./create-routine-dialog"
import { RoutineList } from "./routine-list"
import type { Profile, Routine } from "@/lib/types"
import { LogOut, Plus, User, Calendar, Clock, BookOpen, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface DashboardProps {
  user: {
    id: string
    email?: string
    [key: string]: any
  }
}

export function Dashboard({ user }: DashboardProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
    fetchRoutines()
  }, [])

  const fetchProfile = async () => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (data) {
      setProfile(data)
    }
    setLoading(false)
  }

  const fetchRoutines = async () => {
    const { data, error } = await supabase
      .from("routines")
      .select(`
  *,
  routine_entries (*)
`)
      .order("created_at", { ascending: false })

    if (data) {
      setRoutines(data)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleRoutineCreated = () => {
    fetchRoutines()
    setShowCreateDialog(false)
  }

  const handleRoutineDeleted = () => {
    fetchRoutines()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100">
        <div className="text-lg text-indigo-600 animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-indigo-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">
                <span className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-3 py-1 rounded-lg mr-1 shadow-md">
                  ROUTINE
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-600">
                  Maker
                </span>
              </h1>
              {profile && (
                <Badge
                  variant={profile.role === "admin" ? "default" : "secondary"}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white"
                >
                  {profile.role}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-indigo-50 px-3 py-2 rounded-lg">
                <User className="h-4 w-4 text-indigo-600" />
                <span className="text-sm text-indigo-700 font-medium">{user.email}</span>
              </div>
              <Button
                onClick={handleSignOut}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative w-full h-[450px] bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 flex items-center justify-center text-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full animate-pulse delay-2000"></div>
          <div className="absolute bottom-32 right-1/3 w-14 h-14 bg-white rounded-full animate-pulse delay-500"></div>
        </div>

        {/* Diagonal Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-transparent transform -skew-y-3 origin-top-left"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-indigo-800/30 to-transparent transform skew-y-3 origin-bottom-right"></div>

        <div className="relative z-10 text-white max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center mb-6">
            <Calendar className="h-12 w-12 mr-4 text-indigo-200" />
            <h2 className="text-5xl md:text-7xl font-extrabold drop-shadow-2xl">
              <span className="bg-white text-indigo-700 px-6 py-3 rounded-xl mr-3 shadow-2xl">ROUTINE</span>
              <span className="text-indigo-100">MAKER</span>
            </h2>
            <BookOpen className="h-12 w-12 ml-4 text-indigo-200" />
          </div>
          <p className="text-xl md:text-2xl font-medium text-indigo-100 drop-shadow-lg mb-8">
            YOUR DAILY SCHEDULE • SIMPLIFIED • ORGANIZED
          </p>
          <div className="flex items-center space-x-8 text-indigo-200">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">Time Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Class Scheduling</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm font-medium">Academic Planning</span>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-indigo-200 w-full md:w-auto">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800 mb-2">
              Class Routines
            </h2>
            <p className="text-indigo-600 font-medium">
              {profile?.role === "admin" ? "Manage and create class routines" : "View and print class routines"}
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-600 z-10" />
              <Input
                type="text"
                placeholder="Search by class number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full md:w-64"
              />
            </div>
            {profile?.role === "admin" && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Routine
              </Button>
            )}
          </div>
        </div>

        <RoutineList
          routines={routines}
          isAdmin={profile?.role === "admin"}
          onRoutineDeleted={handleRoutineDeleted}
          searchQuery={searchQuery}
        />

        {profile?.role === "admin" && (
          <CreateRoutineDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onRoutineCreated={handleRoutineCreated}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-indigo-600 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-indigo-100">
          &copy; {new Date().getFullYear()} Routine Maker. All rights reserved. Developed by{" "}
          <a
            href="https://saif.maysoon.site/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white transition-colors"
          >
            Saif Arabi
          </a>
        </div>
      </footer>
    </div>
  )
}
