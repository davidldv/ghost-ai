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
      <DialogContent className="max-w-[460px] border-border-default/80 bg-bg-surface/95">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-brand/10 to-transparent" />
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>
            Enter a new name for "{currentName}".
          </DialogDescription>
        </DialogHeader>

        <form
          className="mt-2 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (canSubmit) onSubmit()
          }}
        >
          <Input
            autoFocus
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="h-12 rounded-xl border border-border-default bg-base px-4 text-copy-primary placeholder:text-faint focus-visible:border-brand focus-visible:ring-1 focus-visible:ring-brand"
          />
          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="ghost"
              className="h-11 rounded-xl border border-transparent px-6 font-medium text-copy-primary hover:border-border-default/70 hover:bg-subtle"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!canSubmit}
              className="h-11 rounded-xl bg-brand px-6 font-medium text-bg-base shadow-lg shadow-brand/25 transition-opacity hover:opacity-90"
            >
              {loading ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
