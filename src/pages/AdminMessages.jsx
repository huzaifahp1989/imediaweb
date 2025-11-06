import React from "react";
import { messagesApi } from "@/api/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminMessages() {
  const [messages, setMessages] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [filter, setFilter] = React.useState({ text: "", status: "all" });

  const loadMessages = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await messagesApi.list();
      setMessages(list);
    } catch (e) {
      console.error("Failed to load messages:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const toggleRead = async (id, read) => {
    try {
      await messagesApi.markRead(id, !read);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: !read } : m));
    } catch (e) {
      console.error("Failed to update read status:", e);
    }
  };

  const filtered = messages.filter(m => {
    const matchesStatus = filter.status === "all" ? true : (filter.status === "read" ? m.read : !m.read);
    const text = (filter.text || "").toLowerCase();
    const matchesText = !text || [m.name, m.email, m.subject, m.message].some(v => (v || "").toLowerCase().includes(text));
    return matchesStatus && matchesText;
  });

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4 items-center">
            <Input placeholder="Search by name, email, subject, message" value={filter.text} onChange={e => setFilter({ ...filter, text: e.target.value })} />
            <select className="border rounded px-2 py-2" value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            <Button variant="outline" onClick={loadMessages} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">Status</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Subject</th>
                  <th className="p-2">Message</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="border-b align-top">
                    <td className="p-2">{m.read ? "Read" : "Unread"}</td>
                    <td className="p-2">{m.name}</td>
                    <td className="p-2">{m.email}</td>
                    <td className="p-2">{m.subject}</td>
                    <td className="p-2 whitespace-pre-wrap max-w-xl">{m.message}</td>
                    <td className="p-2">{m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}</td>
                    <td className="p-2">
                      <Button size="sm" onClick={() => toggleRead(m.id, m.read)}>{m.read ? "Mark Unread" : "Mark Read"}</Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-500">No messages found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

