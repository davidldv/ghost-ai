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

interface DeleteProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectName: string
  loading: boolean
  onConfirm: () => void
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  projectName,
  loading,
  onConfirm,
}: DeleteProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] border-border-default/80 bg-bg-surface/95">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-state-error/20 to-transparent" />
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{projectName}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
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
            type="button"
            variant="destructive"
            className="h-11 rounded-xl border border-state-error/30 bg-state-error/10 px-6 font-medium text-state-error transition-colors hover:bg-state-error/20"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
