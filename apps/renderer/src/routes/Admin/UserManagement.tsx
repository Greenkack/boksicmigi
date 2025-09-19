import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { formatGermanNumber } from '../../utils/germanFormat';

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'user' | 'viewer'
  status: 'active' | 'inactive' | 'pending'
  lastLogin: string
  createdAt: string
  permissions: string[]
  avatar?: string
}

interface Role {
  id: string
  name: string
  displayName: string
  description: string
  permissions: string[]
  userCount: number
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Max Mustermann',
    email: 'max.mustermann@company.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-03-15 14:30:00',
    createdAt: '2024-01-15 10:00:00',
    permissions: ['all'],
    avatar: '👤'
  },
  {
    id: '2',
    name: 'Anna Schmidt',
    email: 'anna.schmidt@company.com',
    role: 'manager',
    status: 'active',
    lastLogin: '2024-03-15 11:20:00',
    createdAt: '2024-01-20 14:30:00',
    permissions: ['projects_manage', 'customers_manage', 'offers_create'],
    avatar: '👩'
  },
  {
    id: '3',
    name: 'Thomas Weber',
    email: 'thomas.weber@company.com',
    role: 'user',
    status: 'active',
    lastLogin: '2024-03-14 16:45:00',
    createdAt: '2024-02-01 09:15:00',
    permissions: ['projects_view', 'customers_view', 'offers_create'],
    avatar: '👨'
  },
  {
    id: '4',
    name: 'Lisa Müller',
    email: 'lisa.mueller@company.com',
    role: 'user',
    status: 'inactive',
    lastLogin: '2024-03-10 13:00:00',
    createdAt: '2024-02-10 11:30:00',
    permissions: ['projects_view', 'customers_view'],
    avatar: '👩‍💼'
  },
  {
    id: '5',
    name: 'Peter Klein',
    email: 'peter.klein@company.com',
    role: 'viewer',
    status: 'pending',
    lastLogin: '',
    createdAt: '2024-03-14 16:00:00',
    permissions: ['projects_view'],
    avatar: '👔'
  }
];

const mockRoles: Role[] = [
  {
    id: 'admin',
    name: 'admin',
    displayName: 'Administrator',
    description: 'Vollzugriff auf alle Funktionen und Einstellungen',
    permissions: ['all'],
    userCount: 1
  },
  {
    id: 'manager',
    name: 'manager',
    displayName: 'Manager',
    description: 'Verwaltung von Projekten, Kunden und Angeboten',
    permissions: ['projects_manage', 'customers_manage', 'offers_create', 'reports_view'],
    userCount: 1
  },
  {
    id: 'user',
    name: 'user',
    displayName: 'Benutzer',
    description: 'Standard-Benutzer mit eingeschränkten Rechten',
    permissions: ['projects_view', 'customers_view', 'offers_create'],
    userCount: 2
  },
  {
    id: 'viewer',
    name: 'viewer',
    displayName: 'Betrachter',
    description: 'Nur Lesezugriff auf ausgewählte Bereiche',
    permissions: ['projects_view'],
    userCount: 1
  }
];

const statusOptions = [
  { label: 'Alle Status', value: '' },
  { label: 'Aktiv', value: 'active' },
  { label: 'Inaktiv', value: 'inactive' },
  { label: 'Ausstehend', value: 'pending' }
];

const roleOptions = [
  { label: 'Alle Rollen', value: '' },
  { label: 'Administrator', value: 'admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Benutzer', value: 'user' },
  { label: 'Betrachter', value: 'viewer' }
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const toast = useRef<Toast>(null);

  const filteredUsers = users.filter(user => {
    const matchesGlobal = user.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
                         user.email.toLowerCase().includes(globalFilter.toLowerCase());
    const matchesStatus = !statusFilter || user.status === statusFilter;
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesGlobal && matchesStatus && matchesRole;
  });

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    pending: users.filter(u => u.status === 'pending').length
  };

  const showSuccessToast = (message: string) => {
    toast.current?.show({
      severity: 'success',
      summary: 'Erfolgreich',
      detail: message,
      life: 3000
    });
  };

  const showErrorToast = (message: string) => {
    toast.current?.show({
      severity: 'error',
      summary: 'Fehler',
      detail: message,
      life: 4000
    });
  };

  const createUser = () => {
    setEditingUser(null);
    setShowUserDialog(true);
  };

  const editUser = (user: User) => {
    setEditingUser(user);
    setShowUserDialog(true);
  };

  const deleteUser = (user: User) => {
    confirmDialog({
      message: `Möchten Sie den Benutzer "${user.name}" wirklich löschen?`,
      header: 'Benutzer löschen',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        showSuccessToast(`Benutzer "${user.name}" wurde gelöscht`);
      }
    });
  };

  const toggleUserStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setUsers(prev => prev.map(u => 
      u.id === user.id ? { ...u, status: newStatus } : u
    ));
    showSuccessToast(`Benutzer-Status auf "${newStatus}" geändert`);
  };

  // Template Functions for DataTable
  const userTemplate = (rowData: User) => (
    <div className="flex items-center gap-3">
      <Avatar label={rowData.avatar} size="normal" className="bg-blue-100 text-blue-600" />
      <div>
        <div className="font-medium text-gray-900">{rowData.name}</div>
        <div className="text-sm text-gray-500">{rowData.email}</div>
      </div>
    </div>
  );

  const roleTemplate = (rowData: User) => {
    const roleColors: Record<string, "success" | "info" | "secondary" | "contrast" | "danger" | "warning"> = {
      admin: 'danger',
      manager: 'warning',
      user: 'info',
      viewer: 'secondary'
    };
    return (
      <Tag 
        value={roles.find(r => r.name === rowData.role)?.displayName || rowData.role}
        severity={roleColors[rowData.role] || 'secondary'}
        rounded
      />
    );
  };

  const statusTemplate = (rowData: User) => {
    const statusColors: Record<string, "success" | "info" | "secondary" | "contrast" | "danger" | "warning"> = {
      active: 'success',
      inactive: 'danger',
      pending: 'warning'
    };
    const statusLabels = {
      active: 'Aktiv',
      inactive: 'Inaktiv',
      pending: 'Ausstehend'
    };
    return (
      <Tag 
        value={statusLabels[rowData.status]}
        severity={statusColors[rowData.status]}
        rounded
      />
    );
  };

  const lastLoginTemplate = (rowData: User) => (
    <div className="text-sm">
      {rowData.lastLogin ? (
        <span className="text-gray-700">
          {new Date(rowData.lastLogin).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      ) : (
        <span className="text-gray-400 italic">Nie angemeldet</span>
      )}
    </div>
  );

  const actionsTemplate = (rowData: User) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        onClick={() => editUser(rowData)}
        className="p-button-text p-button-sm"
        tooltip="Bearbeiten"
        tooltipOptions={{position: 'top'}}
      />
      <Button
        icon={rowData.status === 'active' ? 'pi pi-pause' : 'pi pi-play'}
        onClick={() => toggleUserStatus(rowData)}
        className={`p-button-text p-button-sm ${
          rowData.status === 'active' ? 'p-button-warning' : 'p-button-success'
        }`}
        tooltip={rowData.status === 'active' ? 'Deaktivieren' : 'Aktivieren'}
        tooltipOptions={{position: 'top'}}
      />
      <Button
        icon="pi pi-trash"
        onClick={() => deleteUser(rowData)}
        className="p-button-text p-button-danger p-button-sm"
        tooltip="Löschen"
        tooltipOptions={{position: 'top'}}
      />
    </div>
  );

  return (
    <div className="space-y-6 max-w-8xl mx-auto p-4">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      {/* Hero Header */}
      <Card className="shadow-xl border-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-full">
                <i className="pi pi-users text-3xl"></i>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 text-purple-100">
                  <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
                  <i className="pi pi-chevron-right text-sm"></i>
                  <span>Benutzerverwaltung</span>
                </div>
                <h1 className="text-3xl font-bold mb-2">Benutzerverwaltung</h1>
                <p className="text-purple-100 text-lg">Verwalten Sie Benutzer, Rollen und Berechtigungen</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{userStats.total}</div>
              <div className="text-sm text-purple-200">Benutzer</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="shadow-md border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <div className="p-4 flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <i className="pi pi-users text-blue-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{userStats.total}</div>
              <div className="text-sm text-gray-600">Gesamt</div>
            </div>
          </div>
        </Card>

        <Card className="shadow-md border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <div className="p-4 flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full">
              <i className="pi pi-check-circle text-green-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{userStats.active}</div>
              <div className="text-sm text-gray-600">Aktiv</div>
            </div>
          </div>
        </Card>

        <Card className="shadow-md border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <div className="p-4 flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-full">
              <i className="pi pi-times-circle text-red-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{userStats.inactive}</div>
              <div className="text-sm text-gray-600">Inaktiv</div>
            </div>
          </div>
        </Card>

        <Card className="shadow-md border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <div className="p-4 flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <i className="pi pi-clock text-orange-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{userStats.pending}</div>
              <div className="text-sm text-gray-600">Ausstehend</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        {/* Users Tab */}
        <TabPanel header="Benutzer" leftIcon="pi pi-users">
          <Card className="shadow-lg border-0">
            {/* Toolbar */}
            <div className="p-4 border-b">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                      placeholder="Benutzer suchen..."
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      className="w-64"
                    />
                  </span>
                  
                  <Dropdown
                    value={statusFilter}
                    options={statusOptions}
                    onChange={(e) => setStatusFilter(e.value)}
                    placeholder="Status filtern"
                    className="w-40"
                    showClear
                  />
                  
                  <Dropdown
                    value={roleFilter}
                    options={roleOptions}
                    onChange={(e) => setRoleFilter(e.value)}
                    placeholder="Rolle filtern"
                    className="w-40"
                    showClear
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    label="Neuer Benutzer"
                    icon="pi pi-plus"
                    onClick={createUser}
                    className="p-button-success"
                    raised
                  />
                  <Button
                    label="Export"
                    icon="pi pi-download"
                    className="p-button-secondary"
                    outlined
                  />
                </div>
              </div>
            </div>

            {/* Data Table */}
            <DataTable
              value={filteredUsers}
              selection={selectedUsers}
              onSelectionChange={(e) => setSelectedUsers(e.value as User[])}
              selectionMode="multiple"
              dataKey="id"
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              className="p-datatable-gridlines"
              globalFilter={globalFilter}
              emptyMessage="Keine Benutzer gefunden"
            >
              <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
              <Column field="name" header="Benutzer" body={userTemplate} sortable></Column>
              <Column field="role" header="Rolle" body={roleTemplate} sortable></Column>
              <Column field="status" header="Status" body={statusTemplate} sortable></Column>
              <Column field="lastLogin" header="Letzte Anmeldung" body={lastLoginTemplate} sortable></Column>
              <Column field="createdAt" header="Erstellt" sortable body={(rowData) => 
                new Date(rowData.createdAt).toLocaleDateString('de-DE')
              }></Column>
              <Column body={actionsTemplate} header="Aktionen" style={{ width: '12rem' }}></Column>
            </DataTable>
          </Card>
        </TabPanel>

        {/* Roles Tab */}
        <TabPanel header="Rollen" leftIcon="pi pi-shield">
          <Card className="shadow-lg border-0">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Rollenverwaltung</h3>
              <Button
                label="Neue Rolle"
                icon="pi pi-plus"
                onClick={() => setShowRoleDialog(true)}
                className="p-button-success"
                raised
              />
            </div>
            
            <div className="p-4">
              <div className="grid md:grid-cols-2 gap-6">
                {roles.map(role => (
                  <Card key={role.id} className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-indigo-500">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-100 p-2 rounded-lg">
                            <i className="pi pi-shield text-indigo-600"></i>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{role.displayName}</h4>
                            <p className="text-sm text-gray-600">{role.description}</p>
                          </div>
                        </div>
                        <Badge value={role.userCount} severity="secondary" />
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Berechtigungen:</h5>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map(permission => (
                            <Tag key={permission} value={permission} severity="info" />
                          ))}
                          {role.permissions.length > 3 && (
                            <Tag value={`+${role.permissions.length - 3} weitere`} severity="secondary" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button
                          icon="pi pi-pencil"
                          className="p-button-text p-button-sm"
                          tooltip="Bearbeiten"
                          tooltipOptions={{position: 'top'}}
                        />
                        <Button
                          icon="pi pi-trash"
                          className="p-button-text p-button-danger p-button-sm"
                          tooltip="Löschen"
                          tooltipOptions={{position: 'top'}}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </TabPanel>
      </TabView>

      {/* User Dialog */}
      <Dialog
        header={editingUser ? 'Benutzer bearbeiten' : 'Neuer Benutzer'}
        visible={showUserDialog}
        onHide={() => setShowUserDialog(false)}
        style={{ width: '600px' }}
        modal
      >
        <div className="space-y-4 p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <InputText
                placeholder="Vollständiger Name"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">E-Mail *</label>
              <InputText
                placeholder="email@example.com"
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rolle *</label>
              <Dropdown
                options={roleOptions.filter(r => r.value)}
                placeholder="Rolle auswählen"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status *</label>
              <Dropdown
                options={statusOptions.filter(s => s.value)}
                placeholder="Status auswählen"
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              label="Abbrechen"
              onClick={() => setShowUserDialog(false)}
              className="p-button-secondary"
              outlined
            />
            <Button
              label={editingUser ? 'Speichern' : 'Erstellen'}
              icon="pi pi-save"
              onClick={() => {
                setShowUserDialog(false);
                showSuccessToast(editingUser ? 'Benutzer aktualisiert' : 'Benutzer erstellt');
              }}
              className="p-button-success"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}