import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { showError } from "@/utils/toast";
import { EditUserDialog } from "./EditUserDialog";

export type UserData = {
  id: string;
  display_name: string | null;
  email: string | null;
  role: string | null;
  role_id: number | null;
  manager: string | null;
  manager_id: string | null;
};

export type Role = {
  id: number;
  name: string;
};

export type Manager = {
  id: string;
  display_name: string | null;
};

export function UserManager() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select(
        `
        id,
        display_name,
        email,
        manager_id,
        manager:profiles(display_name),
        user_roles(roles(id, name))
      `
      );

    if (profilesError) {
      showError("Error al cargar usuarios.");
      console.error(profilesError);
    } else {
      const formattedUsers = profilesData.map((p: any) => ({
        id: p.id,
        display_name: p.display_name,
        email: p.email,
        role: p.user_roles[0]?.roles?.name || "Sin rol",
        role_id: p.user_roles[0]?.roles?.id || null,
        manager: p.manager?.display_name || "N/A",
        manager_id: p.manager_id,
      }));
      setUsers(formattedUsers);
    }

    const { data: rolesData, error: rolesError } = await supabase
      .from("roles")
      .select("id, name");
    if (rolesError) showError("Error al cargar roles.");
    else setRoles(rolesData || []);

    const { data: managersData, error: managersError } = await supabase
      .from("profiles")
      .select("id, display_name, user_roles!inner(roles!inner(name))")
      .in("user_roles.roles.name", ["Super Administrador", "Manager"]);

    if (managersError) showError("Error al cargar la lista de managers.");
    else setManagers(managersData || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestionar Usuarios</CardTitle>
          <CardDescription>
            Asigna roles y managers a los usuarios de la empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.display_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.role}</Badge>
                    </TableCell>
                    <TableCell>{user.manager}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <EditUserDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={editingUser}
        roles={roles}
        managers={managers}
        onSave={fetchData}
      />
    </>
  );
}