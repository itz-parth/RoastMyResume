import { useState, useCallback } from "react";
import axios from "axios";
import DropZone from "./DropZone";
import JobDescriptionCard from "./JobDescriptionCard";
import TrustBar from "./TrustBar";

const UploadSection = ({ onFileAnalyzed, setError }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [jobDescription, setJobDescription] = useState("");
  const [showJobField, setShowJobField] = useState(false);
  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
    return interval;
  };

  const handleAnalyze = useCallback(async (fileToUpload) => {
    if (!fileToUpload) return;

    const formData = new FormData();
    formData.append("file", fileToUpload);
    if (jobDescription.trim()) {
      formData.append("job_description", jobDescription);
    }

    try {
      setLoading(true);
      setError(null);
      setUploadProgress(0);

      const progressInterval = simulateProgress();

      const res = await axios.post("http://localhost:8000/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        onFileAnalyzed(res.data);
        setLoading(false);
        setUploadProgress(0);
      }, 400);
    } catch (e) {
      setLoading(false);
      setUploadProgress(0);
      const message =
        e.response?.data?.detail ||
        "Failed to analyze resume. Make sure the backend server is running.";
      setError(message);
    }
  }, [onFileAnalyzed, setError, jobDescription]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer?.files?.[0];
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];  
    if (allowedTypes.includes(droppedFile?.type)) {
      setFile(droppedFile);
      handleAnalyze(droppedFile);
    }
  }, [handleAnalyze]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      handleAnalyze(selected);
    }
  }, [handleAnalyze]);

  return (
    <section id="upload" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 animated-gradient-bg opacity-50" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary mb-4">
            Upload Your Resume
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            Drop your PDF below and let the AI recruiters work their magic.
          </p>
        </div>

        <DropZone
          file={file}
          loading={loading}
          dragActive={dragActive}
          uploadProgress={uploadProgress}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onFileSelect={handleFileSelect}
        />

        <JobDescriptionCard
          jobDescription={jobDescription}
          showJobField={showJobField}
          onToggle={() => setShowJobField(!showJobField)}
          onChange={setJobDescription}
        />

        <TrustBar />
      </div>
    </section>
  );
};

export default UploadSection;
