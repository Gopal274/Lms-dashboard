import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { 
  Plus, 
  Layers, 
  Loader2, 
  Trash2, 
  Edit, 
  Users, 
  BookOpen,
  Calendar,
  X
} from "lucide-react";

export default function BatchManagement() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newBatch, setNewBatch] = useState({
    name: "",
    description: "",
    category: "",
    language: "Hinglish",
    examTarget: "",
    startDate: "",
    price: "",
    originalPrice: "",
    discount: "",
    duration: "",
    thumbnail: "",
    whatsappGroupLink: "",
    subjects: []
  });

  const [editingId, setEditingId] = useState(null);
  const [currentSubject, setCurrentSubject] = useState({
    title: "",
    teacherId: "",
    courseId: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [batchRes, courseRes, userRes] = await Promise.all([
        api.get("/batch/get-all-batches"),
        api.get("/course/get-all-courses"),
        api.get("/user/get-users")
      ]);
      
      setBatches(batchRes.data.batches);
      setCourses(courseRes.data.courses || courseRes.data);
      setTeachers(userRes.data.users.filter(u => u.role === "teacher" || u.role === "admin"));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setNewBatch({ ...newBatch, thumbnail: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const addSubject = () => {
    if (!currentSubject.title || !currentSubject.teacherId || !currentSubject.courseId) {
      alert("Please fill all subject fields");
      return;
    }
    setNewBatch({
      ...newBatch,
      subjects: [...newBatch.subjects, { ...currentSubject }]
    });
    setCurrentSubject({ title: "", teacherId: "", courseId: "" });
  };

  const removeSubject = (index) => {
    const updatedSubjects = newBatch.subjects.filter((_, i) => i !== index);
    setNewBatch({ ...newBatch, subjects: updatedSubjects });
  };

  const handleEdit = (batch) => {
    setEditingId(batch._id);
    setNewBatch({
      name: batch.name,
      description: batch.description,
      price: batch.price,
      duration: batch.duration,
      thumbnail: batch.thumbnail?.url,
      whatsappGroupLink: batch.whatsappGroupLink || "",
      subjects: batch.subjects
    });
    setShowCreateForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newBatch.subjects.length === 0) {
      alert("Add at least one subject to the batch");
      return;
    }
    setIsSubmitting(true);
    try {
      let response;
      if (editingId) {
        response = await api.put(`/edit-batch/${editingId}`, newBatch);
      } else {
        response = await api.post("/batch/create-batch", newBatch);      }

      if (response.data.success) {
        setShowCreateForm(false);
        setEditingId(null);
        fetchData();
        setNewBatch({ name: "", description: "", price: "", duration: "", thumbnail: "", whatsappGroupLink: "", subjects: [] });
      }
    } catch (error) {
      alert(`Failed to ${editingId ? "update" : "create"} batch: ` + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      try {
        await api.delete(`/delete-batch/${id}`);
        fetchData();
      } catch (error) {
        alert("Failed to delete batch");
      }
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Batch Management</h1>
          <p className="text-gray-500">Create and organize student batches with assigned teachers and courses.</p>
        </div>
        <Button onClick={() => {
           if (showCreateForm && editingId) {
               setEditingId(null);
               setNewBatch({ name: "", description: "", category: "", language: "Hinglish", examTarget: "", startDate: "", price: "", originalPrice: "", discount: "", duration: "", thumbnail: "", whatsappGroupLink: "", subjects: [] });
           }
           setShowCreateForm(!showCreateForm);
        }}>          {showCreateForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showCreateForm ? "Cancel" : "Create New Batch"}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="animate-in slide-in-from-top-4 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle>{editingId ? "Update Batch" : "Define New Batch"}</CardTitle>
            <CardDescription>{editingId ? "Modify batch details and subjects." : "Fill in the details to launch a new learning cohort."}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Batch Name</label>
                  <Input 
                    placeholder="e.g. JEE Sprint 2026" 
                    value={newBatch.name}
                    onChange={e => setNewBatch({...newBatch, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Duration</label>
                  <Input 
                    placeholder="e.g. 6 Months" 
                    value={newBatch.duration}
                    onChange={e => setNewBatch({...newBatch, duration: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Category</label>
                  <Input
                    placeholder="e.g. Class 12 NEET"
                    value={newBatch.category}
                    onChange={e => setNewBatch({...newBatch, category: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Language</label>
                  <Input
                    placeholder="e.g. Hinglish"
                    value={newBatch.language}
                    onChange={e => setNewBatch({...newBatch, language: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Exam Target</label>
                  <Input
                    placeholder="e.g. NEET 2026"
                    value={newBatch.examTarget}
                    onChange={e => setNewBatch({...newBatch, examTarget: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Start Date</label>
                  <Input
                    type="date"
                    value={newBatch.startDate}
                    onChange={e => setNewBatch({...newBatch, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Price (₹)</label>
                  <Input
                    type="number"
                    placeholder="4999"
                    value={newBatch.price}
                    onChange={e => setNewBatch({...newBatch, price: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Original Price (₹)</label>
                  <Input
                    type="number"
                    placeholder="9999"
                    value={newBatch.originalPrice}
                    onChange={e => setNewBatch({...newBatch, originalPrice: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Discount Label</label>
                  <Input
                    placeholder="e.g. 50% OFF"
                    value={newBatch.discount}
                    onChange={e => setNewBatch({...newBatch, discount: e.target.value})}
                  />
                </div>                <div className="space-y-2">
                  <label className="text-sm font-semibold">Thumbnail</label>
                  <Input type="file" accept="image/*" onChange={handleThumbnailChange} required={!editingId} />
                </div>
                <div className="space-y-2 col-span-full">
                  <label className="text-sm font-semibold">WhatsApp Group Link</label>
                  <Input 
                    placeholder="https://chat.whatsapp.com/..." 
                    value={newBatch.whatsappGroupLink}
                    onChange={e => setNewBatch({...newBatch, whatsappGroupLink: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Description</label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={newBatch.description}
                  onChange={e => setNewBatch({...newBatch, description: e.target.value})}
                  placeholder="What is this batch about?"
                  required
                />
              </div>

              {/* Subject Management Section */}
              <div className="bg-gray-50 p-4 rounded-xl border space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Configure Subjects
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input 
                    placeholder="Subject Name (e.g. Physics)" 
                    value={currentSubject.title}
                    onChange={e => setCurrentSubject({...currentSubject, title: e.target.value})}
                  />
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                    value={currentSubject.teacherId}
                    onChange={e => setCurrentSubject({...currentSubject, teacherId: e.target.value})}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(t => <option key={t._id} value={t._id}>{t.name} ({t.role})</option>)}
                  </select>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                    value={currentSubject.courseId}
                    onChange={e => setCurrentSubject({...currentSubject, courseId: e.target.value})}
                  >
                    <option value="">Select Content Course</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addSubject}>
                  <Plus className="h-4 w-4 mr-2" /> Add Subject to Batch
                </Button>

                {newBatch.subjects.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {newBatch.subjects.map((s, i) => (
                      <div key={i} className="flex items-center justify-between bg-white p-2 rounded-lg border shadow-sm">
                        <div className="flex gap-4 items-center">
                          <span className="font-bold text-primary">{s.title}</span>
                          <span className="text-xs text-gray-500">Teacher: {teachers.find(t => t._id === s.teacherId)?.name}</span>
                          <span className="text-xs text-gray-500">Course: {courses.find(c => c._id === s.courseId)?.title}</span>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeSubject(i)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button className="w-full h-12" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : editingId ? "Update Batch" : "Publish Batch"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {batches.map((batch) => (
          <Card key={batch._id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-48 h-48 md:h-auto relative overflow-hidden">
                <img 
                  src={batch.thumbnail?.url || "https://via.placeholder.com/300x400"} 
                  alt={batch.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2">
                  <Badge className="bg-primary/90 backdrop-blur-md">${batch.price}</Badge>
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-bold text-gray-900">{batch.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(batch)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(batch._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                  {batch.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="mr-2 h-4 w-4 text-blue-500" />
                    {batch.purchased} Students
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="mr-2 h-4 w-4 text-orange-500" />
                    {batch.duration}
                  </div>
                </div>
                {batch.whatsappGroupLink && (
                  <div className="mt-2 text-[10px] text-green-600 font-bold truncate">
                    WhatsApp: {batch.whatsappGroupLink}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t flex flex-wrap gap-1">
                  {batch.subjects.map((s, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[10px] font-medium">
                      {s.title}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {batches.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed">
            <Layers className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No batches yet</h3>
            <p className="mt-2 text-gray-500">Launch your first batch to start enrolling students.</p>
          </div>
        )}
      </div>
    </div>
  );
}
