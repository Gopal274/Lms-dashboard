import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { 
  Users, 
  Loader2, 
  Search, 
  Shield, 
  UserPlus, 
  Mail, 
  Trash2,
  CheckCircle2,
  Clock
} from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/user/get-users");
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      const { data } = await api.put("/user/update-user", { id: userId, role });
      if (data.success) {
        fetchUsers();
      }
    } catch (error) {
      alert("Failed to update role");
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await api.delete(`/delete-user/${userId}`);
        fetchUsers();
      } catch (error) {
        alert("Failed to delete user");
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">User Management</h1>
          <p className="text-gray-500">Monitor activity, assign roles, and manage permissions for all users.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-10 w-64 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="flex h-10 rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 
                    user.role === 'teacher' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{user.name}</h3>
                      <Badge variant={user.role === 'admin' ? 'default' : user.role === 'teacher' ? 'secondary' : 'outline'} className="capitalize">
                        {user.role}
                      </Badge>
                      {user.isVerified && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 gap-4 mt-1">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {user.email}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1 mr-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase text-center">Assign Role</span>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant={user.role === 'student' ? 'default' : 'outline'} 
                        className="h-7 text-[10px] px-2"
                        onClick={() => updateUserRole(user._id, 'student')}
                        disabled={user.role === 'student'}
                      >
                        Student
                      </Button>
                      <Button 
                        size="sm" 
                        variant={user.role === 'teacher' ? 'default' : 'outline'} 
                        className="h-7 text-[10px] px-2"
                        onClick={() => updateUserRole(user._id, 'teacher')}
                        disabled={user.role === 'teacher'}
                      >
                        Teacher
                      </Button>
                      <Button 
                        size="sm" 
                        variant={user.role === 'admin' ? 'default' : 'outline'} 
                        className="h-7 text-[10px] px-2"
                        onClick={() => updateUserRole(user._id, 'admin')}
                        disabled={user.role === 'admin'}
                      >
                        Admin
                      </Button>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => deleteUser(user._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed">
            <Users className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
