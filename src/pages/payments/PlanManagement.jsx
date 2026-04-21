import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { 
  Loader2, 
  Plus, 
  Trash2, 
  CheckCircle,
  CreditCard,
  Crown,
  ShieldCheck
} from "lucide-react";
import api from "../../lib/api";
import { Badge } from "../../components/ui/badge";

export default function PlanManagement() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    price: 0,
    durationInMonths: 12,
    tier: "basic",
    features: ["Access to all courses", "Downloadable materials"]
  });

  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await api.get("/subscription/get-active-plans");
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (e) {
      alert("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setNewPlan({...newPlan, features: [...newPlan.features, featureInput]});
    setFeatureInput("");
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/subscription/create-plan", newPlan);      alert("Plan created successfully!");
      setNewPlan({
        name: "",
        description: "",
        price: 0,
        durationInMonths: 12,
        tier: "basic",
        features: ["Access to all courses", "Downloadable materials"]
      });
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'pro': return <Crown className="h-5 w-5 text-orange-500" />;
      case 'basic': return <ShieldCheck className="h-5 w-5 text-blue-500" />;
      default: return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-gray-500">Manage your membership tiers and pricing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Plans List */}
        <div className="lg:col-span-2 space-y-4">
          {plans.map((plan) => (
            <Card key={plan._id} className="overflow-hidden border-l-4" style={{ borderLeftColor: plan.tier === 'pro' ? '#f97316' : '#3b82f6' }}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="bg-gray-50 p-3 rounded-2xl h-fit">
                      {getTierIcon(plan.tier)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <Badge variant="outline" className="uppercase text-[10px]">{plan.tier}</Badge>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
                      <div className="flex gap-4 mt-4">
                        <div className="text-2xl font-black text-primary">₹{plan.price}</div>
                        <div className="text-gray-400 self-end text-sm mb-1">/ {plan.durationInMonths} Months</div>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle className="h-3 w-3 text-green-500" /> {f}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {plans.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed text-gray-400 italic">
                  No plans created yet.
              </div>
          )}
        </div>

        {/* Create Plan Form */}
        <Card className="h-fit sticky top-8">
          <CardHeader>
            <CardTitle>Create New Plan</CardTitle>
            <CardDescription>Define a new membership tier</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Plan Name</label>
                <Input 
                  placeholder="e.g. Pro Annual Membership"
                  value={newPlan.name}
                  onChange={e => setNewPlan({...newPlan, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Description</label>
                <Textarea 
                  placeholder="What's included in this plan?"
                  value={newPlan.description}
                  onChange={e => setNewPlan({...newPlan, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Price (₹)</label>
                  <Input 
                    type="number"
                    value={newPlan.price}
                    onChange={e => setNewPlan({...newPlan, price: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Months</label>
                  <Input 
                    type="number"
                    value={newPlan.durationInMonths}
                    onChange={e => setNewPlan({...newPlan, durationInMonths: parseInt(e.target.value) || 12})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Tier</label>
                <select 
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={newPlan.tier}
                  onChange={e => setNewPlan({...newPlan, tier: e.target.value})}
                >
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                </select>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Features</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add feature..."
                    value={featureInput}
                    onChange={e => setFeatureInput(e.target.value)}
                  />
                  <Button type="button" size="icon" onClick={handleAddFeature}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newPlan.features.map((f, i) => (
                    <Badge key={i} variant="secondary" className="pr-1">
                      {f} <Trash2 className="h-3 w-3 ml-1 text-red-500 cursor-pointer" onClick={() => setNewPlan({...newPlan, features: newPlan.features.filter((_, idx) => idx !== i)})} />
                    </Badge>
                  ))}
                </div>
              </div>

              <Button className="w-full h-12 mt-6 shadow-md" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Publish Plan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
