import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Loader2, ArrowLeft, Plus, Trash } from "lucide-react";
import api from "../../lib/api";

export default function CreateCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    estimatedPrice: "",
    tags: "",
    level: "Beginner",
    demoUrl: "",
    thumbnail: "",
    benefits: [{ title: "" }],
    prerequisites: [{ title: "" }],
  });

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setFormData({ ...formData, thumbnail: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBenefitChange = (index, value) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index].title = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const addBenefit = () => {
    setFormData({ ...formData, benefits: [...formData.benefits, { title: "" }] });
  };

  const removeBenefit = (index) => {
    const newBenefits = formData.benefits.filter((_, i) => i !== index);
    setFormData({ ...formData, benefits: newBenefits });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/course/create-course", formData);
      navigate("/dashboard/courses");
    } catch (err) {
      alert("Creation failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <Button variant="ghost" onClick={() => navigate("/dashboard/courses")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Course</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Course Name</label>
                <Input 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Full Stack Web Development"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Tags</label>
                <Input 
                  value={formData.tags}
                  onChange={e => setFormData({...formData, tags: e.target.value})}
                  placeholder="React, Node, MongoDB"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Description</label>
              <textarea 
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Detailed course description..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Price ($)</label>
                <Input 
                  type="number"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Level</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.level}
                  onChange={e => setFormData({...formData, level: e.target.value})}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Expert</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Thumbnail</label>
                <Input type="file" accept="image/*" onChange={handleThumbnailChange} required />
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold">Demo Video URL (Cloudinary/YouTube)</label>
                <Input 
                  value={formData.demoUrl}
                  onChange={e => setFormData({...formData, demoUrl: e.target.value})}
                  placeholder="Paste URL here"
                  required
                />
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <label className="text-sm font-semibold">What will students learn?</label>
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    value={benefit.title}
                    onChange={e => handleBenefitChange(index, e.target.value)}
                    placeholder="Enter benefit"
                    required
                  />
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeBenefit(index)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addBenefit}>
                <Plus className="h-4 w-4 mr-2" /> Add Benefit
              </Button>
            </div>

            <Button className="w-full h-12 text-lg font-bold" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Publish Course"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
