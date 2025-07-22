"use client"

import type React from "react"

import { useState, createContext, useContext, type ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LogOut } from "lucide-react"
import { LucideUser } from "lucide-react"

interface AuthUser {
  id: string
  username: string
  role: "admin" | "staff"
  name: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

// Mock users - in production, this would come from your backend
const mockUsers: (AuthUser & { password: string })[] = [
  { id: "1", username: "admin", password: "admin123", role: "admin", name: "Admin User" },
  { id: "2", username: "staff", password: "staff123", role: "staff", name: "Staff User" },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  const login = (username: string, password: string): boolean => {
    const foundUser = mockUsers.find((u) => u.username === username && u.password === password)
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = login(username, password)
    if (!success) {
      setError("Invalid username or password")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to Inventory System</CardTitle>
          <CardDescription>Enter your credentials to access the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          <div className="mt-4 text-sm text-gray-600">
            <p>
              <strong>Demo Accounts:</strong>
            </p>
            <p>Admin: admin / admin123</p>
            <p>Staff: staff / staff123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function UserHeader() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center space-x-3">
        <LucideUser className="h-8 w-8 text-gray-600" />
        <div>
          <p className="font-medium">{user.name}</p>
          <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role.toUpperCase()}</Badge>
        </div>
      </div>
      <Button variant="outline" onClick={logout}>
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  )
}
