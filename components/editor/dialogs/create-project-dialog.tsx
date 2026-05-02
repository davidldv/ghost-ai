"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  slugPreview: string
  loading: boolean
  onNameChange: (value: string) => void
  onSubmit: () => void
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  name,
  slugPreview,
  loading,
  onNameChange,
  onSubmit,
}: CreateProjectDialogProps) {
  const canSubmit = name.trim().length > 0 && !loading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>
            Enter a project name to create a new room.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4 mt-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (canSubmit) onSubmit()
          }}
        >
          <Input
            autoFocus
            placeholder="Realtime architecture map"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="h-12 bg-base border border-border-default focus-visible:border-brand focus-visible:ring-1 focus-visible:ring-brand text-copy-primary placeholder:text-faint rounded-xl px-4"
          />
          <div className="flex items-center h-12 px-4 rounded-xl bg-base border border-transparent text-sm font-mono">
            <span className="text-faint">/editor/</span>
            <span className="text-copy-muted">{slugPreview || "untitled-project-xS33AI"}</span>
          </div>
          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl h-11 px-6 font-medium text-copy-primary hover:bg-subtle"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!canSubmit}
              className="rounded-xl h-11 px-6 font-medium bg-brand text-base hover:opacity-90 transition-opacity"
            >
              {loading ? "Creating…" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
