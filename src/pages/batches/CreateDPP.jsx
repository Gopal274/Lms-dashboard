import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "../../components/ui/card";
import { ArrowLeft, Save, Loader2, Sparkles } from "lucide-react";
import MCQCreator from "../../components/MCQCreator";

export default function CreateDPP() {
  const { id: batchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Get subject from query params
  const queryParams = new URLSearchParams(location.search);
  const subjectId = queryParams.get("subject") || "Physics";

  const [dppData, setDppData] = useState({
    title: "",
    batchId: batchId,
    subjectId: subjectId,
    chapterId: "General",
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      }
    ]
  });

  const handleSave = async () => {
    if (!dppData.title) return alert("Please enter a title");
    if (dppData.questions.some(q => !q.question)) return alert("Please fill all questions");

    setLoading(true);
    try {
      const { data } = await api.post("/dpp/upload-dpp", dppData);
      if (data.success) {
        alert("DPP Created Successfully!");
        navigate(`/dashboard/teacher/batch/${batchId}`);
      }
    } catch (error) {
      alert("Failed to create DPP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create MCQ DPP</h1>
            <p className="text-gray-500">Subject: <span className="text-primary font-bold">{subjectId}</span></p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="px-8 shadow-lg shadow-primary/20">
          {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          Save DPP
        </Button>
      </div>

      <Card className="border-2">
        <CardHeader className="bg-gray-50/50">
          <CardTitle>DPP Basic Details</CardTitle>
          <CardDescription>Give this practice set a clear title and assign a chapter.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-500">DPP Title</label>
            <Input 
              placeholder="e.g., Ray Optics: DPP 01" 
              value={dppData.title}
              onChange={e => setDppData({...dppData, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-500">Chapter Name</label>
            <Input 
              placeholder="e.g., Reflection & Refraction" 
              value={dppData.chapterId}
              onChange={e => setDppData({...dppData, chapterId: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 mt-8 mb-4">
         <Sparkles className="h-5 w-5 text-primary" />
         <h2 className="text-xl font-bold">Questions</h2>
      </div>

      <MCQCreator 
        questions={dppData.questions} 
        setQuestions={(qs) => setDppData({...dppData, questions: qs})} 
      />
    </div>
  );
}
