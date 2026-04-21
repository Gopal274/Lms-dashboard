import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
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
  Loader2, 
  Users, 
  BookOpen, 
  ArrowLeft, 
  Video, 
  FileText,
  Calendar,
  Sparkles,
  BarChart3
} from "lucide-react";

export default function TeacherBatchDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatchDetail();
  }, [id]);

  const fetchBatchDetail = async () => {
    try {
      const { data } = await api.get("/batch/get-batches");
      if (data.success) {
        const found = data.batches.find(b => b._id === id);
        setBatch(found);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (!batch) return <div className="text-center py-20">Batch not found</div>;

  const mySubjects = batch.subjects.filter(s => s.teacherId === user._id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/teacher/batches">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{batch.name}</h1>
          <p className="text-gray-500">Overview of your subjects and student engagement in this batch.</p>
        </div>
      </div>

      <div className="flex gap-4">
         <Button variant="outline" asChild>
            <Link to={`/dashboard/teacher/batch/${batch._id}/analytics`}>
               <BarChart3 className="mr-2 h-4 w-4" /> Batch Analytics
            </Link>
         </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stats & Subjects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                   <Users className="h-4 w-4" />
                   <span className="text-xs font-bold uppercase">Students</span>
                </div>
                <div className="text-2xl font-bold">{batch.purchased}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                   <Calendar className="h-4 w-4" />
                   <span className="text-xs font-bold uppercase">Duration</span>
                </div>
                <div className="text-2xl font-bold">{batch.duration}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                   <BookOpen className="h-4 w-4" />
                   <span className="text-xs font-bold uppercase">Your Subjects</span>
                </div>
                <div className="text-2xl font-bold">{mySubjects.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>My Assigned Subjects</CardTitle>
              <CardDescription>Content and live session management for your subjects.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mySubjects.map((subject, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border group hover:border-primary transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm border font-bold text-primary">
                       <BookOpen size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{subject.title}</h4>
                      <p className="text-xs text-gray-500">Course Content: {subject.courseId}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                       <Link to={`/dashboard/teacher/live?batch=${batch._id}`}>
                          <Video className="h-3 w-3 mr-1" /> Go Live
                       </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                       <Link to={`/dashboard/teacher/resources?batch=${batch._id}`}>
                          <FileText className="h-3 w-3 mr-1" /> Resources
                       </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                       <Link to={`/dashboard/teacher/batch/${batch._id}/dpp/new?subject=${subject.title}`}>
                          <Sparkles className="h-3 w-3 mr-1" /> Create MCQ DPP
                       </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* DPP & Test Management for current teacher */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Subject Content & Quizzes</CardTitle>
                <CardDescription>Recently created practice sets and tests.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
               <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed">
                  <p className="text-gray-400 text-sm">Select a subject above to manage content or create new MCQ sets.</p>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Batch Info */}
        <div className="space-y-6">
          <Card>
            <div className="aspect-video relative overflow-hidden">
               <img 
                 src={batch.thumbnail?.url || "https://via.placeholder.com/400x225"} 
                 className="object-cover w-full h-full"
                 alt={batch.name}
               />
            </div>
            <CardHeader>
               <CardTitle className="text-lg">Batch Description</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-sm text-gray-600 leading-relaxed">
                 {batch.description}
               </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
               <CardTitle className="text-lg">All Subjects</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-2">
                 {batch.subjects.map((s, i) => (
                   <div key={i} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded border">
                      <span className="font-medium">{s.title}</span>
                      <Badge variant="outline" className="text-[10px]">{s.teacherId === user._id ? "You" : "Other"}</Badge>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
