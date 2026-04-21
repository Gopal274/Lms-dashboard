import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
  Loader2, 
  ArrowLeft, 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  Award
} from "lucide-react";

export default function TeacherBatchAnalytics() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState(null);
  const [stats, setStats] = useState({
    avgAttendance: 85,
    dppCompletion: 72,
    testAvg: 68,
    topStudents: [
      { name: "Rahul S.", score: 92, rank: 1 },
      { name: "Sneha K.", score: 88, rank: 2 },
      { name: "Amit P.", score: 85, rank: 3 },
    ]
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const { data } = await api.get("/batch/get-batches");
      if (data.success) {
        const found = data.batches.find(b => b._id === id);
        setBatch(found);
      }
      // In a real app, we would fetch actual analytics here
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (!batch) return <div className="text-center py-20">Batch not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/dashboard/teacher/batch/${id}`}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Batch Analytics</h1>
            <p className="text-gray-500">{batch.name} • Performance Insights</p>
          </div>
        </div>
        <Button variant="outline">
          <TrendingUp className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
               <Users className="h-4 w-4" />
               <span className="text-xs font-bold uppercase">Attendance</span>
            </div>
            <div className="text-3xl font-bold">{stats.avgAttendance}%</div>
            <p className="text-xs text-green-600 font-medium mt-1">+2% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-600 mb-2">
               <CheckCircle2 className="h-4 w-4" />
               <span className="text-xs font-bold uppercase">DPP Progress</span>
            </div>
            <div className="text-3xl font-bold">{stats.dppCompletion}%</div>
            <p className="text-xs text-gray-500 font-medium mt-1">Average per student</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
               <Award className="h-4 w-4" />
               <span className="text-xs font-bold uppercase">Test Avg.</span>
            </div>
            <div className="text-3xl font-bold">{stats.testAvg}%</div>
            <p className="text-xs text-red-600 font-medium mt-1">-3% from last test</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
               <Clock className="h-4 w-4" />
               <span className="text-xs font-bold uppercase">Active Today</span>
            </div>
            <div className="text-3xl font-bold">{Math.round(batch.purchased * 0.65)}</div>
            <p className="text-xs text-gray-500 font-medium mt-1">Students online now</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Based on recent RBT and AITS tests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topStudents.map((student, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      idx === 0 ? "bg-yellow-500" : idx === 1 ? "bg-slate-400" : "bg-orange-400"
                    }`}>
                      {student.rank}
                    </div>
                    <span className="font-bold text-gray-800">{student.name}</span>
                  </div>
                  <div className="text-primary font-black">{student.score}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Syllabus Completion</CardTitle>
            <CardDescription>Subject-wise progress tracking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {batch.subjects.map((subject, idx) => {
              const progress = Math.floor(Math.random() * 40) + 30; // Mock progress
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span>{subject.title}</span>
                    <span className="text-primary">{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
