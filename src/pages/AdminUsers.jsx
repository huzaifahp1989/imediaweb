import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Edit, Trash2, Search, User, Save, X, Star, Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
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

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "user",
    points: 0,
    age: "",
    city: "",
    avatar: "🌟",
    country: ""
  });

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 1000),
    initialData: [],
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      setShowEditDialog(false);
      setEditingUser(null);
      alert('User updated successfully!');
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      alert('Failed to update user. Please try again.');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) => base44.entities.User.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      alert('User deleted successfully!');
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
      alert('Failed to delete user. Please try again.');
    }
  });

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || "",
      email: user.email || "",
      role: user.role || "user",
      points: user.points || 0,
      age: user.age || "",
      city: user.city || "",
      avatar: user.avatar || "🌟",
      country: user.country || ""
    });
    setShowEditDialog(true);
  };

  const handleSave = () => {
    if (!editingUser) return;

    updateUserMutation.mutate({
      id: editingUser.id,
      data: formData
    });
  };

  const handleDelete = (user) => {
    if (confirm(`Are you sure you want to delete ${user.full_name || user.email}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setShowEditDialog(false);
    setFormData({
      full_name: "",
      email: "",
      role: "user",
      points: 0,
      age: "",
      city: "",
      avatar: "🌟",
      country: ""
    });
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.city && user.city.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = filterRole === "all" || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const avatars = ["🌟", "🌙", "⭐", "🎨", "🎮", "📚", "🚀", "🦁", "🐱", "🐼", "🦊", "🐰"];

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">👥</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            User Management
          </h1>
          <p className="text-lg text-gray-600">
            View and manage all registered users
          </p>
        </motion.div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name, email, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-sm text-gray-600">Admins</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {users.filter(u => u.onboarding_completed).length}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-pulse" />
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No users found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-3xl flex-shrink-0">
                        {user.avatar || "👤"}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-gray-900 truncate">
                            {user.full_name || "No Name"}
                          </h3>
                          {user.role === "admin" && (
                            <Badge className="bg-red-500">Admin</Badge>
                          )}
                          {user.id === currentUser?.id && (
                            <Badge className="bg-blue-500">You</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 truncate mb-2">
                          {user.email || "No email"}
                        </p>

                        <div className="flex flex-wrap gap-2 text-xs">
                          {user.city && (
                            <Badge variant="outline">📍 {user.city}</Badge>
                          )}
                          {user.age && (
                            <Badge variant="outline">🎂 {user.age} years</Badge>
                          )}
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {user.points || 0} pts
                          </Badge>
                          {user.referral_count > 0 && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              👥 {user.referral_count} referrals
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>Joined: {new Date(user.created_date).toLocaleDateString()}</span>
                          {!user.onboarding_completed && (
                            <Badge className="bg-orange-500 text-xs">Not Completed</Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          onClick={() => handleEdit(user)}
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(user)}
                          size="sm"
                          variant="outline"
                          className="text-red-500 border-red-300 hover:bg-red-50"
                          disabled={user.id === currentUser?.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User: {editingUser?.full_name || editingUser?.email}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Age"
                  />
                </div>

                <div>
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                    placeholder="Points"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Avatar</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar })}
                      className={`text-4xl p-2 rounded-lg transition-all hover:scale-110 ${
                        formData.avatar === avatar
                          ? "bg-blue-500 ring-4 ring-blue-300 scale-110"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={updateUserMutation.isPending}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}