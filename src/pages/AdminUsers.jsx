import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit, Trash2, Search } from "lucide-react";

export default function AdminUsers() {
  // Unlocked: rely on AdminGuard for access
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-xl border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" /> Users Management
              </CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-white text-gray-900 w-56"
                />
                <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                  <Search className="w-4 h-4 mr-2" /> Find
                </Button>
                <Button onClick={() => setEditingUser({ id: "new" })}>
                  <Plus className="w-4 h-4 mr-2" /> Add User
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {filtered.length === 0 ? (
              <div className="text-center text-gray-600 py-10">
                No users yet. Use “Add User” to create real accounts.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((u) => (
                  <div key={u.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900">{u.name}</div>
                      <Badge variant={u.role === "admin" ? "default" : "outline"} className={u.role === "admin" ? "bg-purple-600 text-white" : ""}>
                        {u.role}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">{u.email}</div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingUser(u)}>
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setUsers(users.filter(x => x.id !== u.id))}>
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {editingUser && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">{editingUser.id === "new" ? "Add New User" : "Edit User"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Name"
                    value={editingUser.name || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={editingUser.email || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                  <Input
                    placeholder="Role (admin/user)"
                    value={editingUser.role || "user"}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    onClick={() => {
                      if (editingUser.id === "new") {
                        const id = `u${Date.now()}`;
                        setUsers([...users, { id, name: editingUser.name || "", email: editingUser.email || "", role: editingUser.role || "user" }]);
                      } else {
                        setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
                      }
                      setEditingUser(null);
                    }}
                  >
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Note: This is a local mock UI. Wire to Firebase/Base44 for real user management.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
