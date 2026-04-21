import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { 
  Video, 
  Plus, 
  Calendar, 
  PlayCircle, 
  Clock,
  ExternalLink 
} from "lucide-react";
import { Badge } from "../../components/ui/badge";

export default function LiveClassManagement() {
  const [batches, setBatches] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newSession, setNewSession] = useState({
    title: "",
    batchId: "",
    subjectId: "",
    startTime: "",
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchBatchesAndSessions();
  }, []);

  const fetchBatchesAndSessions = async () => {
    try {
      const { data } = await api.get("/batch/get-batches");
      if (data.success) {
        const myBatches = data.batches.filter(batch => 
          batch.subjects.some(subject => subject.teacherId === user._id)
        );
        setBatches(myBatches);
        
        // Fetch sessions for all my batches
        const allSessions = [];
        for (const batch of myBatches) {
          const res = await api.get(`/get-live-sessions/${batch._id}`);
          if (res.data.success) {
            allSessions.push(...res.data.sessions);
          }
        }
        setLiveSessions(allSessions.sort((a,b) => new Date(b.startTime) - new Date(a.startTime)));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/teacher/create-live-session", newSession);
      if (data.success) {
        setShowScheduleForm(false);
        fetchBatchesAndSessions();
        setNewSession({ title: "", batchId: "", subjectId: "", startTime: "" });
      }
    } catch (error) {
      alert("Failed to schedule session");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Live Classes</h1>
          <p className="text-gray-500">Go live, schedule sessions, and interact with students.</p>
        </div>
        <Button onClick={() => setShowScheduleForm(!showScheduleForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Session
        </Button>
      </div>

      {showScheduleForm && (
        <Card className="animate-in slide-in-from-top-4">
          <CardHeader>
            <CardTitle>Schedule New Live Session</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                placeholder="Session Title (e.g. Physics Chapter 5)" 
                value={newSession.title}
                onChange={e => setNewSession({...newSession, title: e.target.value})}
                required
              />
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newSession.batchId}
                onChange={e => {
                  const batch = batches.find(b => b._id === e.target.value);
                  setNewSession({...newSession, batchId: e.target.value, subjectId: batch?.subjects.find(s => s.teacherId === user._id)?.title || ""});
                }}
                required
              >
                <option value="">Select Batch</option>
                {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
              <Input 
                type="datetime-local"
                value={newSession.startTime}
                onChange={e => setNewSession({...newSession, startTime: e.target.value})}
                required
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Schedule</Button>
                <Button variant="outline" onClick={() => setShowScheduleForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {liveSessions.map((session) => (
          <Card key={session._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{session.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="secondary">{session.subjectId}</Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(session.startTime).toLocaleString()}
                      </div>
                      {session.status === 'live' && (
                        <Badge className="bg-red-500 hover:bg-red-600 animate-pulse">LIVE</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                  {session.status !== 'ended' ? (
                    <Button 
                      className={session.status === 'live' ? 'bg-red-600 hover:bg-red-700 w-full md:w-auto' : 'w-full md:w-auto'}
                      onClick={() => window.location.href = `/dashboard/teacher/live/${session._id}`}
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      {session.status === 'live' ? 'Join Stream' : 'Go Live'}
                    </Button>
                  ) : (
                    <Button variant="outline" disabled className="w-full md:w-auto">
                      Session Ended
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {liveSessions.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
            <Video className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No sessions scheduled</h3>
            <p className="mt-2 text-gray-500">Schedule your first live class to connect with students.</p>
          </div>
        )}
      </div>
    </div>
  );
}
