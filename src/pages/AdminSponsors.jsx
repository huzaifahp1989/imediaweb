import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Save, Trash2, Edit, X, ExternalLink, Image as ImageIcon, Brain } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { sponsorsApi, uploadSponsorImage, getFirebase } from "@/api/firebase";

export default function AdminSponsors() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    linkUrl: "",
    imageUrl: "",
    type: "sponsor", // sponsor | ad
    placement: "home", // currently only home used
    order: 0,
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [configured, setConfigured] = useState(false);

  const loadLocal = () => {
    try {
      const raw = localStorage.getItem("homepage_sponsors");
      const list = raw ? JSON.parse(raw) : [];
      setItems(Array.isArray(list) ? list : []);
    } catch {
      setItems([]);
    }
  };

  const saveLocal = (next) => {
    localStorage.setItem("homepage_sponsors", JSON.stringify(next));
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await sponsorsApi.list();
      setItems(list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    } catch (e) {
      console.warn("Sponsors list via Firestore failed, using localStorage", e?.message || e);
      loadLocal();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { app } = getFirebase();
    setConfigured(Boolean(app));
    load();
  }, []);

  const resetForm = () => {
    setForm({ name: "", linkUrl: "", imageUrl: "", type: "sponsor", placement: "home", order: items.length, active: true });
    setEditing(null);
    setError("");
  };

  const startEdit = (item) => {
    setEditing(item.id || item._localId);
    setForm({
      name: item.name || "",
      linkUrl: item.linkUrl || "",
      imageUrl: item.imageUrl || "",
      type: item.type || "sponsor",
      placement: item.placement || "home",
      order: item.order ?? 0,
      active: item.active ?? true,
    });
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        linkUrl: form.linkUrl.trim(),
        imageUrl: form.imageUrl.trim(),
        createdAt: new Date().toISOString(),
      };

      if (editing) {
        // update
        try {
          await sponsorsApi.update(editing, payload);
          await load();
        } catch (e) {
          // local fallback
          const next = items.map(it => (it.id === editing || it._localId === editing) ? { ...it, ...payload } : it);
          setItems(next);
          saveLocal(next);
        }
      } else {
        // create
        try {
          const res = await sponsorsApi.add(payload);
          const id = res?.id || Math.random().toString(36).slice(2);
          setItems(prev => [...prev, { id, ...payload }]);
        } catch (e) {
          // local fallback
          const localItem = { _localId: Math.random().toString(36).slice(2), ...payload };
          const next = [...items, localItem];
          setItems(next);
          saveLocal(next);
        }
      }
      resetForm();
    } catch (e) {
      setError(e?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Delete this item?")) return;
    setLoading(true);
    try {
      if (item.id) {
        try {
          await sponsorsApi.remove(item.id);
          await load();
        } catch (e) {
          const next = items.filter(it => it.id !== item.id);
          setItems(next);
          saveLocal(next);
        }
      } else {
        const next = items.filter(it => it._localId !== item._localId);
        setItems(next);
        saveLocal(next);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-xl border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2"><ExternalLink className="w-5 h-5"/> Manage Sponsors & Ads</span>
              <div className="flex items-center gap-2">
                <Link to={createPageUrl("Assistant")} className="text-white/90 hover:text-white">
                  <Button variant="ghost" className="text-white"><Brain className="w-4 h-4 mr-2"/> Open AI Agent</Button>
                </Link>
                <Link to={createPageUrl("AdminDashboard")} className="text-white/90 hover:text-white">
                  <Button variant="ghost" className="text-white"><ArrowLeft className="w-4 h-4 mr-2"/> Back to Dashboard</Button>
                </Link>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              {error && <div className="text-red-600">{error}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sponsor name" required />
                </div>
                <div>
                  <Label>Link URL</Label>
                  <Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://sponsor.com" type="url" required />
                </div>
                <div>
                  <Label>Logo/Image URL</Label>
                  <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://...logo.png" />
                </div>
                <div>
                  <Label>Upload Image (optional)</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <div className="text-xs text-gray-500 mt-1">
                    {configured ? 'Uploads go to Firebase Storage and auto-fill the Image URL.' : 'Upload disabled: configure Firebase env vars to enable Storage.'}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button type="button" variant="outline" disabled={!file || !configured || loading} onClick={async () => {
                      setError("");
                      if (!file) return;
                      try {
                        const res = await uploadSponsorImage(file, form.name || file.name);
                        setForm({ ...form, imageUrl: res.url });
                      } catch (e) {
                        setError(e?.message || 'Upload failed');
                      }
                    }}>Upload to Storage</Button>
                    {form.imageUrl && <a href={form.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">Preview</a>}
                  </div>
                </div>
                <div>
                  <Label>Type</Label>
                  <select className="border rounded px-3 py-2 w-full" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="sponsor">Sponsor</option>
                    <option value="ad">Ad</option>
                  </select>
                </div>
                <div>
                  <Label>Placement</Label>
                  <select className="border rounded px-3 py-2 w-full" value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })}>
                    <option value="home">Home</option>
                  </select>
                </div>
                <div>
                  <Label>Order</Label>
                  <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: Boolean(v) })} />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="bg-blue-600 text-white"><Save className="w-4 h-4 mr-2" /> {editing ? 'Update' : 'Add'} Item</Button>
                {editing && (
                  <Button type="button" variant="outline" onClick={resetForm}><X className="w-4 h-4 mr-2"/>Cancel</Button>
                )}
              </div>
            </form>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Current Items</h3>
                <Button variant="outline" onClick={resetForm}><Plus className="w-4 h-4 mr-2"/>New</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <div key={item.id || item._localId} className="border rounded-xl p-4 bg-white">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        {item.imageUrl ? (
                          <AdminImagePreview url={item.imageUrl} name={item.name} />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-blue-600 break-all"><a href={item.linkUrl} target="_blank" rel="noopener noreferrer">{item.linkUrl}</a></div>
                        <div className="text-xs text-gray-500 mt-1">Type: {item.type} · Placement: {item.placement} · Order: {item.order ?? 0} · Active: {item.active ? 'Yes' : 'No'}</div>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(item)}><Edit className="w-4 h-4 mr-1"/>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(item)}><Trash2 className="w-4 h-4 mr-1"/>Delete</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-gray-600">No sponsors or ads yet. Add your first above.</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminImagePreview({ url, name }) {
  const [error, setError] = React.useState(false);
  if (error) {
    return <ImageIcon className="w-8 h-8 text-gray-400" />;
  }
  return (
    <img
      src={url}
      alt={name || 'Sponsor'}
      className="object-contain w-full h-full"
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  );
}
