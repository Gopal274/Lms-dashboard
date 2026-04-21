import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Loader2, BookOpen, Clock, Users, Layers } from "lucide-react";
import { Link } from "react-router-dom";

export default function TeacherBatches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchMyBatches();
  }, []);

  const fetchMyBatches = async () => {
    try {
      const { data } = await api.get("/batch/get-batches");
      if (data.success) {
        // Filter batches where this teacher is assigned to at least one subject
        const myBatches = data.batches.filter(batch => 
          batch.subjects.some(subject => subject.teacherId === user._id)
        );
        setBatches(myBatches);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Batches</h1>
        <p className="text-gray-500">Manage your assigned subjects and students in these batches.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {batches.map((batch) => (
          <Card key={batch._id} className="overflow-hidden border-t-4 border-t-primary">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-bold">{batch.name}</CardTitle>
                <Badge variant="outline">{batch.duration}</Badge>
              </div>
              <CardDescription className="line-clamp-2 mt-2">
                {batch.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-500">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>
                    Your Subjects: {batch.subjects
                      .filter(s => s.teacherId === user._id)
                      .map(s => s.title)
                      .join(", ")}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="mr-2 h-4 w-4" />
                  <span>{batch.purchased} Students Enrolled</span>
                </div>
                
                <div className="pt-4 flex gap-2">
                  <Button asChild className="flex-1">
                    <Link to={`/dashboard/teacher/batch/${batch._id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <Link to={`/dashboard/teacher/resources?batch=${batch._id}`}>
                      Add DPP
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {batches.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-lg border-2 border-dashed">
            <Layers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">No Batches Assigned</h3>
            <p className="text-gray-500">Contact Admin to assign you to a batch.</p>
          </div>
        )}
      </div>
    </div>
  );
}
