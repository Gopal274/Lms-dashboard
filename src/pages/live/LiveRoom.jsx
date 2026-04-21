import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import io from "socket.io-client";
import AgoraRTC from "agora-rtc-sdk-ng";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { 
  MessageSquare, 
  Users, 
  BarChart2, 
  Send, 
  StopCircle,
  Loader2,
  HelpCircle,
  Video,
  Plus,
  Mic,
  MicOff,
  VideoOff,
  Trash2,
  X
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "../../components/ui/dialog";

const AGORA_APP_ID = "1ddb4a3eae824e479dded7a3ff38f900";

export default function LiveClassRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [polls, setPolls] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState('chat'); // chat, qa

  // Poll creation state
  const [showPollDialog, setShowPollDialog] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["", ""]
  });
  
  const socketRef = useRef();
  const agoraClientRef = useRef();
  const localTracksRef = useRef([]);

  useEffect(() => {
    fetchSession();
    socketRef.current = io("http://localhost:8000"); 

    return () => {
      socketRef.current.disconnect();
      leaveChannel();
    };
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const { data } = await api.get(`/teacher/get-live-sessions-by-id/${sessionId}`);
      if (data.success) {
        setSession(data.session);
        setPolls(data.session.polls || []);
        setQuestions(data.session.questions || []);
        socketRef.current.emit("join_live", { batchId: data.session.batchId });
        
        if (data.session.status === 'live') {
          startAgora(data.session);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startAgora = async (sessionData) => {
    try {
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      agoraClientRef.current = client;

      const { data } = await api.post("/teacher/start-live-session", { sessionId });
      if (!data.success) return;

      const { token } = data;
      await client.join(AGORA_APP_ID, sessionData.agoraChannel, token, user._id);

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracksRef.current = [audioTrack, videoTrack];
      
      videoTrack.play("local-player");
      await client.publish([audioTrack, videoTrack]);
      setIsLive(true);
      
      socketRef.current.emit("live_status", { 
        batchId: sessionData.batchId, 
        status: "live",
        sessionInfo: sessionData
      });

    } catch (error) {
      console.error("Agora Error:", error);
    }
  };

  const leaveChannel = async () => {
    if (localTracksRef.current) {
      localTracksRef.current.forEach(track => {
        track.stop();
        track.close();
      });
      localTracksRef.current = [];
    }
    if (agoraClientRef.current) {
      await agoraClientRef.current.leave();
    }
    setIsLive(false);
  };

  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on("new_poll", (poll) => {
      setPolls((prev) => [poll, ...prev]);
    });

    socketRef.current.on("update_poll_votes", (data) => {
      setPolls((prev) => prev.map(p => {
        if (p._id === data.pollId) {
          const newOptions = [...p.options];
          newOptions[data.optionIndex].votes += 1;
          return { ...p, options: newOptions };
        }
        return p;
      }));
    });

    socketRef.current.on("new_question", (data) => {
      setQuestions((prev) => [data.question, ...prev]);
    });

    socketRef.current.on("new_reaction", (data) => {
      setReactions((prev) => [...prev, data]);
      setReactionCounts((prev) => ({
        ...prev,
        [data.emoji]: (prev[data.emoji] || 0) + 1
      }));
      // Remove reaction after 3 seconds to keep state clean
      setTimeout(() => {
        setReactions((prev) => prev.filter(r => r.id !== data.id));
      }, 3000);
    });
  }, [socketRef.current]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    socketRef.current.emit("send_message", {
      batchId: session.batchId,
      message: newMessage,
      user: { name: user.name, role: user.role }
    });
    setNewMessage("");
  };

  const handleCreatePoll = async () => {
    if (!newPoll.question || newPoll.options.some(o => !o)) return;
    try {
      const { data } = await api.post("/teacher/create-poll", {
        sessionId,
        question: newPoll.question,
        options: newPoll.options
      });
      if (data.success) {
        socketRef.current.emit("create_poll", {
          batchId: session.batchId,
          poll: data.poll
        });
        setShowPollDialog(false);
        setNewPoll({ question: "", options: ["", ""] });
        // Refresh polls list from server to get IDs
        const res = await api.get(`/teacher/get-live-sessions-by-id/${sessionId}`);
        if (res.data.success) setPolls(res.data.session.polls || []);
      }
    } catch (error) {
      alert("Failed to create poll");
    }
  };

  const handleEndPoll = async (pollId) => {
      try {
          const { data } = await api.post("/teacher/end-poll", {
              sessionId,
              pollId
          });
          if (data.success) {
              setPolls(prev => prev.map(p => p._id === pollId ? { ...p, active: false } : p));
              socketRef.current.emit("end_poll", { batchId: session.batchId, pollId });
          }
      } catch (error) {
          alert("Failed to end poll");
      }
  };

  const handleMarkAsAnswered = async (questionId) => {
      try {
          const { data } = await api.post("/teacher/mark-question-answered", {
              sessionId,
              questionId
          });
          if (data.success) {
              setQuestions(prev => prev.map(q => q._id === questionId ? { ...q, isAnswered: true } : q));
              socketRef.current.emit("question_answered", { batchId: session.batchId, questionId });
          }
      } catch (error) {
          alert("Failed to mark as answered");
      }
  };

  const handleEndSession = async () => {
    if (window.confirm("Are you sure you want to end this live session?")) {
      try {
        await api.post("/teacher/end-live-session", { sessionId });
        socketRef.current.emit("live_status", { 
          batchId: session.batchId, 
          status: "ended" 
        });
        await leaveChannel();
        navigate("/dashboard/teacher/live");
      } catch (error) {
        console.error(error);
      }
    }
  };

  const toggleMute = () => {
    if (localTracksRef.current[0]) {
      localTracksRef.current[0].setEnabled(muted);
      setMuted(!muted);
    }
  };

  const toggleVideo = () => {
    if (localTracksRef.current[1]) {
      localTracksRef.current[1].setEnabled(videoOff);
      setVideoOff(!videoOff);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex items-center gap-4">
          <Badge className={`${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}>
            {isLive ? 'LIVE' : 'OFFLINE'}
          </Badge>
          <h1 className="text-xl font-bold text-gray-900">{session?.title}</h1>
          <Badge variant="outline" className="text-xs">{session?.subjectId}</Badge>
        </div>
        <div className="flex gap-2">
          {!isLive && (
            <Button onClick={() => startAgora(session)} className="bg-green-600 hover:bg-green-700">
              <Video className="mr-2 h-4 w-4" />
              Start Streaming
            </Button>
          )}
          <Button variant="destructive" onClick={handleEndSession}>
            <StopCircle className="mr-2 h-4 w-4" />
            End Session
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left: Video & Polls */}
        <div className="flex-[2] flex flex-col gap-4 overflow-y-auto pr-2">
          {/* Video Player */}
          <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center relative shadow-lg">
            <div id="local-player" className="w-full h-full"></div>
            
            {!isLive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/60">
                <Video className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-xl font-medium">Ready to go live?</p>
                <p className="text-gray-400 text-sm mt-2">Click 'Start Streaming' to begin</p>
              </div>
            )}

            {isLive && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 bg-black/40 p-3 rounded-full backdrop-blur-md border border-white/20">
                <Button 
                  size="icon" 
                  variant={muted ? "destructive" : "secondary"} 
                  className="rounded-full h-10 w-10"
                  onClick={toggleMute}
                >
                  {muted ? <MicOff size={20} /> : <Mic size={20} />}
                </Button>
                <Button 
                  size="icon" 
                  variant={videoOff ? "destructive" : "secondary"} 
                  className="rounded-full h-10 w-10"
                  onClick={toggleVideo}
                >
                  {videoOff ? <VideoOff size={20} /> : <Video size={20} />}
                </Button>
              </div>
            )}
          </div>

          {/* Polls Section */}
          <Card className="border-orange-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-md font-bold">Live Polls</CardTitle>
              </div>
              
              <Dialog open={showPollDialog} onOpenChange={setShowPollDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                    <Plus className="h-4 w-4 mr-1" /> New Poll
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Live Poll</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Question</label>
                      <Input 
                        placeholder="What's your answer to...?" 
                        value={newPoll.question}
                        onChange={e => setNewPoll({...newPoll, question: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Options</label>
                      {newPoll.options.map((opt, i) => (
                        <div key={i} className="flex gap-2">
                          <Input 
                            placeholder={`Option ${i+1}`} 
                            value={opt}
                            onChange={e => {
                              const opts = [...newPoll.options];
                              opts[i] = e.target.value;
                              setNewPoll({...newPoll, options: opts});
                            }}
                          />
                          {newPoll.options.length > 2 && (
                            <Button size="icon" variant="ghost" onClick={() => setNewPoll({...newPoll, options: newPoll.options.filter((_, idx) => idx !== i)})}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {newPoll.options.length < 4 && (
                        <Button variant="ghost" size="sm" onClick={() => setNewPoll({...newPoll, options: [...newPoll.options, ""]})}>
                          <Plus className="h-3 w-3 mr-1" /> Add Option
                        </Button>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreatePoll} className="w-full bg-orange-600 hover:bg-orange-700">Launch Poll</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {polls.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed">
                   <p className="text-gray-400 text-sm">No polls launched yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {polls.map((poll, i) => {
                    const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);
                    return (
                      <div key={poll._id || i} className="p-4 bg-white rounded-xl border-2 border-orange-50 shadow-sm relative overflow-hidden">
                        {poll.active ? (
                            <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-full">
                                <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold text-green-600">ACTIVE</span>
                            </div>
                        ) : (
                            <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] px-1.5 py-0 h-4">ENDED</Badge>
                        )}
                        <p className="font-bold text-gray-800 mb-3 pr-4">{poll.question}</p>
                        <div className="space-y-2">
                          {poll.options.map((opt, idx) => {
                            const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-xs font-medium">
                                  <span>{opt.option}</span>
                                  <span>{opt.votes} votes ({percentage}%)</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-orange-400 transition-all duration-500" 
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {poll.active && (
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full mt-4 h-8 text-[10px] border-orange-200 text-orange-700 hover:bg-orange-50"
                                onClick={() => handleEndPoll(poll._id)}
                            >
                                <StopCircle className="h-3 w-3 mr-1" /> End Poll & Show Results
                            </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Chat & Q&A */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <Card className="flex-1 flex flex-col overflow-hidden shadow-md border-primary/10">
            <CardHeader className="py-2 border-b bg-gray-50/50">
              <div className="flex gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveSideTab('chat')}
                  className={`rounded-none px-1 h-10 border-b-2 transition-all ${
                    activeSideTab === 'chat' ? "text-primary border-primary" : "text-gray-500 border-transparent"
                  }`}
                >
                  <MessageSquare className="h-4 w-4 mr-2" /> Chat
                </Button>
                <Button 
                   variant="ghost" 
                   onClick={() => setActiveSideTab('qa')}
                   className={`rounded-none px-1 h-10 border-b-2 transition-all ${
                    activeSideTab === 'qa' ? "text-primary border-primary" : "text-gray-500 border-transparent"
                  }`}
                >
                  <HelpCircle className="h-4 w-4 mr-2" /> Q&A
                  {questions.length > 0 && <Badge className="ml-1 bg-red-500 px-1 min-w-[18px] h-[18px]">{questions.length}</Badge>}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
              {activeSideTab === 'chat' ? (
                messages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.user.role === 'teacher' ? 'items-end' : 'items-start'}`}>
                    <span className={`text-[10px] font-bold mb-1 ${m.user.role === 'teacher' ? 'text-blue-600' : 'text-gray-500'}`}>
                      {m.user.name}
                    </span>
                    <p className={`text-sm p-3 rounded-2xl max-w-[90%] shadow-sm ${
                      m.user.role === 'teacher' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-none border'
                    }`}>
                      {m.message}
                    </p>
                  </div>
                ))
              ) : (
                questions.map((q, i) => (
                  <div key={q._id || i} className={`p-3 rounded-xl border shadow-sm group transition-colors ${
                      q.isAnswered ? "bg-green-50/50 border-green-100" : "bg-blue-50/50 border-blue-100"
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                       <span className={`text-xs font-bold ${q.isAnswered ? "text-green-700" : "text-blue-700"}`}>
                           {q.userName || q.user?.name}
                       </span>
                       <Badge variant="outline" className={`text-[10px] bg-white ${q.isAnswered ? "text-green-600 border-green-200" : "text-blue-600 border-blue-200"}`}>
                           {q.isAnswered ? "Answered" : "Unanswered"}
                       </Badge>
                    </div>
                    <p className={`text-sm font-medium ${q.isAnswered ? "text-gray-500 line-through decoration-green-300" : "text-gray-800"}`}>
                        {q.question}
                    </p>
                    {!q.isAnswered && (
                        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7 text-[10px] bg-white border-green-200 text-green-700 hover:bg-green-50"
                                onClick={() => handleMarkAsAnswered(q._id)}
                            >
                                <StopCircle className="h-3 w-3 mr-1" /> Mark as Answered
                            </Button>
                        </div>
                    )}
                  </div>
                ))
              )}
              {activeSideTab === 'qa' && questions.length === 0 && (
                <div className="text-center py-10">
                   <HelpCircle className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                   <p className="text-gray-400 text-sm">No student questions yet.</p>
                </div>
              )}
            </CardContent>

            <div className="p-4 border-t bg-gray-50">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input 
                  placeholder={activeSideTab === 'chat' ? "Type a message..." : "Only chat is enabled for you"} 
                  disabled={activeSideTab !== 'chat'}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  className="bg-white rounded-full px-4"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim() || activeSideTab !== 'chat'} className="rounded-full h-10 w-10">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
