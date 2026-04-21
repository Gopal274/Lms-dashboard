import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Plus, Edit, Trash, PlayCircle, BookOpen } from "lucide-react";
import api from "../../lib/api";
import { Link } from "react-router-dom";

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get("/course/get-all-courses");
      setCourses(data.courses);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        const { data } = await api.delete(`/delete-course/${id}`);
        if (data.success) {
          alert("Course deleted successfully");
          fetchCourses();
        }
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete course");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-500 mt-2">Create and organize your educational content.</p>
        </div>
        <Link to="/dashboard/courses/new">
          <Button size="lg" className="rounded-full shadow-lg">
            <Plus className="mr-2 h-5 w-5" /> Create New Course
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course._id} className="overflow-hidden group hover:shadow-md transition-shadow">
            <div className="aspect-video relative bg-gray-100 overflow-hidden">
              <img 
                src={course.thumbnail?.url || "https://via.placeholder.com/400x225"} 
                alt={course.name}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded text-xs font-bold shadow-sm ${
                  course.isPublished ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                }`}>
                  {course.isPublished ? 'PUBLISHED' : 'DRAFT'}
                </span>
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="line-clamp-1">{course.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                {course.description}
              </p>
              <div className="flex items-center text-xs text-gray-400 space-x-4 mb-6">
                <div className="flex items-center">
                  <PlayCircle className="h-4 w-4 mr-1" />
                  {course.courseData?.length || 0} Lessons
                </div>
                <div className="flex items-center">
                  <Plus className="h-4 w-4 mr-1" />
                  {course.price === 0 ? 'Free' : `$${course.price}`}
                </div>
              </div>
              <div className="flex space-x-2">
                <Link to={`/dashboard/courses/${course._id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" /> Manage
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                  onClick={() => handleDelete(course._id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && courses.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
          <p className="text-gray-500 mt-1">Get started by creating your first course.</p>
          <Link to="/dashboard/courses/new">
            <Button variant="outline" className="mt-6">Create New Course</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
