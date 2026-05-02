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

interface RenameProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentName: string
  name: string
  loading: boolean
  onNameChange: (value: string) => void
  onSubmit: () => void
}

export function RenameProjectDialog({
  open,
  onOpenChange,
  currentName,
  name,
  loading,
  onNameChange,
  onSubmit,
}: RenameProjectDialogProps) {
  const canSubmit = name.trim().length > 0 && name.trim() !== currentName && !loading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>
            Enter a new name for "{currentName}".
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
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="h-12 bg-base border border-border-default focus-visible:border-brand focus-visible:ring-1 focus-visible:ring-brand text-copy-primary placeholder:text-faint rounded-xl px-4"
          />
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
              className="rounded-xl h-11 px-6 font-medium border-0 shadow-none bg-brand text-base hover:opacity-90 transition-opacity"
            >
              {loading ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
