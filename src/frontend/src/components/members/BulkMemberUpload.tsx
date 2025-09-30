'use client';

import React, { useState, useRef } from 'react';
import { 
  Upload, Download, Users, Check, X, AlertTriangle, 
  FileSpreadsheet, FileText, Info, ExternalLink 
} from 'lucide-react';

interface UploadResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    data: any;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    message: string;
    data: any;
  }>;
}

interface BulkMemberUploadProps {
  onComplete?: (result: UploadResult) => void;
  churchId?: string;
}

export default function BulkMemberUpload({ onComplete, churchId }: BulkMemberUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = [
    {
      type: 'csv',
      name: 'CSV (Comma Separated Values)',
      extensions: ['.csv'],
      mimeTypes: ['text/csv', 'application/csv'],
      icon: FileText
    },
    {
      type: 'excel',
      name: 'Excel Spreadsheet',
      extensions: ['.xlsx', '.xls'],
      mimeTypes: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ],
      icon: FileSpreadsheet
    }
  ];

  const requiredFields = [
    { field: 'firstName', name: 'First Name', required: true },
    { field: 'lastName', name: 'Last Name', required: true },
    { field: 'email', name: 'Email Address', required: true },
    { field: 'phone', name: 'Phone Number', required: false },
    { field: 'address', name: 'Street Address', required: false },
    { field: 'city', name: 'City', required: false },
    { field: 'state', name: 'State/Province', required: false },
    { field: 'zipCode', name: 'ZIP/Postal Code', required: false },
    { field: 'dateOfBirth', name: 'Date of Birth (YYYY-MM-DD)', required: false },
    { field: 'gender', name: 'Gender (M/F/Other)', required: false },
    { field: 'maritalStatus', name: 'Marital Status', required: false },
    { field: 'membershipStatus', name: 'Membership Status (active/inactive)', required: false },
    { field: 'membershipType', name: 'Membership Type (regular/associate/youth)', required: false },
    { field: 'role', name: 'Role (admin/leader/member)', required: false },
    { field: 'emergencyContactName', name: 'Emergency Contact Name', required: false },
    { field: 'emergencyContactPhone', name: 'Emergency Contact Phone', required: false },
    { field: 'occupation', name: 'Occupation', required: false },
    { field: 'employer', name: 'Employer', required: false }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setShowPreview(false);
      setPreviewData([]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setResult(null);
      setShowPreview(false);
      setPreviewData([]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const isValidFileType = (file: File): boolean => {
    return supportedFormats.some(format => 
      format.mimeTypes.includes(file.type) || 
      format.extensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );
  };

  const previewFile = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'preview');
      if (churchId) formData.append('churchId', churchId);

      const response = await fetch('/api/members/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setPreviewData(data.preview || []);
      setShowPreview(true);
    } catch (error: any) {
      console.error('Preview failed:', error);
      alert(`Preview failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'upload');
      if (churchId) formData.append('churchId', churchId);

      const response = await fetch('/api/members/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const uploadResult = await response.json();
      setResult(uploadResult);
      
      if (onComplete) {
        onComplete(uploadResult);
      }

      // Clear file after successful upload
      if (uploadResult.success) {
        setFile(null);
        setShowPreview(false);
        setPreviewData([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      const failedResult: UploadResult = {
        success: false,
        totalRows: 0,
        successCount: 0,
        errorCount: 1,
        errors: [{
          row: 0,
          field: 'general',
          message: error.message,
          data: {}
        }],
        warnings: []
      };
      setResult(failedResult);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvHeaders = requiredFields.map(field => field.name).join(',');
    const csvExample = [
      'John,Doe,john.doe@email.com,(555) 123-4567,123 Main St,Springfield,IL,62701,1985-06-15,M,Married,active,regular,member,Jane Doe,(555) 123-4568,Engineer,Tech Corp',
      'Jane,Smith,jane.smith@email.com,(555) 987-6543,456 Oak Ave,Springfield,IL,62702,1990-03-22,F,Single,active,regular,leader,John Smith,(555) 987-6544,Teacher,School District'
    ].join('\n');

    const csvContent = csvHeaders + '\n' + csvExample;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'member_upload_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Users className="w-6 h-6 mr-2 text-primary-600" />
                Bulk Member Upload
              </h2>
              <p className="text-gray-600 mt-1">
                Import multiple members from CSV or Excel files
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              file 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {file ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Check className="w-12 h-12 text-green-500" />
                </div>
                <div>
                  <p className="text-lg font-medium text-green-900">{file.name}</p>
                  <p className="text-green-700">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • 
                    {isValidFileType(file) ? ' Valid format' : ' Invalid format'}
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={previewFile}
                    disabled={uploading || !isValidFileType(file)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Preview Data
                  </button>
                  <button
                    onClick={() => setFile(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Remove File
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Drop your file here, or click to browse
                  </p>
                  <p className="text-gray-600">
                    Supports CSV and Excel files (max 10MB)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
                >
                  Choose File
                </button>
              </div>
            )}
          </div>

          {/* Supported Formats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportedFormats.map((format) => {
              const IconComponent = format.icon;
              return (
                <div key={format.type} className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <IconComponent className="w-8 h-8 text-gray-500 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">{format.name}</h4>
                    <p className="text-sm text-gray-600">
                      {format.extensions.join(', ')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Required Fields */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-500" />
              Field Mapping Guide
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm mb-3">
                Your file should include the following columns. Required fields are marked with *.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                {requiredFields.map((field) => (
                  <div key={field.field} className="flex items-center">
                    <span className={`font-medium ${field.required ? 'text-red-600' : 'text-blue-800'}`}>
                      {field.name}{field.required && ' *'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Data */}
          {showPreview && previewData.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Data Preview ({previewData.length} rows)
                </h3>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {uploading ? 'Uploading...' : `Import ${previewData.length} Members`}
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.slice(0, 10).map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {row.firstName} {row.lastName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {row.email}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {row.phone || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {row.role || 'member'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Valid
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.length > 10 && (
                  <div className="bg-gray-50 px-4 py-3 text-sm text-gray-600 text-center">
                    ... and {previewData.length - 10} more rows
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Results */}
          {result && (
            <div className="mt-6">
              <div className={`rounded-lg border p-4 ${
                result.success 
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center mb-3">
                  {result.success ? (
                    <Check className="w-6 h-6 text-green-600 mr-2" />
                  ) : (
                    <X className="w-6 h-6 text-red-600 mr-2" />
                  )}
                  <h3 className={`text-lg font-medium ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.success ? 'Upload Completed' : 'Upload Failed'}
                  </h3>
                </div>

                <div className="space-y-2 text-sm">
                  <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                    <strong>Total Rows:</strong> {result.totalRows}
                  </p>
                  <p className="text-green-700">
                    <strong>Successfully Imported:</strong> {result.successCount}
                  </p>
                  {result.errorCount > 0 && (
                    <p className="text-red-700">
                      <strong>Errors:</strong> {result.errorCount}
                    </p>
                  )}
                  {result.warnings.length > 0 && (
                    <p className="text-yellow-700">
                      <strong>Warnings:</strong> {result.warnings.length}
                    </p>
                  )}
                </div>

                {/* Error Details */}
                {result.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                    <div className="space-y-1 text-sm text-red-700 max-h-40 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <div key={index} className="flex items-start">
                          <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>
                            Row {error.row}: {error.field} - {error.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warning Details */}
                {result.warnings.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Warnings:</h4>
                    <div className="space-y-1 text-sm text-yellow-700 max-h-40 overflow-y-auto">
                      {result.warnings.map((warning, index) => (
                        <div key={index} className="flex items-start">
                          <Info className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>
                            Row {warning.row}: {warning.field} - {warning.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
