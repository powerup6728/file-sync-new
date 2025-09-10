import { useState, useEffect, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FileType } from '@/lib/types';
import {
  Upload,
  Trash2,
  File as FileIcon,
  Image as ImageIcon,
  FileText,
  Code,
  MoreHorizontal,
} from 'lucide-react';
import { format } from 'date-fns';

const API_URL = 'http://localhost:3001';

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getFileIcon(mimetype: string) {
  if (mimetype.startsWith('image/')) {
    return <ImageIcon className="h-5 w-5 text-muted-foreground" />;
  }
  if (mimetype === 'application/pdf') {
    return <FileText className="h-5 w-5 text-muted-foreground" />;
  }
  if (mimetype.startsWith('text/')) {
    return <FileText className="h-5 w-5 text-muted-foreground" />;
  }
  if (
    mimetype === 'application/javascript' ||
    mimetype === 'application/json' ||
    mimetype.includes('xml')
  ) {
    return <Code className="h-5 w-5 text-muted-foreground" />;
  }
  return <FileIcon className="h-5 w-5 text-muted-foreground" />;
}

type UploadState = {
  [key: string]: {
    progress: number;
    file: File;
  };
};

export function FileExplorer() {
  const [files, setFiles] = useState<FileType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploads, setUploads] = useState<UploadState>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/files`);
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    Array.from(selectedFiles).forEach((file) => {
      const uniqueId = `${file.name}-${file.lastModified}-${file.size}`;

      setUploads((prev) => ({
        ...prev,
        [uniqueId]: { progress: 0, file },
      }));

      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/api/upload`, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploads((prev) => {
            if (!prev[uniqueId]) return prev;
            return {
              ...prev,
              [uniqueId]: { ...prev[uniqueId], progress },
            };
          });
        }
      };

      xhr.onload = () => {
        setUploads((prev) => {
          const newUploads = { ...prev };
          delete newUploads[uniqueId];
          return newUploads;
        });

        if (xhr.status === 201) {
          fetchFiles();
        } else {
          console.error(`Upload failed for ${file.name}: ${xhr.statusText}`);
        }
      };

      xhr.onerror = () => {
        console.error(`Network error during upload for ${file.name}`);
        setUploads((prev) => {
          const newUploads = { ...prev };
          delete newUploads[uniqueId];
          return newUploads;
        });
      };

      xhr.send(formData);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/api/files/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchFiles();
      } else {
        console.error('Delete failed');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const hasUploads = Object.keys(uploads).length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">My Files</h1>
        <Button onClick={handleUploadClick}>
          <Upload className="mr-2 h-4 w-4" /> Upload Files
        </Button>
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />
      </div>

      {hasUploads && (
        <div className="mb-4 p-4 border rounded-lg bg-muted/40">
          <h2 className="text-md font-semibold mb-2">Uploading Files...</h2>
          <div className="space-y-3">
            {Object.entries(uploads).map(([id, { file, progress }]) => (
              <div key={id}>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="font-medium truncate pr-4">{file.name}</span>
                  <span className="text-muted-foreground">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden flex-grow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Date Modified</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Loading files...
                </TableCell>
              </TableRow>
            ) : files.length === 0 && !hasUploads ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No files found. Upload your first file!
                </TableCell>
              </TableRow>
            ) : (
              files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>{getFileIcon(file.mimetype)}</TableCell>
                  <TableCell className="font-medium">{file.name}</TableCell>
                  <TableCell>
                    {format(new Date(file.createdAt), 'PP pp')}
                  </TableCell>
                  <TableCell>{formatBytes(file.size)}</TableCell>
                  <TableCell className="text-right">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More actions</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-1" align="end">
                        <div className="flex flex-col">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full justify-start font-normal px-2 py-1.5 h-auto"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto"
                              align="end"
                              sideOffset={8}
                            >
                              <div className="flex flex-col space-y-2 text-center p-2">
                                <p className="text-sm font-medium">
                                  Are you sure?
                                </p>
                                <p className="text-xs text-muted-foreground px-2">
                                  This action cannot be undone.
                                </p>
                                <div className="flex justify-center gap-2 pt-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(file.id)}
                                    className="w-full"
                                  >
                                    Confirm Delete
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
