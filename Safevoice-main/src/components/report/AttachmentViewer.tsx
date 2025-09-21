import { useState } from 'react';
import { FileIcon, PlayIcon, ImageIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AttachmentViewerProps {
  attachment: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
    uploadedAt: Date;
  };
}

export const AttachmentViewer = ({ attachment }: AttachmentViewerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getFileUrl = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return '';
    }

    try {
      // Verify token is properly formatted
      const [header, payload, signature] = token.split('.');
      if (!header || !payload || !signature) {
        console.error('Invalid token format');
        return '';
      }

      const filename = encodeURIComponent(attachment.filename);
      const url = `http://localhost:5000/api/uploads/files/${filename}?token=${token}`;
      console.log('Requesting file:', filename);
      return url;
    } catch (error) {
      console.error('Error processing token:', error);
      return '';
    }
  };

  // Handle different file types
  const renderAttachment = () => {
    if (attachment.mimetype.startsWith('image/')) {
      return (
        <div className="relative w-full max-w-md overflow-hidden rounded-lg">
          <img 
            src={getFileUrl()} 
            alt={attachment.originalName}
            className="w-full h-auto object-contain"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yNCAyNGgtMjR2LTI0aDI0djI0em0tMi0yMmgtMjB2MjBoMjB2LTIwem0tNC41IDEzLjVsLTMuNS0zLjUtMy41IDMuNS0yLjUtMi41LTIuNSAyLjV2NGgxNnYtNGwtNC01em0tOS41LTUuNWMxLjEwNSAwIDItLjg5NSAyLTJzLS44OTUtMi0yLTItMiAuODk1LTIgMiAuODk1IDIgMiAyeiIvPjwvc3ZnPg==';
            }}
          />
        </div>
      );
    }

    if (attachment.mimetype.startsWith('audio/')) {
      return (
        <div className="w-full max-w-md">
          <audio
            controls
            className="w-full"
            src={getFileUrl()}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }

    if (attachment.mimetype.startsWith('video/')) {
      return (
        <div className="w-full max-w-md">
          <video
            controls
            className="w-full rounded-lg"
            src={getFileUrl()}
          >
            Your browser does not support the video element.
          </video>
        </div>
      );
    }

    // Default file view
    return (
      <div className="flex items-center gap-2">
        <FileIcon className="h-6 w-6" />
        <span>{attachment.originalName}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(getFileUrl(), '_blank')}
        >
          Download
        </Button>
      </div>
    );
  };

  return (
    <Card className="p-4">
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        renderAttachment()
      )}
      <div className="mt-2 text-sm text-gray-500">
        {new Date(attachment.uploadedAt).toLocaleString()}
      </div>
    </Card>
  );
};