import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Trash2, Plus, CheckCircle2, XCircle } from "lucide-react";

export default function MCQCreator({ questions, setQuestions }) {
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
        marks: 4
      }
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestionText = (index, text) => {
    const newQuestions = [...questions];
    newQuestions[index].question = text;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, oIndex, text) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = text;
    setQuestions(newQuestions);
  };

  const updateCorrectAnswer = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswer = oIndex;
    setQuestions(newQuestions);
  };

  const updateExplanation = (qIndex, text) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].explanation = text;
    setQuestions(newQuestions);
  };

  return (
    <div className="space-y-6">
      {questions.map((q, qIndex) => (
        <Card key={qIndex} className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
          <div className="absolute top-4 right-4 flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => removeQuestion(qIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <CardContent className="pt-6">
            <div className="flex gap-4 mb-4">
               <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-primary shrink-0">
                  {qIndex + 1}
               </div>
               <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-500">Question Text</label>
                    <textarea 
                      className="w-full min-h-[80px] p-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Enter your question here..."
                      value={q.question}
                      onChange={e => updateQuestionText(qIndex, e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className={`relative flex items-center p-1 rounded-xl border-2 transition-all ${
                        q.correctAnswer === oIndex ? "border-green-500 bg-green-50" : "border-gray-100 bg-gray-50"
                      }`}>
                         <div className="flex-1 flex items-center gap-3">
                           <span className="w-6 h-6 flex items-center justify-center bg-white rounded-lg border text-[10px] font-black">
                              {String.fromCharCode(65 + oIndex)}
                           </span>
                           <input 
                             className="bg-transparent text-sm font-medium w-full focus:outline-none"
                             placeholder={`Option ${oIndex + 1}`}
                             value={opt}
                             onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                           />
                         </div>
                         <Button 
                           variant="ghost" 
                           size="icon"
                           className={`rounded-full h-8 w-8 ${q.correctAnswer === oIndex ? "text-green-600" : "text-gray-300 hover:text-green-500"}`}
                           onClick={() => updateCorrectAnswer(qIndex, oIndex)}
                         >
                            {q.correctAnswer === oIndex ? <CheckCircle2 size={18} /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                         </Button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-500">Teacher's Explanation</label>
                      <Input 
                        className="bg-gray-50"
                        placeholder="Why is this answer correct?"
                        value={q.explanation}
                        onChange={e => updateExplanation(qIndex, e.target.value)}
                      />
                    </div>
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button 
        variant="outline" 
        className="w-full border-dashed border-2 py-8 hover:bg-gray-50 group"
        onClick={addQuestion}
      >
        <Plus className="mr-2 h-5 w-5 group-hover:scale-125 transition-transform" />
        Add New Question
      </Button>
    </div>
  );
}
