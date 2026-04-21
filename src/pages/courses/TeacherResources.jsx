import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Download,
  Loader2,
  Filter
} from "lucide-react";
import { Badge } from "../../components/ui/badge";

export default function TeacherResources() {
  const [batches, setBatches] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const { user } = useAuth();

  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "notes",
    batchId: "",
    subjectId: "",
    file: null,
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const { data } = await api.get("/batch/get-batches");
      if (data.success) {
        const myBatches = data.batches.filter(batch => 
          batch.subjects.some(subject => subject.teacherId === user._id)
        );
        setBatches(myBatches);
        if (myBatches.length > 0) {
          setSelectedBatchId(myBatches[0]._id);
          fetchResources(myBatches[0]._id);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async (batchId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/get-resources/${batchId}`);
      if (data.success) {
        setResources(data.resources);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewResource({ ...newResource, file: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      // Find subject title for the teacher
      const batch = batches.find(b => b._id === newResource.batchId);
      const subject = batch?.subjects.find(s => s.teacherId === user._id);
      
      const payload = {
        ...newResource,
        subjectId: subject?.title || "General",
      };

      const { data } = await api.post("/teacher/upload-resource", payload);
      if (data.success) {
        setShowUploadForm(false);
        fetchResources(selectedBatchId);
        setNewResource({ title: "", description: "", type: "notes", batchId: "", subjectId: "", file: null });
      }
    } catch (error) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this resource?")) {
      try {
        await api.delete(`/delete-resource/${id}`);
        fetchResources(selectedBatchId);
      } catch (error) {
        alert("Delete failed");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Resource Management</h1>
          <p className="text-gray-500">Upload DPPs, Notes, and Assignments for your students.</p>
        </div>
        <Button onClick={() => setShowUploadForm(!showUploadForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload New
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border">
        <Filter className="h-5 w-5 text-gray-400" />
        <select 
          className="bg-transparent font-medium focus:outline-none"
          value={selectedBatchId}
          onChange={(e) => {
            setSelectedBatchId(e.target.value);
            fetchResources(e.target.value);
          }}
        >
          {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
      </div>

      {showUploadForm && (
        <Card className="animate-in slide-in-from-top-4">
          <CardHeader>
            <CardTitle>Upload Resource</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                placeholder="Title" 
                value={newResource.title}
                onChange={e => setNewResource({...newResource, title: e.target.value})}
                required
              />
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={newResource.type}
                onChange={e => setNewResource({...newResource, type: e.target.value})}
                required
              >
                <option value="notes">Notes</option>
                <option value="dpp">DPP</option>
                <option value="assignment">Assignment</option>
                <option value="other">Other</option>
              </select>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newResource.batchId}
                onChange={e => setNewResource({...newResource, batchId: e.target.value})}
                required
              >
                <option value="">Select Batch</option>
                {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
              <Input 
                type="file"
                onChange={handleFileChange}
                required
              />
              <div className="md:col-span-2">
                <Input 
                  placeholder="Description (Optional)" 
                  value={newResource.description}
                  onChange={e => setNewResource({...newResource, description: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={uploading}>
                  {uploading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Upload"}
                </Button>
                <Button variant="outline" onClick={() => setShowUploadForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
        ) : (
          resources.map((res) => (
            <Card key={res._id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{res.title}</h3>
                    <div className="flex gap-2 items-center mt-1">
                      <Badge variant="secondary" className="capitalize">{res.type}</Badge>
                      <span className="text-xs text-gray-500">{new Date(res.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => window.open(res.file.url, '_blank')}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(res._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        {!loading && resources.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No resources found</h3>
            <p className="mt-2 text-gray-500">Select a batch or upload your first PDF/DPP.</p>
          </div>
        )}
      </div>
    </div>
  );
}
