"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { DayOfWeek } from "@/lib/types"
import {
  Plus,
  Trash2,
  ArrowRight,
  CalendarDays,
  Clock,
  BookOpen,
  Users,
  CheckCircle,
  Pencil,
  XCircle,
} from "lucide-react" // Added XCircle for cancel

interface CreateRoutineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRoutineCreated: () => void
}

interface TimeSlot {
  day: DayOfWeek
  subject: string
  startTime: string
  endTime: string
  topic: string
}

const DAYS: DayOfWeek[] = ["Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]
const CLASSES = Array.from({ length: 10 }, (_, i) => i + 1)

export function CreateRoutineDialog({ open, onOpenChange, onRoutineCreated }: CreateRoutineDialogProps) {
  const [step, setStep] = useState(1)
  const [routineName, setRoutineName] = useState("")
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [currentSlot, setCurrentSlot] = useState<Partial<TimeSlot>>({ topic: "N/A" })
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null) // New state for editing
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const resetForm = () => {
    setStep(1)
    setRoutineName("")
    setSelectedClass(null)
    setTimeSlots([])
    setCurrentSlot({ topic: "N/A" })
    setEditingSlotIndex(null) // Reset editing index
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const addOrUpdateTimeSlot = () => {
    if (currentSlot.day && currentSlot.subject && currentSlot.startTime && currentSlot.endTime) {
      const newSlot: TimeSlot = {
        ...currentSlot,
        topic: currentSlot.topic?.trim() === "" ? "N/A" : currentSlot.topic || "N/A",
      } as TimeSlot

      if (editingSlotIndex !== null) {
        // Update existing slot
        const updatedSlots = [...timeSlots]
        updatedSlots[editingSlotIndex] = newSlot
        setTimeSlots(updatedSlots)
      } else {
        // Add new slot
        setTimeSlots([...timeSlots, newSlot])
      }
      setCurrentSlot({ topic: "N/A" }) // Clear current slot inputs, reset topic to default
      setEditingSlotIndex(null) // Exit editing mode
    }
  }

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index))
    if (editingSlotIndex === index) {
      // If the deleted slot was being edited, clear the form
      setCurrentSlot({ topic: "N/A" })
      setEditingSlotIndex(null)
    } else if (editingSlotIndex !== null && index < editingSlotIndex) {
      // Adjust editing index if a slot before it was deleted
      setEditingSlotIndex(editingSlotIndex - 1)
    }
  }

  const handleEditTimeSlot = (index: number) => {
    const slotToEdit = timeSlots[index]
    setCurrentSlot(slotToEdit)
    setEditingSlotIndex(index)
  }

  const handleCancelEdit = () => {
    setCurrentSlot({ topic: "N/A" })
    setEditingSlotIndex(null)
  }

  const handleSubmit = async () => {
    if (!routineName || !selectedClass || timeSlots.length === 0) return

    setLoading(true)
    try {
      // Create routine
      const { data: routine, error: routineError } = await supabase
        .from("routines")
        .insert({
          name: routineName,
          class_number: selectedClass,
        })
        .select()
        .single()

      if (routineError) throw routineError

      // Create routine entries
      const entries = timeSlots.map((slot) => ({
        routine_id: routine.id,
        day_of_week: slot.day,
        subject_name: slot.subject,
        start_time: slot.startTime,
        end_time: slot.endTime,
        topic_name: slot.topic,
      }))

      const { error: entriesError } = await supabase.from("routine_entries").insert(entries)

      if (entriesError) throw entriesError

      onRoutineCreated()
      handleClose()
    } catch (error) {
      console.error("Error creating routine:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border-indigo-200 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 -m-6 mb-6 p-6 rounded-t-lg border-b border-indigo-200">
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800 flex items-center">
            <BookOpen className="h-6 w-6 mr-3 text-indigo-600" />
            Create New Routine
          </DialogTitle>
          <DialogDescription className="text-indigo-600 font-medium">
            Step {step} of 3: {step === 1 ? "Select Class" : step === 2 ? "Add Time Slots" : "Name Your Routine"}
          </DialogDescription>
        </DialogHeader>

        {/* Enhanced Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="flex items-center">
            <Badge
              variant={step >= 1 ? "default" : "secondary"}
              className={`px-4 py-2 text-sm font-semibold ${
                step >= 1
                  ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md"
                  : "bg-indigo-100 text-indigo-600"
              }`}
            >
              {step > 1 ? <CheckCircle className="h-4 w-4 mr-2" /> : <Users className="h-4 w-4 mr-2" />}
              1. Class
            </Badge>
          </div>
          <ArrowRight className="h-5 w-5 text-indigo-400" />
          <div className="flex items-center">
            <Badge
              variant={step >= 2 ? "default" : "secondary"}
              className={`px-4 py-2 text-sm font-semibold ${
                step >= 2
                  ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md"
                  : "bg-indigo-100 text-indigo-600"
              }`}
            >
              {step > 2 ? <CheckCircle className="h-4 w-4 mr-2" /> : <CalendarDays className="h-4 w-4 mr-2" />}
              2. Time Slots
            </Badge>
          </div>
          <ArrowRight className="h-5 w-5 text-indigo-400" />
          <div className="flex items-center">
            <Badge
              variant={step >= 3 ? "default" : "secondary"}
              className={`px-4 py-2 text-sm font-semibold ${
                step >= 3
                  ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md"
                  : "bg-indigo-100 text-indigo-600"
              }`}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              3. Name
            </Badge>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <Card className="backdrop-blur-sm bg-gradient-to-br from-indigo-50/80 to-white/80 border-indigo-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-100/50 to-indigo-50/50">
                <CardTitle className="text-indigo-800 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Select Class
                </CardTitle>
                <DialogDescription className="text-indigo-600">
                  Choose the class number for this routine.
                </DialogDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div>
                  <Label htmlFor="class-select" className="text-indigo-700 font-medium">
                    Class Number
                  </Label>
                  <Select
                    onValueChange={(value: string) => setSelectedClass(Number.parseInt(value))}
                    value={selectedClass?.toString() || ""}
                  >
                    <SelectTrigger className="w-full mt-2 border-indigo-300 focus:border-indigo-500 bg-white/80">
                      <SelectValue placeholder="Choose a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASSES.map((classNum) => (
                        <SelectItem key={classNum} value={classNum.toString()}>
                          Class {classNum}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            <DialogFooter>
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedClass}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Next Step
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Card className="backdrop-blur-sm bg-gradient-to-br from-indigo-50/80 to-white/80 border-indigo-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-100/50 to-indigo-50/50">
                <CardTitle className="text-indigo-800 flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2" />
                  Add Time Slot
                </CardTitle>
                <DialogDescription className="text-indigo-600">
                  Define the subject, day, time, and topic for each class period.
                </DialogDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-indigo-700 font-medium">Day</Label>
                    <Select
                      onValueChange={(value: string) => setCurrentSlot({ ...currentSlot, day: value as DayOfWeek })}
                      value={currentSlot.day || ""}
                    >
                      <SelectTrigger className="mt-2 border-indigo-300 focus:border-indigo-500 bg-white/80">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-indigo-700 font-medium">
                      Subject Name
                    </Label>
                    <Input
                      id="subject"
                      value={currentSlot.subject || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentSlot({ ...currentSlot, subject: e.target.value })
                      }
                      placeholder="e.g., Mathematics, Physics"
                      className="mt-2 border-indigo-300 focus:border-indigo-500 bg-white/80"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time" className="text-indigo-700 font-medium">
                      Start Time
                    </Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={currentSlot.startTime || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentSlot({ ...currentSlot, startTime: e.target.value })
                      }
                      className="mt-2 border-indigo-300 focus:border-indigo-500 bg-white/80"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time" className="text-indigo-700 font-medium">
                      End Time
                    </Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={currentSlot.endTime || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentSlot({ ...currentSlot, endTime: e.target.value })
                      }
                      className="mt-2 border-indigo-300 focus:border-indigo-500 bg-white/80"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="topic" className="text-indigo-700 font-medium">
                    Topic (Optional)
                  </Label>
                  <Input
                    id="topic"
                    value={currentSlot.topic || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCurrentSlot({ ...currentSlot, topic: e.target.value })
                    }
                    placeholder="e.g., Algebra, Newton's Laws"
                    className="mt-2 border-indigo-300 focus:border-indigo-500 bg-white/80"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={addOrUpdateTimeSlot}
                    className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={
                      !currentSlot.day || !currentSlot.subject || !currentSlot.startTime || !currentSlot.endTime
                    }
                  >
                    {editingSlotIndex !== null ? (
                      <>
                        <Pencil className="h-4 w-4 mr-2" />
                        Update Time Slot
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Time Slot
                      </>
                    )}
                  </Button>
                  {editingSlotIndex !== null && (
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 bg-transparent"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {timeSlots.length > 0 && (
              <Card className="backdrop-blur-sm bg-gradient-to-br from-indigo-50/80 to-white/80 border-indigo-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-100/50 to-indigo-50/50">
                  <CardTitle className="text-indigo-800 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Added Time Slots ({timeSlots.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
                          editingSlotIndex === index
                            ? "bg-indigo-100/70 border-indigo-400 ring-2 ring-indigo-500"
                            : "bg-gradient-to-r from-indigo-50 to-indigo-100/50 border-indigo-200"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 border-indigo-300 text-indigo-700 bg-white/80"
                          >
                            <CalendarDays className="h-3 w-3" />
                            {slot.day}
                          </Badge>
                          <span className="font-medium text-indigo-800">{slot.subject}</span>
                          <span className="text-sm text-indigo-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                          {slot.topic && slot.topic !== "N/A" && (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 border-indigo-300 text-indigo-700 bg-white/80"
                            >
                              <BookOpen className="h-3 w-3" />
                              {slot.topic}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTimeSlot(index)}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTimeSlot(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={timeSlots.length === 0}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Next Step
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <Card className="backdrop-blur-sm bg-gradient-to-br from-indigo-50/80 to-white/80 border-indigo-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-100/50 to-indigo-50/50">
                <CardTitle className="text-indigo-800 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Name Your Routine
                </CardTitle>
                <DialogDescription className="text-indigo-600">Give your routine a memorable name.</DialogDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div>
                  <Label htmlFor="routine-name" className="text-indigo-700 font-medium">
                    Routine Name
                  </Label>
                  <Input
                    id="routine-name"
                    value={routineName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoutineName(e.target.value)}
                    placeholder="e.g., My Fall Semester Schedule"
                    className="mt-2 border-indigo-300 focus:border-indigo-500 bg-white/80"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-100/80 to-indigo-50/80 border-indigo-300 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-indigo-800 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Routine Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                    <span className="font-semibold text-indigo-700">Class:</span>
                    <Badge className="bg-indigo-200 text-indigo-800">Class {selectedClass}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                    <span className="font-semibold text-indigo-700">Total Time Slots:</span>
                    <Badge className="bg-indigo-200 text-indigo-800">{timeSlots.length} slots</Badge>
                  </div>
                  <p className="text-sm text-indigo-600 bg-white/40 p-3 rounded-lg">
                    Review the details before creating your routine.
                  </p>
                </div>
              </CardContent>
            </Card>

            <DialogFooter className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!routineName || loading}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Routine
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
