import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { 
  Loader2, 
  Search, 
  MessageSquare, 
  CheckCircle2, 
  Clock,
  Filter,
  Send
} from "lucide-react";
import api from "../../lib/api";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";

export default function DoubtManagement() {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("open");

  useEffect(() => {
    fetchDoubts();
  }, [statusFilter]);

  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/doubt/get-doubts?status=${statusFilter}`);
      if (data.success) {
        setDoubts(data.doubts);
      }
    } catch (e) {
      alert("Failed to fetch doubts");
    } finally {
      setLoading(false);
    }
  };

  const selectDoubt = async (doubt) => {
    setSelectedDoubt(doubt);
    try {
        const { data } = await api.get(`/get-doubt/${doubt._id}`);
        if (data.success) {
            setReplies(data.replies);
        }
    } catch (e) {
        alert("Failed to fetch discussion");
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/doubt/add-doubt-reply", {
        doubtId: selectedDoubt._id,
        content: replyText
      });
      if (data.success) {
        setReplyText("");
        // Refresh replies
        const res = await api.get(`/doubt/get-doubt/${selectedDoubt._id}`);
        setReplies(res.data.replies);
      }
    } catch (err) {
      alert("Failed to send reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (id) => {
      try {
          const { data } = await api.put(`/resolve-doubt/${id}`);
          if (data.success) {
              alert("Doubt marked as resolved!");
              setSelectedDoubt(null);
              fetchDoubts();
          }
      } catch (e) {
          alert("Failed to resolve doubt");
      }
  };

  if (loading && doubts.length === 0) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 overflow-hidden">
      {/* Doubt List */}
      <div className="w-1/3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Student Doubts</h2>
            <div className="flex gap-2">
                <Button variant={statusFilter === 'open' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('open')}>Open</Button>
                <Button variant={statusFilter === 'resolved' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('resolved')}>Resolved</Button>
            </div>
        </div>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-3">
            {doubts.map((doubt) => (
              <Card 
                key={doubt._id} 
                className={`cursor-pointer transition-all hover:border-primary/50 ${selectedDoubt?._id === doubt._id ? 'border-primary ring-1 ring-primary/20' : ''}`}
                onClick={() => selectDoubt(doubt)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold">{doubt.subject}</Badge>
                    <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(doubt.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm truncate">{doubt.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{doubt.description}</p>
                  <div className="flex items-center gap-2 mt-4 text-[10px] text-gray-400">
                    <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center font-bold">{doubt.userName[0]}</div>
                    <span>{doubt.userName}</span>
                    <span className="ml-auto flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {doubt.replyCount}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {doubts.length === 0 && (
                <div className="text-center py-20 text-gray-400 italic">No doubts found.</div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Discussion Pane */}
      <div className="flex-1 bg-white rounded-3xl border shadow-sm flex flex-col overflow-hidden">
        {selectedDoubt ? (
          <>
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold">{selectedDoubt.title}</h3>
                <p className="text-xs text-gray-500">Posted by {selectedDoubt.userName} on {new Date(selectedDoubt.createdAt).toLocaleString()}</p>
              </div>
              {selectedDoubt.status === 'open' && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleResolve(selectedDoubt._id)}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Resolved
                </Button>
              )}
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {/* Original Question */}
                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                  <p className="text-gray-800 leading-relaxed">{selectedDoubt.description}</p>
                  {selectedDoubt.attachments?.length > 0 && (
                    <div className="flex gap-2 mt-4">
                        {selectedDoubt.attachments.map((img, i) => (
                            <img key={i} src={img.url} className="w-40 h-40 object-cover rounded-xl border bg-white" alt="attachment" />
                        ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold">Discussion Thread</span></div>
                </div>

                {replies.map((reply) => (
                  <div key={reply._id} className={`flex gap-4 ${reply.isTeacherReply ? 'flex-row-reverse' : ''}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${reply.isTeacherReply ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {reply.isTeacherReply ? 'M' : reply.userName[0]}
                    </div>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${reply.isTeacherReply ? 'bg-primary/5 border border-primary/10' : 'bg-gray-50 border'}`}>
                      <div className="flex justify-between items-center mb-1 gap-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{reply.isTeacherReply ? 'Official Mentor' : reply.userName}</span>
                        <span className="text-[10px] text-gray-400">{new Date(reply.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-gray-700">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-6 border-t bg-gray-50/30">
              <div className="flex gap-4">
                <Input 
                  placeholder="Type your response to the student..." 
                  className="flex-1 bg-white"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                />
                <Button disabled={isSubmitting} onClick={handleSendReply}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-2" /> Send Reply</>}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
            <MessageSquare className="h-16 w-16 opacity-20" />
            <p className="font-medium">Select a doubt from the list to view discussion</p>
          </div>
        )}
      </div>
    </div>
  );
}
