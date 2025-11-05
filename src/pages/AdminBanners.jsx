import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminBanners() {
  const [user, setUser] = useState(null);
  const [banners, setBanners] = useState([]);
  const [editingBanner, setEditingBanner] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    text: "",
    subtext: "",
    gradient: "from-blue-600 via-purple-600 to-pink-600",
    active: true,
    order: 1
  });

  useEffect(() => {
    checkAdmin();
    loadBanners();
  }, []);

  const checkAdmin = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        navigate(createPageUrl("Home"));
        return;
      }

      const userData = await base44.auth.me();
      if (userData.role !== 'admin') {
        navigate(createPageUrl("Home"));
        return;
      }

      setUser(userData);
    } catch (error) {
      navigate(createPageUrl("Home"));
    }
  };

  const loadBanners = () => {
    const stored = localStorage.getItem('homepage_banners');
    if (stored) {
      setBanners(JSON.parse(stored));
    } else {
      // Default banners
      const defaultBanners = [
        {
          id: 1,
          text: "Welcome to Islam Kids Zone",
          subtext: "Learn, Play & Grow in Faith",
          gradient: "from-blue-600 via-purple-600 to-pink-600",
          active: true,
          order: 1
        },
        {
          id: 2,
          text: "\"Whoever guides someone to goodness will have a reward like one who did it.\"",
          subtext: "— Sahih Muslim",
          gradient: "from-green-600 via-teal-600 to-cyan-600",
          active: true,
          order: 2
        }
      ];
      setBanners(defaultBanners);
      saveBanners(defaultBanners);
    }
  };

  const saveBanners = (bannersData) => {
    localStorage.setItem('homepage_banners', JSON.stringify(bannersData));
    setBanners(bannersData);
  };

  const resetForm = () => {
    setFormData({
      text: "",
      subtext: "",
      gradient: "from-blue-600 via-purple-600 to-pink-600",
      active: true,
      order: 1
    });
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData(banner);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingBanner) {
      const updated = banners.map(b => b.id === editingBanner.id ? { ...formData, id: b.id } : b);
      saveBanners(updated);
    } else {
      const newBanner = { ...formData, id: Date.now() };
      saveBanners([...banners, newBanner]);
    }

    setShowForm(false);
    setEditingBanner(null);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this banner?")) {
      saveBanners(banners.filter(b => b.id !== id));
    }
  };

  const toggleActive = (id) => {
    const updated = banners.map(b => b.id === id ? { ...b, active: !b.active } : b);
    saveBanners(updated);
  };

  const gradientPresets = [
    { name: "Blue Purple", value: "from-blue-600 via-purple-600 to-pink-600" },
    { name: "Green Teal", value: "from-green-600 via-teal-600 to-cyan-600" },
    { name: "Orange Red", value: "from-amber-600 via-orange-600 to-red-600" },
    { name: "Purple Pink", value: "from-purple-600 via-pink-600 to-rose-600" },
    { name: "Indigo Blue", value: "from-indigo-600 via-blue-600 to-cyan-600" }
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("AdminDashboard")}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Homepage Banners</h1>
              <p className="text-gray-600">Manage rotating homepage banner slides</p>
            </div>
          </div>
          <Button onClick={() => { setShowForm(true); setEditingBanner(null); resetForm(); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Banner
          </Button>
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b p-6 z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                      {editingBanner ? "Edit Banner" : "Create Banner"}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                      <X className="w-6 h-6" />
                    </Button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Main Text *</label>
                    <Input
                      value={formData.text}
                      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                      required
                      placeholder="Welcome message or quote"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Subtext</label>
                    <Input
                      value={formData.subtext}
                      onChange={(e) => setFormData({ ...formData, subtext: e.target.value })}
                      placeholder="Optional subtitle or attribution"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Gradient Style</label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {gradientPresets.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, gradient: preset.value })}
                          className={`p-3 rounded-lg bg-gradient-to-r ${preset.value} text-white text-sm font-semibold ${
                            formData.gradient === preset.value ? 'ring-4 ring-blue-500' : ''
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Display Order</label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-semibold">Active</span>
                    <Switch
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                    />
                  </div>

                  {/* Preview */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Preview</label>
                    <div className={`p-8 rounded-xl bg-gradient-to-r ${formData.gradient} text-white text-center`}>
                      <h3 className="text-2xl font-bold mb-2">{formData.text || "Your text here"}</h3>
                      {formData.subtext && <p className="text-white/90">{formData.subtext}</p>}
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end border-t pt-6">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      {editingBanner ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Banners List */}
        <div className="space-y-4">
          {banners.sort((a, b) => a.order - b.order).map((banner) => (
            <Card key={banner.id} className={!banner.active ? 'opacity-50' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className={`p-6 rounded-xl bg-gradient-to-r ${banner.gradient} text-white mb-4`}>
                      <h3 className="text-xl font-bold mb-1">{banner.text}</h3>
                      {banner.subtext && <p className="text-sm text-white/90">{banner.subtext}</p>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Order: {banner.order}</span>
                      <span>•</span>
                      <span>{banner.active ? '✅ Active' : '❌ Inactive'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleActive(banner.id)}>
                      {banner.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" onClick={() => handleEdit(banner)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(banner.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {banners.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-600 mb-4">No banners created yet</p>
            <Button onClick={() => setShowForm(true)}>Create First Banner</Button>
          </Card>
        )}
      </div>
    </div>
  );
}