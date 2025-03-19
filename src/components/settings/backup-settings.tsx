"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { format } from "date-fns"
import { Download, Upload, Trash2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

type Backup = {
  id: string
  date: string
  size: string
  type: string
}

export function BackupSettings() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)
  const [backupInProgress, setBackupInProgress] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchBackups()
  }, [])

  const fetchBackups = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/backups")

      if (response.data && response.data.backups) {
        setBackups(response.data.backups)
      }
    } catch (error) {
      console.error("Error fetching backups:", error)
      toast({
        title: "Error",
        description: "Failed to load backup history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createBackup = async () => {
    try {
      setBackupInProgress(true)
      setProgress(0)

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 10
          if (newProgress >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return newProgress
        })
      }, 500)

      const response = await axios.post("/api/backups")

      clearInterval(progressInterval)
      setProgress(100)

      toast({
        title: "Backup created",
        description: "Your data has been backed up successfully",
      })

      // Add the new backup to the list
      if (response.data && response.data.backup) {
        setBackups((prev) => [response.data.backup, ...prev])
      }
    } catch (error) {
      console.error("Error creating backup:", error)
      toast({
        title: "Error",
        description: "Failed to create backup",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => {
        setBackupInProgress(false)
        setProgress(0)
      }, 1000)
    }
  }

  const downloadBackup = async (id: string) => {
    try {
      const response = await axios.get(`/api/backups/${id}/download`, {
        responseType: "blob",
      })

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `backup-${id}.zip`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast({
        title: "Backup downloaded",
        description: "Your backup file has been downloaded",
      })
    } catch (error) {
      console.error("Error downloading backup:", error)
      toast({
        title: "Error",
        description: "Failed to download backup",
        variant: "destructive",
      })
    }
  }

  const deleteBackup = async (id: string) => {
    if (!confirm("Are you sure you want to delete this backup?")) return

    try {
      await axios.delete(`/api/backups/${id}`)

      toast({
        title: "Backup deleted",
        description: "The backup has been deleted successfully",
      })

      // Remove the deleted backup from the list
      setBackups((prev) => prev.filter((backup) => backup.id !== id))
    } catch (error) {
      console.error("Error deleting backup:", error)
      toast({
        title: "Error",
        description: "Failed to delete backup",
        variant: "destructive",
      })
    }
  }

  const restoreBackup = async (id: string) => {
    if (!confirm("Are you sure you want to restore this backup? This will replace your current data.")) return

    try {
      setBackupInProgress(true)
      setProgress(0)

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5
          if (newProgress >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return newProgress
        })
      }, 300)

      await axios.post(`/api/backups/${id}/restore`)

      clearInterval(progressInterval)
      setProgress(100)

      toast({
        title: "Backup restored",
        description: "Your data has been restored successfully",
      })
    } catch (error) {
      console.error("Error restoring backup:", error)
      toast({
        title: "Error",
        description: "Failed to restore backup",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => {
        setBackupInProgress(false)
        setProgress(0)
      }, 1000)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Backup</CardTitle>
          <CardDescription>Create a backup of your current data</CardDescription>
        </CardHeader>
        <CardContent>
          {backupInProgress ? (
            <div className="space-y-2">
              <p className="text-sm">Backup in progress...</p>
              <Progress value={progress} className="w-full" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Backups include all your inventory, sales, and system settings data.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={createBackup} disabled={backupInProgress}>
            Create Backup
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>View and manage your previous backups</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Loading backup history...</div>
          ) : backups.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No backups found. Create your first backup to protect your data.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell>{format(new Date(backup.date), "PPP p")}</TableCell>
                    <TableCell>{backup.type}</TableCell>
                    <TableCell>{backup.size}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => downloadBackup(backup.id)}
                          disabled={backupInProgress}
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => restoreBackup(backup.id)}
                          disabled={backupInProgress}
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span className="sr-only">Restore</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteBackup(backup.id)}
                          disabled={backupInProgress}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import Backup</CardTitle>
          <CardDescription>Import a backup file</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="backup-file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">ZIP files only</p>
              </div>
              <input id="backup-file" type="file" className="hidden" accept=".zip" />
            </label>
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled={backupInProgress}>Import Backup</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

