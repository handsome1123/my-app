"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, CheckCircle, XCircle } from "lucide-react";

interface Profile {
  name: string;
  email: string;
  phone?: string;
  isVerified?: boolean;
  bankInfo?: { bankName: string; accountNumber: string };
}

export default function BuyerProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { router.replace("/login"); return; }
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/buyer/profile", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!mounted) return;
        if (res.ok) setProfile(data);
        else setError(data.error || "Failed to load profile");
      } catch {
        if (mounted) setError("Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value } as Profile);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch("/api/buyer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok) { setProfile(data); alert("Profile updated"); }
      else setError(data.error || "Failed to save");
    } catch {
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center text-red-600">Unable to load profile</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-full"><Users className="text-blue-600" /></div>
          <div>
            <h1 className="text-xl font-semibold">{profile.name}</h1>
            <div className="text-sm text-gray-500">Manage your account</div>
          </div>
          <div className="ml-auto">
            <span className={`inline-flex items-center gap-2 text-sm font-medium ${profile.isVerified ? 'text-green-700' : 'text-yellow-700'}`}>
              {profile.isVerified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {profile.isVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <label className="block">
            <span className="text-sm text-gray-700">Full name</span>
            <input name="name" value={profile.name} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Email</span>
            <input name="email" value={profile.email} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Phone</span>
            <input name="phone" value={profile.phone || ""} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
          </label>

          <div className="flex gap-3 mt-2">
            <button disabled={saving} onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button onClick={() => router.push("/buyer/dashboard")} className="px-4 py-2 border rounded">Back</button>
          </div>

          {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
        </div>
      </div>
    </div>
  );
}
