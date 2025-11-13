import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";

const DEFAULTS = {
  siteTitle: "Islam Kids Zone",
  tagline: "Learn, Play & Grow",
  logoEmoji: "🌙",
  headerGradient: "from-blue-600 to-purple-600",
  navActiveGradient: "from-blue-500 to-purple-500",
  backgroundGradient: "from-blue-50 via-purple-50 to-pink-50",
  darkModeDefault: false,
  showTestBanner: true,
  showRadioBar: true,
  // Backend-related defaults
  supportEmail: "imedia786@gmail.com",
  supportWhatsappNumber: "+971500000000",
  apiBaseUrl: "https://api.example.com",
  assetsCdnUrl: "https://cdn.example.com",
  radioUrl: "https://a4.asurahosting.com:7820/radio.mp3",
  maintenanceMode: false,
  enableAnalytics: false,
  enableMessages: true,
  cacheTtlSeconds: 600,
  recordingStudioText: "Welcome to Islam Media Central Recording Studio. Please record Quran recitation, nasheeds, or Islamic messages with clarity and respect.",
};

const GRADIENT_OPTIONS = [
  { label: "Blue → Purple", value: "from-blue-600 to-purple-600" },
  { label: "Purple → Pink", value: "from-purple-600 to-pink-600" },
  { label: "Teal → Cyan", value: "from-teal-600 to-cyan-600" },
  { label: "Rose → Orange", value: "from-rose-600 to-orange-600" },
  { label: "Slate → Gray", value: "from-slate-700 to-gray-700" },
];

const BG_OPTIONS = [
  { label: "Blue/Purple/Pink", value: "from-blue-50 via-purple-50 to-pink-50" },
  { label: "Teal/Cyan", value: "from-teal-50 via-cyan-50 to-blue-50" },
  { label: "Rose/Orange", value: "from-rose-50 via-orange-50 to-yellow-50" },
  { label: "Neutral", value: "from-gray-50 to-gray-100" },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupResult, setLookupResult] = useState("");
  const [delIdentifier, setDelIdentifier] = useState("");
  const [delResult, setDelResult] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("siteSettings");
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({ ...DEFAULTS, ...parsed });
      }
    } catch {}
  }, []);

  const saveSettings = () => {
    localStorage.setItem("siteSettings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className={`min-h-screen py-8 px-4 bg-gradient-to-br ${settings.backgroundGradient}`}>
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-xl border-2 border-blue-200">
          <CardHeader className={`text-white bg-gradient-to-r ${settings.headerGradient}`}>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-6 h-6" /> Site Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {saved && (
              <div className="p-2 rounded bg-green-50 text-green-700 text-sm">Settings saved</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Site Title</Label>
                <Input
                  value={settings.siteTitle}
                  onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label>Tagline</Label>
                <Input
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label>Logo Emoji</Label>
                <Input
                  value={settings.logoEmoji}
                  onChange={(e) => setSettings({ ...settings, logoEmoji: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <Label>Header Gradient</Label>
                <Select
                  value={settings.headerGradient}
                  onValueChange={(v) => setSettings({ ...settings, headerGradient: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gradient" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADIENT_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Active Nav Gradient</Label>
                <Select
                  value={settings.navActiveGradient}
                  onValueChange={(v) => setSettings({ ...settings, navActiveGradient: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gradient" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADIENT_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Background Gradient</Label>
                <Select
                  value={settings.backgroundGradient}
                  onValueChange={(v) => setSettings({ ...settings, backgroundGradient: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select background" />
                  </SelectTrigger>
                  <SelectContent>
                    {BG_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Dark Mode Default</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={settings.darkModeDefault}
                    onCheckedChange={(v) => setSettings({ ...settings, darkModeDefault: v })}
                  />
                  <span className="text-sm text-gray-600">Apply dark mode on load</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Show Test Mode Banner</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={settings.showTestBanner}
                    onCheckedChange={(v) => setSettings({ ...settings, showTestBanner: v })}
                  />
                  <span className="text-sm text-gray-600">Toggle info banner in Layout</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Show Radio Bar</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={settings.showRadioBar}
                    onCheckedChange={(v) => setSettings({ ...settings, showRadioBar: v })}
                  />
                  <span className="text-sm text-gray-600">Enable persistent radio player</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h2 className="text-xl font-semibold mb-4">Backend Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Support Email</Label>
                  <Input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Support WhatsApp Number</Label>
                  <Input
                    value={settings.supportWhatsappNumber}
                    onChange={(e) => setSettings({ ...settings, supportWhatsappNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label>API Base URL</Label>
                  <Input
                    value={settings.apiBaseUrl}
                    onChange={(e) => setSettings({ ...settings, apiBaseUrl: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">Non-secret; use env for sensitive keys.</p>
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label>Assets CDN URL</Label>
                  <Input
                    value={settings.assetsCdnUrl}
                    onChange={(e) => setSettings({ ...settings, assetsCdnUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label>Radio Stream URL</Label>
                  <Input
                    value={settings.radioUrl}
                    onChange={(e) => setSettings({ ...settings, radioUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label>Asma Audio Base URL (99 Names)</Label>
                  <Input
                    value={settings.asmaAudioBase || ''}
                    onChange={(e) => setSettings({ ...settings, asmaAudioBase: e.target.value })}
                    placeholder="e.g., /asma/ or https://cdn.example.com/asma/"
                  />
                  <p className="text-xs text-gray-500">Folder containing 1.mp3 .. 99.mp3. For local hosting, place files under <code>public/asma/</code> and set to <code>/asma/</code>. For GitHub Pages, use the full URL.</p>
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label>Asma Combined URL (single MP3)</Label>
                  <Input
                    value={settings.asmaCombinedUrl || ''}
                    onChange={(e) => setSettings({ ...settings, asmaCombinedUrl: e.target.value })}
                    placeholder="e.g., https://.../lyric-99-names.mp3"
                  />
                  <p className="text-xs text-gray-500">If you have one MP3 with all names, paste it here. The app will play segments using timestamps when Professional Audio is off.</p>
                </div>
                <div className="space-y-3">
                  <Label>Maintenance Mode</Label>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
                    />
                    <span className="text-sm text-gray-600">Show site-wide maintenance banner</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Enable Analytics</Label>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={settings.enableAnalytics}
                      onCheckedChange={(v) => setSettings({ ...settings, enableAnalytics: v })}
                    />
                    <span className="text-sm text-gray-600">Toggle client-side telemetry hooks</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Enable Messages</Label>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={settings.enableMessages}
                      onCheckedChange={(v) => setSettings({ ...settings, enableMessages: v })}
                    />
                    <span className="text-sm text-gray-600">Toggle AdminMessages/Netlify function usage</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Cache TTL (seconds)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.cacheTtlSeconds}
                    onChange={(e) => setSettings({ ...settings, cacheTtlSeconds: parseInt(e.target.value || 0, 10) })}
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label>Recording Studio Page Text</Label>
                  <Textarea
                    value={settings.recordingStudioText}
                    onChange={(e) => setSettings({ ...settings, recordingStudioText: e.target.value })}
                    className="min-h-[120px]"
                    placeholder="Write instructions, motivational messages, or Quran/Nasheed guidelines for users..."
                  />
                  <p className="text-xs text-gray-500">This appears at the top of the Recording Studio page.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button onClick={saveSettings}>Save Settings</Button>
              <Button
                variant="outline"
                onClick={() => setSettings(DEFAULTS)}
              >
                Reset to Defaults
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Stored locally for now. For production, persist in Firestore or your backend (Netlify functions), with secure server-side enforcement.</p>

            <div className="pt-8 border-t">
              <h2 className="text-xl font-semibold mb-4">Admin Auth Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-3">
                  <Label>Check if Auth Email Exists</Label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={async () => {
                      setLookupResult("");
                      try {
                        const { auth } = (await import("@/api/firebase")).getFirebase();
                        const token = await auth?.currentUser?.getIdToken?.();
                        if (!token) throw new Error("Admin login required");
                        const res = await fetch("/.netlify/functions/authLookup", {
                          method: "POST",
                          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ email: lookupEmail.trim().toLowerCase() }),
                        });
                        const data = await res.json().catch(() => ({}));
                        if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
                        setLookupResult(data.exists ? `Exists (uid: ${data.uid})` : "Not found in Auth");
                      } catch (e) {
                        setLookupResult(`Lookup failed: ${e.message || e}`);
                      }
                    }}
                  >
                    Check Email
                  </Button>
                </div>
              </div>
              {lookupResult && (
                <div className="mt-3 text-sm p-2 rounded border bg-white/60">
                  {lookupResult}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">Requires admin login and server-side verification. Useful when signup says "email already in use" but no user appears in Firestore.</p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-3">
                  <Label>Delete Test Account (Email or UID)</Label>
                  <Input
                    placeholder="user@example.com or UID"
                    value={delIdentifier}
                    onChange={(e) => setDelIdentifier(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      setDelResult("");
                      const id = delIdentifier.trim();
                      if (!id) { setDelResult("Provide email or UID"); return; }
                      try {
                        const { auth } = (await import("@/api/firebase")).getFirebase();
                        const token = await auth?.currentUser?.getIdToken?.();
                        if (!token) throw new Error("Admin login required");
                        const isEmail = /@/.test(id);
                        const res = await fetch("/.netlify/functions/deleteUser", {
                          method: "POST",
                          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                          body: JSON.stringify(isEmail ? { email: id.toLowerCase() } : { uid: id }),
                        });
                        const data = await res.json().catch(() => ({}));
                        if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
                        setDelResult(`Deleted: uid=${data.uid}${data.email ? `, email=${data.email}` : ''}`);
                      } catch (e) {
                        setDelResult(`Delete failed: ${e.message || e}`);
                      }
                    }}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
              {delResult && (
                <div className="mt-3 text-sm p-2 rounded border bg-white/60">
                  {delResult}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
