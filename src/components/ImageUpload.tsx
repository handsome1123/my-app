'use client';

import { useState } from 'react';
import { UploadButton } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

type Props = {
  onUploadComplete: (url: string) => void;
};

export function ImageUpload({ onUploadComplete }: Props) {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start space-y-2">
      <UploadButton<OurFileRouter>
        endpoint="productImage"
        onUploadBegin={() => {
          setUploading(true);
          setSuccess(false);
          setError(null);
        }}
        onClientUploadComplete={(res) => {
          setUploading(false);
          if (res && res.length > 0) {
            setSuccess(true);
            onUploadComplete(res[0].url);
          }
        }}
        onUploadError={(err: Error) => {
          setUploading(false);
          setError(err.message || 'Upload failed');
        }}
        appearance={{
          button: `bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded transition disabled:opacity-50`,
        }}
      />

      {uploading && (
        <p className="text-sm text-blue-600 animate-pulse">Uploading...</p>
      )}

      {success && (
        <p className="text-sm text-green-600">✅ Upload successful!</p>
      )}

      {error && (
        <p className="text-sm text-red-500">❌ {error}</p>
      )}
    </div>
  );
}
