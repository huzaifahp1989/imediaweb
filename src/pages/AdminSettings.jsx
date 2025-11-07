import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
