"use client";

import { useEffect, useState } from "react";

interface PDFViewerProps {
  pdfUrl: string | null;
}

export default function PDFViewer({ pdfUrl }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pdfUrl) {
      setLoading(false);
    }
  }, [pdfUrl]);

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No PDF available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Loading PDF...</p>
        </div>
      )}
      <iframe
        src={pdfUrl}
        className="w-full h-full border-0"
        title="Invoice PDF"
      />
    </div>
  );
}
