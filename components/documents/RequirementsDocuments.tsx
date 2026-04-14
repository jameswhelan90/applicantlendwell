'use client';

import { useRef, useState, useEffect } from 'react';
import { useApplication } from '@/context/ApplicationContext';
import { useActivityStream } from '@/hooks/useActivityStream';
import { DocumentRequirement, RequirementStatus } from '@/types/tasks';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  FileText,
  X,
  ChevronDown,
  Paperclip,
} from 'lucide-react';

// ─── Status helpers ──────────────────────────────────────────────────────────

function getStatusIcon(status: RequirementStatus) {
  switch (status) {
    case 'verified':
      return <CheckCircle2 className="w-4 h-4" style={{ color: '#6CAD0A' }} />;
    case 'reviewing':
    case 'uploading':
      return <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#3126E3' }} />;
    case 'issue':
    case 'needs_update':
      return <AlertCircle className="w-4 h-4" style={{ color: '#E07900' }} />;
    default:
      return <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: '#E1E8EE' }} />;
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
      return 'Needed';
  }
}

function getStatusColor(status: RequirementStatus): string {
  switch (status) {
    case 'verified':
      return '#3C6006';
    case 'reviewing':
    case 'uploading':
      return '#3126E3';
    case 'issue':
    case 'needs_update':
      return '#653701';
    default:
      return '#5A7387';
  }
}

// ─── Single requirement row ─────────────────────────────────────────────────

function RequirementRow({ req }: { req: DocumentRequirement }) {
  const isDone = req.status === 'verified';
  const isProcessing = req.status === 'reviewing' || req.status === 'uploading';

  return (
    <div
      className="flex items-center gap-4 py-3"
      style={{ borderBottom: '1px solid #F1F3F7' }}
    >
      {/* Status icon */}
      <div className="flex-shrink-0">
        {getStatusIcon(req.status)}
      </div>

      {/* Document info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium"
          style={{ color: isDone ? '#3C6006' : '#182026' }}
        >
          {req.title}
        </p>
        {req.uploadedFileName && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {req.uploadedFileName}
          </p>
        )}
        {isProcessing && req.aiMessage && (
          <p className="text-xs mt-0.5" style={{ color: '#3126E3' }}>
            {req.aiMessage}
          </p>
        )}
      </div>

      {/* Status label */}
      <span
        className="text-xs font-semibold flex-shrink-0"
        style={{ color: getStatusColor(req.status) }}
      >
        {getStatusLabel(req.status)}
      </span>
    </div>
  );
}

// ─── Uploaded file preview ───────────────────────────────────────────────────

function UploadedFilePreview({
  file,
  onRemove,
  status,
  aiMessage,
}: {
  file: File;
  onRemove: () => void;
  status: 'pending' | 'uploading' | 'categorizing' | 'done';
  aiMessage?: string;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg"
      style={{ backgroundColor: '#F7F8FC', border: '1px solid #E5E7EB' }}
    >
      <FileText className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: '#182026' }}>
          {file.name}
        </p>
        {status === 'categorizing' && aiMessage && (
          <p className="text-xs mt-0.5" style={{ color: '#3126E3' }}>
            {aiMessage}
          </p>
        )}
      </div>
      {status === 'pending' && (
        <button
          onClick={onRemove}
          className="p-1 rounded hover:bg-muted/60 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
      {(status === 'uploading' || status === 'categorizing') && (
        <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#3126E3' }} />
      )}
      {status === 'done' && (
        <CheckCircle2 className="w-4 h-4" style={{ color: '#3C6006' }} />
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RequirementsDocuments() {
  const { state, updateRequirementStatus } = useApplication();
  const { triggerActivity } = useActivityStream();
  const requirements = state.requirements || [];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{ file: File; status: string; aiMessage?: string }[]>([]);
  // Auto-expand requirements that have files or are processing
  const getAutoExpandedReqs = () => {
    return requirements
      .filter((r) => r.uploadedFileName || r.status === 'reviewing' || r.status === 'uploading')
      .map((r) => r.id);
  };
  const [expandedReqs, setExpandedReqs] = useState<string[]>(getAutoExpandedReqs);

  const toggleExpanded = (reqId: string) => {
    setExpandedReqs((prev) =>
      prev.includes(reqId) ? prev.filter((id) => id !== reqId) : [...prev, reqId]
    );
  };

  // Keep a ref so setTimeout callbacks always see the latest requirements
  const requirementsRef = useRef(requirements);
  requirementsRef.current = requirements;

  const requiredReqs = requirements.filter((r) => r.required);
  const completedReqs = requiredReqs.filter((r) => r.status === 'verified');
  const pendingReqs = requiredReqs.filter((r) => r.status === 'required');
  const processingReqs = requiredReqs.filter(
    (r) => r.status === 'uploading' || r.status === 'reviewing'
  );

  const allComplete = completedReqs.length === requiredReqs.length;
  const isProcessing = processingReqs.length > 0 || uploadingFiles.length > 0;

  // Auto-expand when a requirement starts processing
  const prevProcessingRef = useRef<string[]>([]);
  useEffect(() => {
    const currentProcessingIds = processingReqs.map((r) => r.id).join();
    if (currentProcessingIds !== prevProcessingRef.current.join()) {
      const newProcessing = processingReqs.filter((r) => !prevProcessingRef.current.includes(r.id));
      if (newProcessing.length > 0) {
        setExpandedReqs((prev) => [...new Set([...prev, ...newProcessing.map((r) => r.id)])]);
      }
      prevProcessingRef.current = processingReqs.map((r) => r.id);
    }
  }, [processingReqs]);

  // Simulate auto-categorization and processing
  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    fileArray.forEach((file, index) => {
      // Add to local uploading state
      setUploadingFiles((prev) => [...prev, { file, status: 'uploading' }]);

      // Trigger background activity for document scanning
      triggerActivity('document_scan', { documentName: file.name });

      // Simulate upload completion
      setTimeout(() => {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.file === file ? { ...f, status: 'categorizing', aiMessage: 'LendWell is reviewing your document...' } : f
          )
        );
      }, 500);

      // Simulate AI categorization
      setTimeout(() => {
        // Find a pending requirement to match this file to
        const pending = requirementsRef.current.filter((r) => r.required && r.status === 'required');
        const targetReq = pending[index % pending.length];

        if (targetReq) {
          const aiMessages: Record<string, string> = {
            'req-payslips': 'Detected payslip — extracting salary information',
            'req-bank-statements': 'Detected bank statement — verifying transaction history',
            'req-passport': 'Detected ID document — extracting personal details',
            'req-proof-of-address': 'Detected address proof — verifying address details',
          };

          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.file === file
                ? { ...f, aiMessage: aiMessages[targetReq.id] || 'Categorizing document...' }
                : f
            )
          );

          updateRequirementStatus(targetReq.id, 'reviewing', {
            fileName: file.name,
            aiMessage: aiMessages[targetReq.id] || 'LendWell is checking your document',
          });
        }

        // Remove from local state
        setTimeout(() => {
          setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
        }, 500);
      }, 1500);

      // Simulate verification complete
      setTimeout(() => {
        const pending = requirementsRef.current.filter((r) => r.required && r.status === 'reviewing');
        const targetReq = pending[0];

        if (targetReq) {
          const verifiedMessages: Record<string, string> = {
            'req-payslips': 'Verified — income confirmed',
            'req-bank-statements': 'Verified — statements accepted',
            'req-passport': 'Verified — identity confirmed',
            'req-proof-of-address': 'Verified — address confirmed',
          };

          const extractedFields: Record<string, Record<string, string>> = {
            'req-payslips': {
              employer: 'Acme Corporation',
              gross_salary: '£5,416.67',
              pay_date: '28 March 2025',
            },
            'req-bank-statements': {
              account_type: 'Current Account',
              bank_name: 'NatWest',
              period: 'Jan-Mar 2025',
            },
            'req-passport': {
              full_name: 'Sarah Jane Murphy',
              date_of_birth: '15 March 1988',
              document_number: '504839127',
            },
            'req-proof-of-address': {
              address: '14 Elm Street, London SW1A 1AA',
              document_type: 'Council Tax Bill',
              date: 'March 2025',
            },
          };

          updateRequirementStatus(targetReq.id, 'verified', {
            fileName: file.name,
            aiMessage: verifiedMessages[targetReq.id] || 'Document verified',
            extractedFields: extractedFields[targetReq.id],
          });
        }
      }, 3500 + index * 500);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">

      {/* Single upload card — checklist + drop zone integrated */}
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
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* LendWell badge — top of card */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: '1px solid #EBEBEB' }}>
          <div className="flex items-center gap-2">
<img src="/images/lendwell-ai-logo.svg" alt="" className="w-4 h-4" />
                        <span className="text-xs font-semibold" style={{ color: '#3126E3' }}>
              LendWell will categorise your documents automatically
            </span>
          </div>
          <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
            {completedReqs.length}/{requiredReqs.length} verified
          </span>
        </div>

        {/* Required documents accordion list */}
        <div className="divide-y" style={{ borderColor: '#E5E7EB' }}>
          {requiredReqs.map((req) => {
            const isExpanded = expandedReqs.includes(req.id);
            const hasFiles = !!req.uploadedFileName;
            const isProcessing = req.status === 'reviewing' || req.status === 'uploading';

            return (
              <div key={req.id}>
                {/* Accordion header button */}
                <button
                  type="button"
                  onClick={() => toggleExpanded(req.id)}
                  className="w-full flex items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-gray-50"
                >
                  {/* Chevron on left */}
                  <ChevronDown
                    className="w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-200"
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />

                  {/* Status indicator */}
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    {getStatusIcon(req.status)}
                  </div>

                  {/* Document title and description */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: req.status === 'verified' ? '#3C6006' : '#182026' }}
                    >
                      {req.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {req.description}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        req.status === 'verified' ? '#F0FBDF' :
                        isProcessing ? '#EEF0FD' :
                        '#F3F4F6',
                      color: getStatusColor(req.status),
                    }}
                  >
                    {getStatusLabel(req.status)}
                  </span>
                </button>

                {/* Accordion content — expandable section */}
                {isExpanded && (
                  <div className="bg-gray-50 px-6 py-4 border-t" style={{ borderColor: '#E5E7EB' }}>
                    <div className="space-y-3">
                      {/* Uploaded file */}
                      {req.uploadedFileName && (
                        <div className="flex items-start gap-3">
                          <FileText className="w-4 h-4 flex-shrink-0 text-gray-400 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {req.uploadedFileName}
                            </p>
                            {req.aiMessage && (
                              <p className="text-xs text-blue-600 mt-1">
                                {req.aiMessage}
                              </p>
                            )}
                          </div>
                          {isProcessing && (
                            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 text-blue-600" />
                          )}
                          {req.status === 'verified' && (
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#6CAD0A' }} />
                          )}
                        </div>
                      )}

                      {/* Extracted fields preview */}
                      {req.extractedFields && Object.keys(req.extractedFields).length > 0 && (
                        <div className="p-3 rounded bg-white border" style={{ borderColor: '#E5E7EB' }}>
                          <p className="text-xs font-semibold text-gray-900 mb-2">
                            Extracted Information
                          </p>
                          <div className="space-y-1.5">
                            {Object.entries(req.extractedFields).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between text-xs">
                                <span className="text-gray-600 capitalize">
                                  {key.replace(/_/g, ' ')}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Empty state */}
                      {!hasFiles && !isProcessing && (
                        <p className="text-xs text-gray-500">
                          No file uploaded yet. Drag and drop or click to upload.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="px-6" style={{ borderTop: '1px solid #F1F3F7' }}>
          <div className="py-3">
            <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${requiredReqs.length > 0 ? (completedReqs.length / requiredReqs.length) * 100 : 0}%`,
                  backgroundColor: allComplete ? '#6CAD0A' : '#3126E3',
                }}
              />
            </div>
          </div>
        </div>

        {/* Drop / click target area */}
        {!allComplete && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center gap-3 py-8 px-6 transition-colors"
            style={{
              borderTop: '1px dashed #D1D5DB',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: isDragging ? '#3126E3' : '#EDECFD' }}
            >
              <Upload
                className="w-5 h-5"
                style={{ color: isDragging ? '#ffffff' : '#3126E3' }}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: '#182026' }}>
                {isDragging ? 'Drop your files to upload' : 'Drop files here or click to browse'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, JPG, or PNG — you can upload all your documents at once
              </p>
            </div>
          </button>
        )}

        {/* All complete state */}
        {allComplete && (
          <div
            className="flex items-center gap-3 mx-6 mb-5 px-4 py-3 rounded-lg"
            style={{ backgroundColor: '#F0FBDF', border: '1px solid rgba(60, 96, 6, 0.2)' }}
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#3C6006' }} />
            <p className="text-sm font-medium" style={{ color: '#3C6006' }}>
              All documents verified and ready for review.
            </p>
          </div>
        )}
      </div>

      {/* Files currently being processed */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((item, idx) => (
            <UploadedFilePreview
              key={idx}
              file={item.file}
              onRemove={() => setUploadingFiles((prev) => prev.filter((_, i) => i !== idx))}
              status={item.status as 'pending' | 'uploading' | 'categorizing' | 'done'}
              aiMessage={item.aiMessage}
            />
          ))}
        </div>
      )}

    </div>
  );
}
