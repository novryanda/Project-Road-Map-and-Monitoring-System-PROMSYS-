"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSetUserRole, type User } from "@/hooks/use-users";

const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "PROJECTMANAGER", label: "Project Manager" },
  { value: "FINANCE", label: "Finance" },
  { value: "EMPLOYEES", label: "Employees" },
] as const;

interface EditRoleDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRoleDialog({ user, open, onOpenChange }: EditRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const setUserRole = useSetUserRole();

  const handleSave = async () => {
    await setUserRole.mutateAsync({
      userId: user.id,
      role: selectedRole,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>
            Change the role for <span className="font-medium">{user.name}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={setUserRole.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={setUserRole.isPending || selectedRole === user.role}
            >
              {setUserRole.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
