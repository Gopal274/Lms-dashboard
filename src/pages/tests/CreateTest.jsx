import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "../../components/ui/card";
import { ArrowLeft, Save, Loader2, Sparkles, Calendar as CalendarIcon } from "lucide-react";
import MCQCreator from "../../components/MCQCreator";

export default function CreateTest() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [testData, setTestData] = useState({
    title: "",
    batchId: "",
    type: "RBT",
    durationMinutes: 60,
    scheduledDate: "",
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
        marks: 4
      }
    ]
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const { data } = await api.get("/batch/get-batches");
      if (data.success) {
        setBatches(data.batches);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!testData.title || !testData.batchId || !testData.scheduledDate) {
      return alert("Please fill all basic details");
    }
    
    setLoading(true);
    try {
      const { data } = await api.post("/test/upload-test", testData);
      if (data.success) {
        alert("Test Created Successfully!");
        navigate("/dashboard/batches");
      }
    } catch (error) {
      alert("Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Test</h1>
            <p className="text-gray-500">Design RBT or AITS exams for specific batches.</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="px-8 shadow-lg shadow-primary/20">
          {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          Launch Test
        </Button>
      </div>

      <Card className="border-2">
        <CardHeader className="bg-gray-50/50">
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>Set the schedule, duration, and target batch for this exam.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-500">Test Title</label>
              <Input 
                placeholder="e.g., AITS - 01 (Full Syllabus)" 
                value={testData.title}
                onChange={e => setTestData({...testData, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-500">Target Batch</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={testData.batchId}
                onChange={e => setTestData({...testData, batchId: e.target.value})}
              >
                <option value="">Select a Batch</option>
                {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-500">Test Type</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={testData.type}
                onChange={e => setTestData({...testData, type: e.target.value})}
              >
                <option value="RBT">RBT (Weekly Revision)</option>
                <option value="AITS">AITS (All India Test Series)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-500">Scheduled Date & Time</label>
              <Input 
                type="datetime-local"
                value={testData.scheduledDate}
                onChange={e => setTestData({...testData, scheduledDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-500">Duration (Minutes)</label>
              <Input 
                type="number"
                placeholder="e.g., 180"
                value={testData.durationMinutes}
                onChange={e => setTestData({...testData, durationMinutes: parseInt(e.target.value)})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 mt-8 mb-4">
         <Sparkles className="h-5 w-5 text-primary" />
         <h2 className="text-xl font-bold">Exam Questions</h2>
      </div>

      <MCQCreator 
        questions={testData.questions} 
        setQuestions={(qs) => setTestData({...testData, questions: qs})} 
      />
    </div>
  );
}
