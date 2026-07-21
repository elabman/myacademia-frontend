import {
  ArrowLeft,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  createUser,
  deleteUser,
  listDepartments,
  listRoles,
  listUsers,
  updateUser,
} from '../services/registryService'
import { theme } from '../theme'
import { staticOptions, toOptions } from '../utils/registryOptions'

const columns = [
  { key: 'full_name', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'role_name', label: 'Role' },
  { key: 'department_name', label: 'Department' },
  { key: 'is_active', label: 'Active' },
]

const fallbackRoleOptions = staticOptions([
  'System Admin',
  'Admin',
  'Coordinator',
  'Staff',
  'User',
]).map((option, index) => ({ ...option, value: index + 1 }))

function UsersPage() {
  const { auth } = useAuth()
  const [departments, setDepartments] = useState([])
  const [deletingId, setDeletingId] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [roles, setRoles] = useState(fallbackRoleOptions)
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState([])

  const loadUsers = useCallback(async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      const [userRows, departmentRows, roleRows] = await Promise.all([
        listUsers(auth.accessToken, { limit: 100, page: 1 }),
        listDepartments(auth.accessToken).catch(() => []),
        listRoles(auth.accessToken).catch(() => []),
      ])

      setUsers(userRows)
      setDepartments(
        toOptions(
          departmentRows,
          ['department_name', 'name'],
          ['department_id', 'id', 'value'],
        ),
      )
      setRoles(
        toOptions(roleRows, ['role_name', 'name'], ['role_id', 'id', 'value'])
          .length
          ? toOptions(roleRows, ['role_name', 'name'], ['role_id', 'id', 'value'])
          : fallbackRoleOptions,
      )
    } catch (error) {
      setErrorMessage(error.message)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [auth.accessToken])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadUsers, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadUsers])

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return users
    }

    return users.filter((user) =>
      columns.some(({ key }) =>
        String(readValue(user, key)).toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [users, searchTerm])

  const openCreateForm = () => {
    setEditingUser(null)
    setIsFormOpen(true)
  }

  const openEditForm = (user) => {
    setEditingUser(user)
    setIsFormOpen(true)
  }

  const handleSubmit = async (values) => {
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      if (editingUser) {
        await updateUser(auth.accessToken, userId(editingUser), toUserPayload(values))
      } else {
        await createUser(auth.accessToken, toUserPayload(values, true))
      }

      setIsFormOpen(false)
      setEditingUser(null)
      await loadUsers()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete "${user.full_name || user.email}"?`)) {
      return
    }

    const id = userId(user)
    setErrorMessage('')
    setDeletingId(id)

    try {
      await deleteUser(auth.accessToken, id)
      setUsers((currentUsers) =>
        currentUsers.filter((item) => String(userId(item)) !== String(id)),
      )
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={`text-lg font-bold ${theme.classes.heading}`}>
            Users
          </h2>
          <p className={`mt-1 text-xs font-semibold uppercase ${theme.classes.subtle}`}>
            Users & Access
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
            to="/dashboard/admin"
          >
            <ArrowLeft size={16} />
            Back to Admin
          </Link>
          <button
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg transition hover:brightness-105 ${theme.classes.primaryButton}`}
            onClick={openCreateForm}
            type="button"
          >
            <UserPlus size={17} />
            Add User
          </button>
        </div>
      </div>

      {errorMessage && (
        <section
          className={`rounded-2xl border p-4 text-sm ${theme.classes.errorBox}`}
        >
          {errorMessage}
        </section>
      )}

      <section
        className={`border-t-4 ${theme.classes.tableAccent} ${theme.classes.dashboardSurface}`}
      >
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.classes.icon}`}
              size={17}
            />
            <input
              className={`w-full border px-10 py-2 text-sm transition focus:outline-none focus:ring-2 ${theme.classes.tableSearch}`}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search users"
              value={searchTerm}
            />
          </div>

          <button
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
            onClick={loadUsers}
            type="button"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className={theme.classes.tableHeader}>
              <tr>
                <th className={`whitespace-nowrap px-3 py-3 text-xs font-semibold ${theme.classes.label}`}>
                  Actions
                </th>
                {columns.map(({ key, label }) => (
                  <th
                    className={`whitespace-nowrap px-3 py-3 text-xs font-semibold ${theme.classes.label}`}
                    key={key}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <TableMessage colSpan={columns.length + 1} message="Loading users..." />
              )}

              {!isLoading && filteredUsers.length === 0 && (
                <TableMessage
                  colSpan={columns.length + 1}
                  message="No users were returned by the API."
                />
              )}

              {!isLoading &&
                filteredUsers.map((user) => (
                  <tr
                    className={`align-top transition ${theme.classes.tableRowHover}`}
                    key={userId(user)}
                  >
                    <td className={`border-b px-3 py-3 ${theme.classes.tableRowDivider}`}>
                      <div className="flex items-center gap-1.5">
                        <button
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${theme.classes.tableToolbarButton}`}
                          onClick={() => openEditForm(user)}
                          title="Edit user"
                          type="button"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-60 ${theme.classes.dangerButton}`}
                          disabled={String(deletingId) === String(userId(user))}
                          onClick={() => handleDelete(user)}
                          title="Delete user"
                          type="button"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                    {columns.map(({ key }) => (
                      <td
                        className={`border-b px-3 py-3 ${theme.classes.tableRowDivider} ${theme.classes.bodyText}`}
                        key={key}
                      >
                        {formatCell(readValue(user, key))}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className={`border-t px-4 py-3 text-sm ${theme.classes.tableDivider}`}>
          <p className={theme.classes.muted}>
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>
      </section>

      {isFormOpen && (
        <UserFormModal
          departments={departments}
          isSubmitting={isSubmitting}
          onClose={() => {
            setIsFormOpen(false)
            setEditingUser(null)
          }}
          onSubmit={handleSubmit}
          roles={roles}
          user={editingUser}
        />
      )}
    </section>
  )
}

function UserFormModal({
  departments,
  isSubmitting,
  onClose,
  onSubmit,
  roles,
  user,
}) {
  const isEditing = Boolean(user)
  const initialDepartment = valueFromLabel(
    departments,
    user?.department_id || user?.department_name,
  )
  const initialRole = valueFromLabel(roles, user?.role_id || user?.role_name)

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(Object.fromEntries(new FormData(event.currentTarget).entries()))
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${theme.classes.modalOverlay}`}
    >
      <section
        className={`w-full max-w-3xl overflow-hidden rounded-2xl border ${theme.classes.modalPanel}`}
      >
        <div
          className={`flex items-center justify-between border-b p-5 ${theme.classes.tableDivider}`}
        >
          <div>
            <h2 className={`text-lg font-bold ${theme.classes.heading}`}>
              {isEditing ? 'Edit User' : 'Add User'}
            </h2>
            <p className={`mt-1 text-sm ${theme.classes.muted}`}>
              {isEditing
                ? 'Update account details and access.'
                : 'Create a new MyAcademia account.'}
            </p>
          </div>
          <button
            type="button"
            className={`rounded-xl p-2 transition ${theme.classes.icon} ${theme.classes.iconHover}`}
            onClick={onClose}
            aria-label="Close user form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            <TextField
              defaultValue={user?.full_name}
              label="Full Name"
              name="full_name"
              required
            />
            <TextField
              defaultValue={user?.email}
              label="Email"
              name="email"
              required
              type="email"
            />
            <TextField
              defaultValue={user?.phone}
              label="Phone"
              name="phone"
            />
            <TextField
              label={isEditing ? 'New Password' : 'Password'}
              name="password"
              required={!isEditing}
              type="password"
            />
            <SelectField
              defaultValue={initialRole}
              label="Role"
              name="role_id"
              options={roles}
              required
            />
            <SelectField
              defaultValue={initialDepartment}
              label="Department"
              name="department_id"
              options={departments}
              required
            />
            <SelectField
              defaultValue={String(user?.is_active ?? true)}
              label="Account Status"
              name="is_active"
              options={[
                { label: 'Active', value: 'true' },
                { label: 'Inactive', value: 'false' },
              ]}
            />
          </div>

          <div
            className={`flex flex-col gap-3 border-t p-5 sm:flex-row sm:items-center sm:justify-end ${theme.classes.tableDivider}`}
          >
            <button
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className={`rounded-xl px-5 py-2 text-sm font-semibold shadow-lg transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 ${theme.classes.primaryButton}`}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function TextField({
  defaultValue = '',
  label,
  name,
  required = false,
  type = 'text',
}) {
  return (
    <label className="grid gap-1.5">
      <span className={`text-xs font-semibold ${theme.classes.subtle}`}>
        {label}
      </span>
      <input
        className={`w-full border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${theme.classes.formControl}`}
        defaultValue={defaultValue || ''}
        name={name}
        required={required}
        type={type}
      />
    </label>
  )
}

function SelectField({
  defaultValue = '',
  label,
  name,
  options,
  required = false,
}) {
  return (
    <label className="grid gap-1.5">
      <span className={`text-xs font-semibold ${theme.classes.subtle}`}>
        {label}
      </span>
      <select
        className={`w-full border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${theme.classes.formControl}`}
        defaultValue={defaultValue || ''}
        name={name}
        required={required}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function TableMessage({ colSpan, message }) {
  return (
    <tr>
      <td
        className={`border-b px-3 py-8 text-center ${theme.classes.tableRowDivider} ${theme.classes.muted}`}
        colSpan={colSpan}
      >
        {message}
      </td>
    </tr>
  )
}

function toUserPayload(values, isCreate = false) {
  return removeBlank({
    department_id: numberOrValue(values.department_id),
    email: values.email,
    full_name: values.full_name,
    is_active: values.is_active === 'true',
    password: values.password,
    phone: values.phone,
    role_id: numberOrValue(values.role_id),
    ...(isCreate ? {} : { password: values.password || undefined }),
  })
}

function valueFromLabel(options = [], value) {
  if (!value) {
    return ''
  }

  const matchingOption = options.find(
    (option) =>
      String(option.value) === String(value) || String(option.label) === String(value),
  )

  return matchingOption?.value || value
}

function readValue(row, key) {
  return key.split('.').reduce((value, part) => value?.[part], row)
}

function formatCell(value) {
  if (value === undefined || value === null || value === '') {
    return '-'
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  return value
}

function userId(user) {
  return user.id ?? user.user_id
}

function numberOrValue(value) {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  const numericValue = Number(value)
  return Number.isNaN(numericValue) ? value : numericValue
}

function removeBlank(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  )
}

export default UsersPage
