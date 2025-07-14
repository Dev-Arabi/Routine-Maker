"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Routine } from "@/lib/types"
import { Calendar, Clock, Eye, Printer, Trash2, BookOpen, Pencil, Search } from "lucide-react"
import { EditRoutineDialog } from "./edit-routine-dialog" // Import the new component

interface RoutineListProps {
  routines: Routine[]
  isAdmin?: boolean
  onRoutineDeleted: () => void // This will also be used for onRoutineUpdated
  searchQuery: string // New prop for search query
}

export function RoutineList({ routines, isAdmin, onRoutineDeleted, searchQuery }: RoutineListProps) {
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // State for Edit Dialog
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [routineToEdit, setRoutineToEdit] = useState<Routine | null>(null)

  const handleDelete = async (routineId: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.from("routines").delete().eq("id", routineId)

      if (!error) {
        onRoutineDeleted()
      }
    } catch (error) {
      console.error("Error deleting routine:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = (routine: Routine) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const sortedEntries = routine.routine_entries?.sort((a, b) => {
      const dayOrder = ["Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]
      const dayDiff = dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week)
      if (dayDiff !== 0) return dayDiff
      return a.start_time.localeCompare(b.start_time)
    })

    const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${routine.name} - Class ${routine.class_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .routine-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .day-header { background-color: #e3f2fd; font-weight: bold; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${routine.name}</h1>
          <h2>Class ${routine.class_number}</h2>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Subject</th>
              <th>Topic</th>
              <th>Start Time</th>
              <th>End Time</th>
            </tr>
          </thead>
          <tbody>
            ${
              sortedEntries
                ?.map(
                  (entry) => `
            <tr>
              <td>${entry.day_of_week}</td>
              <td>${entry.subject_name}</td>
              <td>${entry.topic_name}</td>
              <td>${new Date(`2000-01-01T${entry.start_time}`).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</td>
              <td>${new Date(`2000-01-01T${entry.end_time}`).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</td>
            </tr>
          `,
                )
                .join("") || ""
            }
          </tbody>
        </table>
      </body>
    </html>
  `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  // Filter routines based on searchQuery
  const filteredRoutines = routines.filter((routine) =>
    searchQuery ? routine.class_number.toString().includes(searchQuery) : true,
  )

  if (filteredRoutines.length === 0 && searchQuery) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-indigo-200 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-indigo-50 to-white">
          <div className="bg-indigo-100 p-4 rounded-full mb-6">
            <Search className="h-12 w-12 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-indigo-800 mb-3">No routines found for class "{searchQuery}"</h3>
          <p className="text-indigo-600 text-center max-w-md">
            Try a different class number or clear the search to see all routines.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (routines.length === 0) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-indigo-200 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-indigo-50 to-white">
          <div className="bg-indigo-100 p-4 rounded-full mb-6">
            <Calendar className="h-12 w-12 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-indigo-800 mb-3">No routines found</h3>
          <p className="text-indigo-600 text-center max-w-md">
            {isAdmin
              ? "Create your first routine to get started with organizing class schedules."
              : "No routines have been created yet. Contact your administrator."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRoutines.map((routine) => (
          <Card
            key={routine.id}
            className="bg-white/70 backdrop-blur-sm border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/80 group"
          >
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-indigo-800 group-hover:text-indigo-900 transition-colors flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
                  {routine.name}
                </CardTitle>
                <Badge variant="secondary" className="bg-indigo-200 text-indigo-800 border-indigo-300">
                  Class {routine.class_number}
                </Badge>
              </div>
              <CardDescription className="text-indigo-600 font-medium">
                {routine.routine_entries?.length || 0} time slots
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col space-y-2 text-sm text-indigo-600 mb-4 bg-indigo-50 p-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Created: {new Date(routine.created_at).toLocaleDateString()}</span>
                </div>
                {routine.updated_at &&
                  new Date(routine.updated_at).getTime() !== new Date(routine.created_at).getTime() && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Last Updated: {new Date(routine.updated_at).toLocaleDateString()}</span>
                    </div>
                  )}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRoutine(routine)}
                  className="flex-1 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePrint(routine)}
                  className="flex-1 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRoutineToEdit(routine)
                        setShowEditDialog(true)
                      }}
                      className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Routine</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{routine.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(routine.id)} disabled={loading}>
                            {loading ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Routine Detail Modal */}
      {selectedRoutine && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-indigo-200 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-indigo-800 flex items-center">
                    <BookOpen className="h-6 w-6 mr-3 text-indigo-600" />
                    {selectedRoutine.name}
                  </CardTitle>
                  <CardDescription className="text-indigo-600 font-medium">
                    Class {selectedRoutine.class_number}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedRoutine(null)}
                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow className="bg-indigo-50">
                    <TableHead className="text-indigo-800 font-semibold">Day</TableHead>
                    <TableHead className="text-indigo-800 font-semibold">Subject</TableHead>
                    <TableHead className="text-indigo-800 font-semibold">Topic</TableHead>
                    <TableHead className="text-indigo-800 font-semibold">Start Time</TableHead>
                    <TableHead className="text-indigo-800 font-semibold">End Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedRoutine.routine_entries
                    ?.sort((a, b) => {
                      const dayOrder = ["Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]
                      const dayDiff = dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week)
                      if (dayDiff !== 0) return dayDiff
                      return a.start_time.localeCompare(b.start_time)
                    })
                    .map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-indigo-50/50">
                        <TableCell>
                          <Badge variant="outline" className="border-indigo-300 text-indigo-700 bg-indigo-50">
                            {entry.day_of_week}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-indigo-800">{entry.subject_name}</TableCell>
                        <TableCell className="text-indigo-600">{entry.topic_name}</TableCell>
                        <TableCell className="text-indigo-600">
                          {new Date(`2000-01-01T${entry.start_time}`).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-indigo-600">
                          {new Date(`2000-01-01T${entry.end_time}`).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Routine Dialog */}
      {isAdmin && showEditDialog && routineToEdit && (
        <EditRoutineDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          initialRoutine={routineToEdit}
          onRoutineUpdated={onRoutineDeleted} // Reuse onRoutineDeleted to refetch routines
        />
      )}
    </div>
  )
}
