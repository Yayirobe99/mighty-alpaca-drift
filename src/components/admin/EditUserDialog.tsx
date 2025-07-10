import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { showError, showSuccess } from "@/utils/toast";
import type { UserData, Role, Manager } from "./UserManager";

interface EditUserDialogProps {
  user: UserData | null;
  roles: Role[];
  managers: Manager[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: () => void;
}

export function EditUserDialog({
  user,
  roles,
  managers,
  isOpen,
  onOpenChange,
  onSave,
}: EditUserDialogProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedRoleId(user.role_id?.toString() || "");
      setSelectedManagerId(user.manager_id || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    // 1. Update role
    const { error: deleteRoleError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", user.id);

    if (deleteRoleError) {
      showError(`Error al actualizar el rol: ${deleteRoleError.message}`);
      setIsSaving(false);
      return;
    }

    if (selectedRoleId) {
      const { error: insertRoleError } = await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role_id: parseInt(selectedRoleId) });

      if (insertRoleError) {
        showError(`Error al asignar el nuevo rol: ${insertRoleError.message}`);
        setIsSaving(false);
        return;
      }
    }

    // 2. Update manager
    const { error: managerError } = await supabase
      .from("profiles")
      .update({ manager_id: selectedManagerId || null })
      .eq("id", user.id);

    if (managerError) {
      showError(`Error al actualizar el manager: ${managerError.message}`);
      setIsSaving(false);
      return;
    }

    showSuccess("Usuario actualizado con éxito.");
    setIsSaving(false);
    onSave();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifica el rol y el manager para {user?.display_name || user?.email}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="manager">Manager</Label>
            <Select
              value={selectedManagerId}
              onValueChange={setSelectedManagerId}
            >
              <SelectTrigger id="manager">
                <SelectValue placeholder="Selecciona un manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin Manager</SelectItem>
                {managers
                  .filter((manager) => manager.id !== user?.id) // A user cannot be their own manager
                  .map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.display_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}