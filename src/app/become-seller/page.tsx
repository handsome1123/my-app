'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function BecomeSellerPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        router.push('/login');
      }
    };
    getUser();
  }, [router]);

  const uploadIdDocument = async (file: File) => {
    if (!userId) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/id_document.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('seller-documents')
      .upload(fileName, file, { upsert: true });

    if (error) throw error;
    return data?.path || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setMessage('You must be logged in');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      let idDocPath = null;

      if (idDocument) {
        idDocPath = await uploadIdDocument(idDocument);
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: fullName,
          role: 'pending_seller',
          id_document_path: idDocPath,
        })
        .eq('id', userId);

      if (error) {
        setMessage('Error submitting request: ' + error.message);
      } else {
        setMessage('Your request to become a seller has been submitted.');
        setTimeout(() => router.push('/profile'), 3000);
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage('Upload failed: ' + error.message);
      } else {
        setMessage('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Become a Seller</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block mb-1 font-medium">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label htmlFor="idDocument" className="block mb-1 font-medium">
            Upload ID Document (optional)
          </label>
          <input
            id="idDocument"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => setIdDocument(e.target.files ? e.target.files[0] : null)}
            className="w-full"
          />
        </div>

        {message && <p className="text-sm text-red-600">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
