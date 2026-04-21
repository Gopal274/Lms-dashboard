import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { 
  Loader2, 
  Video, 
  FileText, 
  Presentation, 
  Plus, 
  ArrowLeft, 
  Trash2, 
  HelpCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import api from "../../lib/api";
import { Badge } from "../../components/ui/badge";

export default function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newLesson, setNewLesson] = useState({ 
    title: "", 
    description: "", 
    videoUrl: "", 
    videoSection: "General" 
  });
  
  const [quiz, setQuiz] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
    explanation: "",
    timeLimit: 60
  });

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const { data } = await api.get(`/get-course/${id}`);
      if (data.success) {
        setCourse(data.course);
      }
    } catch (e) {
      alert("Failed to fetch course details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.question || currentQuestion.options.every(o => !o.text)) {
      alert("Please fill question and at least one option");
      return;
    }
    if (currentQuestion.options.every(o => !o.isCorrect)) {
        alert("Please mark at least one option as correct");
        return;
    }
    setQuiz([...quiz, { ...currentQuestion }]);
    setCurrentQuestion({
      question: "",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      explanation: "",
      timeLimit: 60
    });
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!newLesson.title) return alert("Title is required");

    setIsSubmitting(true);
    try {
      await api.put(`/course/add-lesson`, {
        ...newLesson,
        quiz,
        courseId: id
      });
      setNewLesson({ title: "", description: "", videoUrl: "", videoSection: "General" });
      setQuiz([]);
      fetchCourse();
      alert("Lesson added successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add lesson");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      try {
        const { data } = await api.put(`/delete-lesson`, {
          courseId: id,
          lessonId
        });
        if (data.success) {
          alert("Lesson deleted successfully");
          fetchCourse();
        }
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete lesson");
      }
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (!course) return <div className="text-center py-20">Course not found</div>;

  return (
    <div className="space-y-8 pb-20">
      <Button variant="ghost" onClick={() => navigate("/dashboard/courses")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Course Info & Lessons List */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{course.name}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{course.level}</Badge>
                <Badge variant="secondary">${course.price}</Badge>
                <Badge className="bg-green-500">{course.courseData?.length || 0} Lessons</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Course Curriculum
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.courseData?.length === 0 ? (
                <p className="text-center py-10 text-gray-500 italic">No lessons added yet. Use the form to start building your curriculum.</p>
              ) : (
                course.courseData.map((lesson, idx) => (
                  <div key={lesson._id || idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border group hover:border-primary transition-colors">
                    <div className="flex items-center">
                      <div className="bg-white p-2 rounded-lg mr-4 shadow-sm border font-bold text-primary w-10 h-10 flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{lesson.title}</h4>
                        <div className="flex gap-3 mt-1 items-center">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Video className="h-3 w-3" /> Video Stream
                          </span>
                          {lesson.quiz?.length > 0 && (
                            <Badge variant="secondary" className="text-[10px] h-4">
                              {lesson.quiz.length} MCQs
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100"
                      onClick={() => handleDeleteLesson(lesson._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Add Lesson Form */}
        <div className="space-y-8">
          <Card className="sticky top-8 shadow-lg border-primary/20">
            <CardHeader className="bg-primary/5 border-b mb-6">
              <CardTitle className="text-lg">Add New Lesson</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddLesson} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Basic Info</label>
                  <Input 
                    value={newLesson.title}
                    onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                    placeholder="Lesson Title (e.g. Introduction to Atoms)"
                    required
                  />
                  <Input 
                    value={newLesson.videoUrl}
                    onChange={e => setNewLesson({...newLesson, videoUrl: e.target.value})}
                    placeholder="Video URL (Cloudinary/YouTube)"
                    required
                  />
                </div>

                {/* Quiz Section */}
                <div className="mt-8 pt-6 border-t space-y-4">
                  <label className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-orange-500" />
                    Lesson Quiz (Optional)
                  </label>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-orange-200">
                    <Input 
                      className="mb-3 bg-white"
                      placeholder="Question text?"
                      value={currentQuestion.question}
                      onChange={e => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                    />
                    <div className="grid grid-cols-1 gap-2">
                      {currentQuestion.options.map((opt, i) => (
                        <div key={i} className="flex gap-2">
                          <Input 
                            className="bg-white flex-1"
                            placeholder={`Option ${i+1}`}
                            value={opt.text}
                            onChange={e => {
                                const newOpts = [...currentQuestion.options];
                                newOpts[i].text = e.target.value;
                                setCurrentQuestion({...currentQuestion, options: newOpts});
                            }}
                          />
                          <Button 
                            type="button" 
                            size="icon" 
                            variant={opt.isCorrect ? "default" : "outline"}
                            className={opt.isCorrect ? "bg-green-600" : ""}
                            onClick={() => {
                                const newOpts = currentQuestion.options.map((o, idx) => ({
                                    ...o, isCorrect: idx === i
                                }));
                                setCurrentQuestion({...currentQuestion, options: newOpts});
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Time Limit (sec)</label>
                            <Input 
                                type="number"
                                className="bg-white"
                                value={currentQuestion.timeLimit}
                                onChange={e => setCurrentQuestion({...currentQuestion, timeLimit: parseInt(e.target.value) || 60})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Explanation</label>
                            <Input 
                                className="bg-white"
                                placeholder="Why is this correct?"
                                value={currentQuestion.explanation}
                                onChange={e => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                            />
                        </div>
                    </div>

                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3 border-orange-300 text-orange-700 hover:bg-orange-50"
                      onClick={handleAddQuestion}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Question to Quiz
                    </Button>
                  </div>

                  {quiz.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500">{quiz.length} Questions staged</p>
                      {quiz.map((q, i) => (
                        <div key={i} className="flex justify-between items-center text-xs p-2 bg-green-50 rounded border border-green-100">
                          <span className="truncate flex-1">Q{i+1}: {q.question}</span>
                          <XCircle 
                            className="h-3 w-3 text-red-400 cursor-pointer ml-2" 
                            onClick={() => setQuiz(quiz.filter((_, idx) => idx !== i))}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button className="w-full h-12 shadow-md mt-6" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Publish Lesson"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
