"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout";
import {
  CustomCard,
  CustomCardContent,
  CustomButton,
  CustomInput,
  CustomSelect,
  CustomModal,
  ConfirmModal,
} from "@/components/ui-custom";
import { useToast } from "@/contexts/toast-context";
import { users, departments, type UserRole } from "@/lib/mock-data";
import { Plus, Trash2, Search, UserPlus } from "lucide-react";

const roleOptions = [
  { value: "colaborador", label: "Colaborador" },
  { value: "aprovador", label: "Aprovador" },
  { value: "admin", label: "Admin" },
];

const departmentOptions = departments.map((d) => ({ value: d.name, label: d.name }));

export function UsersPage() {
  const { addToast } = useToast();
  const [localUsers, setLocalUsers] = useState(users);
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "colaborador" as UserRole,
    department: departments[0].name,
  });

  const filteredUsers = localUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRoleChange = (userId: string, newRole: string) => {
    setLocalUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole as UserRole } : u)),
    );
    addToast({
      title: "Papel atualizado",
      type: "success",
    });
  };

  const handleDepartmentChange = (userId: string, newDepartment: string) => {
    setLocalUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, department: newDepartment } : u)),
    );
    addToast({
      title: "Departamento atualizado",
      type: "success",
    });
  };

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      addToast({
        title: "Erro",
        message: "Preencha todos os campos.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = {
      id: String(localUsers.length + 1),
      ...newUser,
      cargo: "Novo colaborador",
    };

    setLocalUsers((prev) => [...prev, user]);
    setAddModalOpen(false);
    setNewUser({
      name: "",
      email: "",
      role: "colaborador",
      department: departments[0].name,
    });
    setLoading(false);

    addToast({
      title: "Usuário adicionado",
      message: `${user.name} foi adicionado com sucesso.`,
      type: "success",
    });
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    setLocalUsers((prev) => prev.filter((u) => u.id !== userToDelete));
    setDeleteModalOpen(false);
    setUserToDelete(null);
    addToast({
      title: "Usuário excluído",
      type: "info",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Gerenciar Usuários</h1>
            <p className="text-muted-foreground mt-1">
              Adicione, edite ou remova usuários do sistema
            </p>
          </div>
          <CustomButton onClick={() => setAddModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Usuário
          </CustomButton>
        </div>

        {/* Busca */}
        <CustomCard>
          <CustomCardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </CustomCardContent>
        </CustomCard>

        {/* Tabela */}
        <CustomCard>
          <CustomCardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                      Nome
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                      E-mail
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                      Papel
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                      Departamento
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground">
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.cargo}</p>
                        </td>
                        <td className="py-4 px-6 text-foreground">{user.email}</td>
                        <td className="py-4 px-6">
                          <CustomSelect
                            options={roleOptions}
                            value={user.role}
                            onChange={(value) => handleRoleChange(user.id, value)}
                            className="w-36"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <CustomSelect
                            options={departmentOptions}
                            value={user.department}
                            onChange={(value) => handleDepartmentChange(user.id, value)}
                            className="w-36"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                setUserToDelete(user.id);
                                setDeleteModalOpen(true);
                              }}
                              className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                              title="Excluir usuário"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CustomCardContent>
        </CustomCard>
      </div>

      {/* Modal de adicionar usuário */}
      <CustomModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Adicionar Usuário"
        className="max-w-lg"
        footer={
          <>
            <CustomButton variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancelar
            </CustomButton>
            <CustomButton onClick={handleAddUser} loading={loading}>
              Adicionar
            </CustomButton>
          </>
        }
      >
        <div className="space-y-4">
          <CustomInput
            label="Nome completo"
            placeholder="Nome do usuário"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <CustomInput
            label="E-mail"
            type="email"
            placeholder="email@empresa.com"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <CustomSelect
            label="Papel"
            options={roleOptions}
            value={newUser.role}
            onChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
          />
          <CustomSelect
            label="Departamento"
            options={departmentOptions}
            value={newUser.department}
            onChange={(value) => setNewUser({ ...newUser, department: value })}
          />
        </div>
      </CustomModal>

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteUser}
        title="Excluir Usuário"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="destructive"
      />
    </AppLayout>
  );
}
