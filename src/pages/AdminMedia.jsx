import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Upload, Image as ImageIcon, Copy, Check, X, Search, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminMedia() {
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
    loadUploadedFiles();
  }, []);

  const checkAdmin = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        navigate(createPageUrl("Home"));
        return;
      }

      const userData = await base44.auth.me();
      if (userData.role !== 'admin') {
        alert("Access Denied: Admin privileges required");
        navigate(createPageUrl("Home"));
        return;
      }

      setUser(userData);
    } catch (error) {
      console.error("Auth check failed:", error);
      navigate(createPageUrl("Home"));
    }
  };

  const loadUploadedFiles = () => {
    const stored = localStorage.getItem('uploaded_media_files');
    if (stored) {
      setUploadedFiles(JSON.parse(stored));
    }
  };

  const saveUploadedFiles = (files) => {
    localStorage.setItem('uploaded_media_files', JSON.stringify(files));
    setUploadedFiles(files);
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    setUploading(true);
    const newFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await base44.integrations.Core.UploadFile({ file });
        newFiles.push({
          id: Date.now() + i,
          name: file.name,
          url: result.file_url,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error("Upload failed:", error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    const allFiles = [...newFiles, ...uploadedFiles];
    saveUploadedFiles(allFiles);
    setUploading(false);
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const deleteFile = (id) => {
    if (window.confirm("Delete this file? This won't delete it from storage but removes it from this list.")) {
      const filtered = uploadedFiles.filter(f => f.id !== id);
      saveUploadedFiles(filtered);
    }
  };

  const toggleSelectFile = (id) => {
    if (selectedFiles.includes(id)) {
      setSelectedFiles(selectedFiles.filter(fid => fid !== id));
    } else {
      setSelectedFiles([...selectedFiles, id]);
    }
  };

  const deleteSelected = () => {
    if (window.confirm(`Delete ${selectedFiles.length} selected files?`)) {
      const filtered = uploadedFiles.filter(f => !selectedFiles.includes(f.id));
      saveUploadedFiles(filtered);
      setSelectedFiles([]);
    }
  };

  const filteredFiles = uploadedFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("AdminDashboard")}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
              <p className="text-gray-600">Upload and manage images & files</p>
            </div>
          </div>
          {selectedFiles.length > 0 && (
            <Button onClick={deleteSelected} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {selectedFiles.length} Selected
            </Button>
          )}
        </div>

        {/* Upload Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Upload Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-4 border-dashed rounded-xl p-12 text-center transition-all ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploading ? (
                <div>
                  <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Uploading...</p>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Drag & Drop Files Here
                  </h3>
                  <p className="text-gray-600 mb-4">
                    or click to browse (supports multiple files)
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-input"
                    accept="image/*,audio/*,video/*"
                  />
                  <label htmlFor="file-input">
                    <Button type="button" className="cursor-pointer" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                      </span>
                    </Button>
                  </label>
                  <p className="text-sm text-gray-500 mt-4">
                    Supported: Images, Audio, Video files
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search & Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-600">
              {filteredFiles.length} files
            </div>
          </div>
        </div>

        {/* Uploaded Files Grid */}
        {filteredFiles.length === 0 ? (
          <Card className="p-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">
              {uploadedFiles.length === 0 
                ? "No files uploaded yet. Upload your first file above!"
                : "No files match your search."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className={`hover:shadow-lg transition-all cursor-pointer ${
                    selectedFiles.includes(file.id) ? 'ring-2 ring-blue-500' : ''
                  }`}>
                    <CardContent className="p-0">
                      {/* Image Preview */}
                      <div 
                        className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden"
                        onClick={() => toggleSelectFile(file.id)}
                      >
                        {file.type?.startsWith('image/') ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : file.type?.startsWith('audio/') ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-6xl">🎵</div>
                          </div>
                        ) : file.type?.startsWith('video/') ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-6xl">🎬</div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-6xl">📄</div>
                          </div>
                        )}
                        {selectedFiles.includes(file.id) && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="p-4">
                        <p className="font-semibold text-sm mb-2 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          {(file.size / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>

                        {/* URL Display */}
                        <div className="flex items-center gap-2 mb-3">
                          <Input
                            value={file.url}
                            readOnly
                            className="text-xs flex-1"
                            onClick={(e) => e.target.select()}
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => copyToClipboard(file.url)}
                          >
                            {copiedUrl === file.url ? (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 mr-1" />
                                Copy URL
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteFile(file.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Usage Instructions */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-3">💡 How to Use Uploaded Files</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>1. <strong>Copy the URL</strong> from any file above</p>
              <p>2. <strong>Paste it</strong> into Story Image URL, Audio URL, or Video fields</p>
              <p>3. The file will be displayed in your content</p>
              <p>4. <strong>Tip:</strong> Upload images for stories, audio for lessons, videos for tutorials</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}