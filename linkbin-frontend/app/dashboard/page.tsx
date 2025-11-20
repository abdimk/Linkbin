"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Link {
  id: string;
  title: string;
  url: string;
}

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then((res) => {
      if (!res.data.session) router.push("/login");
      else setSession(res.data.session);
    });
  }, []);

  useEffect(() => {
    if (session) fetchLinks();
  }, [session]);

  const fetchLinks = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/links`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      setLinks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const addLink = async () => {
    if (!title || !url) return alert("Fill both fields");
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/links`,
        { title, url },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      setTitle("");
      setUrl("");
      fetchLinks();
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Links</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border p-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addLink}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Add
          </button>
        </div>

        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.id} className="p-2 border rounded hover:bg-gray-100 transition">
              <a href={link.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                {link.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
