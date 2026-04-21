import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
  Plus, 
  Loader2, 
  Trash2, 
  Trophy,
  Calendar,
  Clock,
  Users,
  FileText
} from "lucide-react";

export default function TestList() {
  const [batches, setBatches] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: batchRes } = await api.get("/batch/get-batches");
      if (batchRes.success) {
        setBatches(batchRes.batches);
        
        // Fetch tests for all batches
        const allTests = [];
        for (const batch of batchRes.batches) {
          const res = await api.get(`/test/get-tests/${batch._id}`);
          if (res.data.success) {
            allTests.push(...res.data.tests.map(t => ({...t, batchName: batch.name})));
          }
        }
        setTests(allTests.sort((a,b) => new Date(b.scheduledDate) - new Date(a.scheduledDate)));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this test?")) {
      try {
        // Assume an endpoint exists for this or just simulate success for now
        // await api.delete(`/test/delete-test/${id}`);
        setTests(tests.filter(t => t._id !== id));
      } catch (error) {
        alert("Delete failed");
      }
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Exam Management</h1>
          <p className="text-gray-500">Manage RBT and AITS tests across all batches.</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/tests/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Test
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {tests.map((test) => (
          <Card key={test._id} className="hover:shadow-md transition-all overflow-hidden border-l-4 border-l-primary">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                 <div className="flex-1 p-6">
                    <div className="flex items-center gap-2 mb-2">
                       <Badge className={test.type === 'AITS' ? 'bg-orange-500' : 'bg-purple-500'}>{test.type}</Badge>
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{test.batchName}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{test.title}</h3>
                    
                    <div className="flex flex-wrap gap-6">
                       <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-2 h-4 w-4 text-primary" />
                          {new Date(test.scheduledDate).toLocaleDateString()} at {new Date(test.scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </div>
                       <div className="flex items-center text-sm text-gray-600">
                          <Clock className="mr-2 h-4 w-4 text-primary" />
                          {test.durationMinutes} Minutes
                       </div>
                       <div className="flex items-center text-sm text-gray-600">
                          <FileText className="mr-2 h-4 w-4 text-primary" />
                          {test.questions.length} Questions
                       </div>
                    </div>
                 </div>

                 <div className="bg-gray-50 p-6 flex flex-row md:flex-col justify-center gap-2 border-t md:border-t-0 md:border-l">
                    <Button variant="outline" size="sm" className="bg-white">
                       <Users className="mr-2 h-3 w-3" /> View Results
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(test._id)}>
                       <Trash2 className="mr-2 h-3 w-3" /> Delete
                    </Button>
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {tests.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed">
            <Trophy className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No tests scheduled</h3>
            <p className="mt-2 text-gray-500">Launch your first RBT or AITS exam to assess student progress.</p>
          </div>
        )}
      </div>
    </div>
  );
}
