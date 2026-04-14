'use client';

import { useRef, useState } from 'react';
import { useApplication } from '@/context/ApplicationContext';
import { useActivityStream } from '@/hooks/useActivityStream';
import { RequirementStatus } from '@/types/tasks';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  FileText,
  Sparkles,
} from 'lucide-react';
import {
  AI_EXTRACTION_MESSAGES,
  AI_VERIFIED_MESSAGES,
  DEMO_EXTRACTED_FIELDS,
} from '@/constants/documentMessages';

// ─── Status helpers ──────────────────────────────────────────────────────────

function getStatusIcon(status: RequirementStatus) {
  switch (status) {
    case 'verified':
      return <CheckCircle2 className="w-5 h-5" style={{ color: '#6CAD0A' }} />;
    case 'reviewing':
    case 'uploading':
      return <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#3126E3' }} />;
    case 'issue':
    case 'needs_update':
      return <AlertCircle className="w-5 h-5" style={{ color: '#E07900' }} />;
    default:
      return null;
  }
}

function getStatusLabel(status: RequirementStatus): string {
  switch (status) {
    case 'verified':
      return 'Verified';
    case 'reviewing':
      return 'LendWell checking...';
    case 'uploading':
      return 'Uploading...';
    case 'issue':
      return 'Issue detected';
    case 'needs_update':
      return 'Needs update';
    default:
      return '';
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

interface InlineDocumentPromptProps {
  requirementId: string;
  condition?: boolean;  // If false, component is hidden
  title?: string;       // Override default title
  description?: string; // Override default description
}

export function InlineDocumentPrompt({
  requirementId,
  condition = true,
  title,
  description,
}: InlineDocumentPromptProps) {
  const { state, updateRequirementStatus } = useApplication();
  const { triggerActivity } = useActivityStream();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localFile, setLocalFile] = useState<{ file: File; status: string; aiMessage?: string } | null>(null);

  // Don't render if condition is false
  if (!condition) return null;

  // Find the requirement
  const requirement = state.requirements?.find((r) => r.id === requirementId);
  if (!requirement) return null;

  const displayTitle = title || requirement.title;
  const displayDescription = description || requirement.description;
  const isComplete = requirement.status === 'verified';
  const isProcessing = requirement.status === 'reviewing' || requirement.status === 'uploading';

  // Handle file upload
  const handleFile = (file: File) => {
    setLocalFile({ file, status: 'uploading' });

    // Trigger background activity
    triggerActivity('document_scan', { documentName: file.name });

    // Simulate upload completion
    const extractMsg = AI_EXTRACTION_MESSAGES[requirementId] || 'Classifying document…';
    const verifiedMsg = AI_VERIFIED_MESSAGES[requirementId] || 'Document verified';
    const extractedFields = DEMO_EXTRACTED_FIELDS[requirementId];

    setTimeout(() => {
      setLocalFile({ file, status: 'categorizing', aiMessage: extractMsg });
    }, 500);

    // Simulate AI processing
    setTimeout(() => {
      updateRequirementStatus(requirementId, 'reviewing', {
        fileName: file.name,
        aiMessage: extractMsg,
      });
      setLocalFile(null);
    }, 1500);

    // Simulate verification complete
    setTimeout(() => {
      updateRequirementStatus(requirementId, 'verified', {
        fileName: file.name,
        aiMessage: verifiedMsg,
        extractedFields,
      });
    }, 3500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Already complete state
  if (isComplete) {
    const fields = requirement.extractedFields;
    return (
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: '#F0FBDF', border: '1px solid rgba(60,96,6,0.15)' }}
      >
        {/* Success header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#6CAD0A' }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#3C6006' }}>
              {displayTitle}
            </p>
            {requirement.uploadedFileName && (
              <p className="text-xs mt-0.5 font-medium" style={{ color: '#5A7D23' }}>
                {requirement.uploadedFileName} · {requirement.aiMessage || 'Verified'}
              </p>
            )}
          </div>
        </div>
        {/* Extracted fields */}
        {fields && Object.keys(fields).length > 0 && (
          <div
            className="px-4 pb-3"
            style={{ borderTop: '1px solid rgba(60,96,6,0.1)' }}
          >
            <div className="flex items-center gap-1.5 pt-2.5 mb-2">
              <Sparkles className="w-3 h-3" style={{ color: '#3C6006' }} />
              <span className="text-xs font-semibold" style={{ color: '#3C6006' }}>
                Extracted by LendWell AI
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {Object.entries(fields).map(([key, val]) => (
                <div key={key}>
                  <p className="text-xs font-medium capitalize" style={{ color: '#5A7D23' }}>
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: '#1F3A0A' }}>
                    {val}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Processing state
  if (isProcessing) {
    return (
      <div
        className="flex items-center gap-4 p-4 rounded-xl"
        style={{ backgroundColor: '#F7F8FC', border: '1px solid #E1E8EE' }}
      >
        <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" style={{ color: '#3126E3' }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: '#182026' }}>
            {displayTitle}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#3126E3' }}>
            {requirement.aiMessage || 'LendWell is checking your document...'}
          </p>
        </div>
      </div>
    );
  }

  // Upload state
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: isDragging ? '2px dashed #3126E3' : '2px dashed #E1E8EE',
        backgroundColor: isDragging ? 'rgba(71, 63, 230, 0.03)' : '#FAFBFC',
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header with LendWell badge */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid #EBEBEB' }}>
        <img src="/images/lendwell-ai-logo.svg" alt="" className="w-4 h-4" />
        <span className="text-xs font-semibold" style={{ color: '#3126E3' }}>
          LendWell will verify automatically
        </span>
      </div>

      {/* Document info */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-sm font-semibold" style={{ color: '#182026' }}>
          {displayTitle}
        </p>
        <p className="text-xs mt-1 text-muted-foreground">
          {displayDescription}
        </p>
      </div>

      {/* Local file preview if uploading */}
      {localFile && (
        <div className="px-4 py-2">
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
            style={{ backgroundColor: '#F7F8FC', border: '1px solid #E5E7EB' }}
          >
            <FileText className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#182026' }}>
                {localFile.file.name}
              </p>
              {localFile.aiMessage && (
                <p className="text-xs mt-0.5" style={{ color: '#3126E3' }}>
                  {localFile.aiMessage}
                </p>
              )}
            </div>
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#3126E3' }} />
          </div>
        </div>
      )}

      {/* Upload button */}
      {!localFile && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-3 px-4 py-4 transition-colors row-interactive"
          style={{ cursor: 'pointer' }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: isDragging ? '#3126E3' : '#EDECFD' }}
          >
            <Upload
              className="w-4 h-4"
              style={{ color: isDragging ? '#ffffff' : '#3126E3' }}
            />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium" style={{ color: '#182026' }}>
              {isDragging ? 'Drop to upload' : 'Drop file here or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              PDF, JPG, or PNG
            </p>
          </div>
        </button>
      )}

      {/* Acceptable documents hint */}
      {requirement.acceptableDocuments && requirement.acceptableDocuments.length > 0 && (
        <div className="px-4 pb-4">
          <p className="text-xs text-muted-foreground">
            Accepted: {requirement.acceptableDocuments.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
