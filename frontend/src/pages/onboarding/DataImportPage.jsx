// src/pages/onboarding/DataImportPage.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Table, Calendar, CheckCircle, Loader, Camera as CameraIcon, Check, Scan } from 'lucide-react';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { apiFetch } from '../../lib/api';

const DataImportPage = ({ setIsOnboarded }) => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef(null);

  // Native Scanning state
  const [scannedTransactions, setScannedTransactions] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [confirming, setConfirming] = useState(false);

  // Platform detection
  const isMobileApp = window.Capacitor || window.location.origin.includes('capacitor') || (window.location.origin.includes('http://localhost') && !window.location.port);

  const methods = [
    {
      id: 'manual',
      icon: Calendar,
      title: 'Manual Entry',
      description: 'Add transactions one by one',
      recommended: true
    },
    ...(isMobileApp ? [
      {
        id: 'scan',
        icon: Scan,
        title: 'AI Receipt Scanner',
        description: 'Snap a photo of any receipt to extract transactions with AI'
      }
    ] : []),
    {
      id: 'upload',
      icon: Upload,
      title: 'Upload Bank Statements',
      description: 'Upload CSV or PDF files'
    },
    {
      id: 'spreadsheet',
      icon: Table,
      title: 'Spreadsheet Import',
      description: 'Use our Excel template'
    },
    {
      id: 'fresh',
      icon: FileText,
      title: 'Start Fresh',
      description: 'Begin tracking from today'
    }
  ];

  const handleMethodSelect = (method) => {
    if (method === 'fresh') {
      handleComplete();
      return;
    }
    setSelectedMethod(method);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiFetch('/importer/upload/', {
        method: 'POST',
        body: formData
      });
      setUploading(false);
      setUploadComplete(true);
      setTimeout(() => {
        handleComplete();
      }, 2000);
    } catch (error) {
      console.error("Upload error", error);
      alert("Error uploading file: " + error.message);
      setUploading(false);
    }
  };

  // Capacitor Camera Scanning Implementation
  const handleCameraScan = async () => {
    setScanError('');
    try {
      // 1. Open native camera and capture compressed photo
      const photo = await CapCamera.getPhoto({
        quality: 40,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        width: 1000
      });

      if (!photo || !photo.base64String) {
        throw new Error("No photo captured.");
      }

      setScanning(true);

      // 2. Upload base64 image string to backend vision scanner
      const response = await apiFetch('/importer/scan/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: photo.base64String })
      });

      if (response && response.transactions) {
        // Mark all transactions as initially selected
        const transactionsWithSelection = response.transactions.map((tx, idx) => ({
          ...tx,
          id: idx,
          selected: true
        }));
        setScannedTransactions(transactionsWithSelection);
      } else {
        throw new Error("No transactions extracted from image.");
      }
    } catch (error) {
      console.error("Camera scan error:", error);
      setScanError(error.message || "Failed to scan statement. Please make sure the document is clear and readable.");
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmScannedTransactions = async () => {
    const selectedTxs = scannedTransactions.filter(tx => tx.selected);
    if (selectedTxs.length === 0) {
      alert("Please select at least one transaction to import.");
      return;
    }

    setConfirming(true);
    try {
      await apiFetch('/importer/confirm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transactions: selectedTxs })
      });

      setConfirming(false);
      setUploadComplete(true);
      setTimeout(() => {
        handleComplete();
      }, 2000);
    } catch (error) {
      console.error("Confirmation error:", error);
      alert("Failed to save transactions: " + error.message);
      setConfirming(false);
    }
  };

  const toggleSelectTx = (id) => {
    setScannedTransactions(prev =>
      prev.map(tx => tx.id === id ? { ...tx, selected: !tx.selected } : tx)
    );
  };

  const handleEditTx = (id, field, value) => {
    setScannedTransactions(prev =>
      prev.map(tx => tx.id === id ? { ...tx, [field]: value } : tx)
    );
  };

  const handleComplete = () => {
    apiFetch('/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify({ is_onboarded: true })
    }).catch((e) => {
      console.error("Failed to update onboarding status in backend", e);
    });
    setIsOnboarded(true);
    navigate('/dashboard');
  };

  if (uploadComplete) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <div 
          className="fixed inset-0 z-0 animate-[fadeIn_0.8s_ease-out]"
          style={{
            backgroundImage: 'url("/common-bg.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>

        <div className="max-w-md w-full bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center border border-white/10 relative z-10 animate-[scaleIn_0.6s_ease-out]">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-[scaleIn_0.8s_ease-out_0.2s_both]">
            <CheckCircle size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 animate-[fadeInDown_0.8s_ease-out_0.3s_both]">
            Success!
          </h1>
          <p className="text-gray-400 mb-6 text-lg animate-[fadeInDown_0.8s_ease-out_0.4s_both]">
            Your financial data is now secure and ready to analyze!
          </p>
          <div className="space-y-2 text-sm text-gray-300 mb-6">
            <p className="animate-[slideInRight_0.6s_ease-out_0.5s_both]">✓ Data verified & categorised</p>
            <p className="animate-[slideInRight_0.6s_ease-out_0.6s_both]">✓ AI budgeting thresholds established</p>
            <p className="animate-[slideInRight_0.6s_ease-out_0.7s_both]">✓ Wealth security protocols complete</p>
          </div>
        </div>
      </div>
    );
  }

  if (uploading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <div 
          className="fixed inset-0 z-0 animate-[fadeIn_0.8s_ease-out]"
          style={{
            backgroundImage: 'url("/common-bg.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>

        <div className="max-w-md w-full bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center border border-white/10 relative z-10 animate-[scaleIn_0.6s_ease-out]">
          <Loader size={56} className="text-emerald-400 animate-spin mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Processing Your Files</h2>
          <p className="text-gray-400 mb-6">AI is analyzing your statements...</p>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
              <span className="text-gray-300">Extracting transactions...</span>
              <CheckCircle size={18} className="text-emerald-400" />
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
              <span className="text-gray-300">Detecting categories...</span>
              <Loader size={18} className="text-emerald-400 animate-spin" />
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
              <span className="text-gray-500">Identifying patterns...</span>
              <span className="text-gray-600">Pending</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative py-8 px-4">
      <div 
        className="fixed inset-0 z-0 animate-[fadeIn_0.8s_ease-out]"
        style={{
          backgroundImage: 'url("/common-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12 animate-[slideInDown_0.8s_ease-out]">
          <h1 className="text-5xl font-bold text-white mb-6">
            How would you like to add your financial data?
          </h1>
          <p className="text-xl text-gray-300">
            Choose the method that works best for you. You can use multiple methods anytime!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {methods.map((method, index) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => handleMethodSelect(method.id)}
                className={`relative p-8 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-105 animate-[slideUp_0.6s_ease-out] ${
                  selectedMethod === method.id
                    ? 'border-emerald-500 bg-black/60 shadow-lg shadow-emerald-500/30 backdrop-blur-xl'
                    : 'border-white/10 bg-black/40 backdrop-blur-xl hover:border-white/20 hover:bg-black/50'
                }`}
                style={{ animationDelay: `${0.2 + index * 0.1}s`, animationFillMode: 'both' }}
              >
                {method.recommended && (
                  <span className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold rounded-full animate-[pulse_2s_ease-in-out_infinite]">
                    Recommended
                  </span>
                )}
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
                  <Icon size={36} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{method.title}</h3>
                <p className="text-gray-400">{method.description}</p>
                {selectedMethod === method.id && (
                  <div className="mt-4 flex items-center space-x-2 text-emerald-400 animate-[scaleIn_0.3s_ease-out]">
                    <CheckCircle size={20} />
                    <span className="font-medium">Selected</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {selectedMethod === 'upload' && (
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-8 border border-white/10 animate-[slideUp_0.5s_ease-out]">
            <h2 className="text-3xl font-bold text-white mb-4">Upload Bank Statements</h2>
            <p className="text-gray-400 mb-6 text-lg">
              Upload your last 2-3 months of bank statements (PDF or CSV format)
            </p>

            <div className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:border-emerald-500 hover:bg-emerald-500/5 transition-all duration-300 cursor-pointer backdrop-blur-sm">
              <Upload size={56} className="text-emerald-400 mx-auto mb-4" />
              <p className="text-xl font-medium text-white mb-2">
                Drag & drop files here or click to browse
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Supported: PDF, CSV, Excel (.xlsx, .xls)
              </p>
              <button
                onClick={handleFileUpload}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 font-medium hover:scale-105 active:scale-95"
              >
                Select Files
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".csv,.xlsx,.xls,.pdf" 
              />
            </div>

            <div className="mt-6 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-emerald-300 font-medium mb-2">🔒 Security Notice:</p>
              <ul className="text-sm text-emerald-200 space-y-1">
                <li>• Files encrypted during upload (TLS)</li>
                <li>• Processed on secure server</li>
                <li>• Original files deleted after processing</li>
                <li>• Extracted data encrypted with your passphrase</li>
              </ul>
            </div>
          </div>
        )}

        {selectedMethod === 'manual' && (
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-8 text-center border border-white/10 animate-[slideUp_0.5s_ease-out]">
            <CheckCircle size={72} className="text-emerald-400 mx-auto mb-6 animate-[scaleIn_0.6s_ease-out]" />
            <h2 className="text-3xl font-bold text-white mb-4">Perfect Choice!</h2>
            <p className="text-gray-400 mb-6 text-lg">
              You'll be able to add transactions manually from your dashboard.
            </p>
            <button
              onClick={handleComplete}
              className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 font-medium hover:scale-105 active:scale-95"
            >
              Continue to Dashboard
            </button>
          </div>
        )}

        {selectedMethod === 'spreadsheet' && (
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-8 border border-white/10 animate-[slideUp_0.5s_ease-out]">
            <h2 className="text-3xl font-bold text-white mb-4">Spreadsheet Import</h2>
            <p className="text-gray-400 mb-6 text-lg">
              Download our Excel template, fill in your data, and upload when ready
            </p>
            <div className="space-y-4">
              <button className="w-full py-4 px-6 border-2 border-emerald-500 text-emerald-400 rounded-xl hover:bg-emerald-500/10 transition-all duration-300 font-medium flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-95">
                <Table size={20} />
                <span>Download Excel Template</span>
              </button>
              <button
                onClick={handleFileUpload}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 font-medium flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-95"
              >
                <Upload size={20} />
                <span>Upload Completed Template</span>
              </button>
            </div>
          </div>
        )}

        {selectedMethod === 'scan' && (
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-8 border border-white/10 animate-[slideUp_0.5s_ease-out]">
            <h2 className="text-3xl font-bold text-white mb-4">Scan Receipt / Statement</h2>
            <p className="text-gray-400 mb-6 text-lg">
              Take a photo of your receipt or printed statement. Aureon AI will automatically extract and categorize the transactions.
            </p>

            {scanError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3 text-red-200 text-sm">
                <span>⚠️ {scanError}</span>
              </div>
            )}

            {scannedTransactions.length === 0 && !scanning ? (
              <div className="flex flex-col items-center gap-4 justify-center mt-8">
                <button
                  onClick={handleCameraScan}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 font-medium hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
                >
                  <CameraIcon size={20} />
                  <span>Open Camera & Scan</span>
                </button>
              </div>
            ) : scanning ? (
              <div className="text-center py-12">
                <Loader size={56} className="text-emerald-400 animate-spin mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">Analyzing Document</h3>
                <p className="text-gray-400">AI is reading your statement image to extract full transactions...</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Review Extracted Transactions</h3>
                  <button 
                    onClick={handleCameraScan}
                    className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    Rescan Document
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-3 mb-6 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                  {scannedTransactions.map(tx => (
                    <div 
                      key={tx.id} 
                      className={`p-3 sm:p-4 rounded-xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        tx.selected 
                          ? 'bg-emerald-500/5 border-emerald-500/30' 
                          : 'bg-white/5 border-white/10 opacity-60'
                      }`}
                    >
                      <div className="flex items-start sm:items-center space-x-3">
                        <input 
                          type="checkbox"
                          checked={tx.selected}
                          onChange={() => toggleSelectTx(tx.id)}
                          className="w-5 h-5 rounded border-white/20 text-emerald-500 focus:ring-emerald-500 bg-transparent cursor-pointer mt-1 sm:mt-0"
                        />
                        <div className="flex-1">
                          <input 
                            type="text" 
                            value={tx.merchant} 
                            onChange={(e) => handleEditTx(tx.id, 'merchant', e.target.value)}
                            className="bg-transparent border-b border-transparent focus:border-white/20 text-white font-semibold text-sm outline-none w-full max-w-[200px] focus:bg-white/5 px-1 rounded"
                            placeholder="Merchant Name"
                          />
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <input 
                              type="date" 
                              value={tx.date} 
                              onChange={(e) => handleEditTx(tx.id, 'date', e.target.value)}
                              className="bg-transparent text-gray-400 text-xs outline-none focus:border-b focus:border-white/20 px-1"
                            />
                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300 uppercase truncate max-w-[100px]">
                              {tx.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end pl-8 sm:pl-0 w-full sm:w-auto space-x-2">
                        <div className="flex items-center">
                          <span className="text-gray-400 text-sm">₹</span>
                          <input 
                            type="number" 
                            value={tx.amount} 
                            onChange={(e) => handleEditTx(tx.id, 'amount', e.target.value)}
                            className={`bg-transparent border-b border-transparent focus:border-white/20 font-bold text-right outline-none w-20 focus:bg-white/5 px-1 rounded ${
                              tx.type === 'expense' ? 'text-red-400' : 'text-emerald-400'
                            }`}
                          />
                        </div>
                        <select
                          value={tx.type}
                          onChange={(e) => handleEditTx(tx.id, 'type', e.target.value)}
                          className="bg-black text-xs text-gray-400 border border-white/10 rounded px-1 py-1 outline-none"
                        >
                          <option value="expense">DR</option>
                          <option value="income">CR</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleConfirmScannedTransactions}
                  disabled={confirming}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 font-bold hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {confirming ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      <span>Saving to Ledger...</span>
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      <span>Confirm & Import ({scannedTransactions.filter(t => t.selected).length}) Transactions</span>
                    </>
                  )}
                </button>
              </div>
            )}
            
            {isMobileApp && (
              <div className="mt-6 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl backdrop-blur-sm">
                <p className="text-sm text-emerald-300 font-medium mb-2">🔒 Secure Mobile OCR Scanner:</p>
                <p className="text-sm text-emerald-200">
                  Aureon integrates directly with state-of-the-art vision-language intelligence to extract structured transactions from statements/receipts. All captured camera data is TLS-encrypted and immediately deleted post-analysis.
                </p>
              </div>
            )}
          </div>
        )}

        {!selectedMethod && (
          <div className="text-center animate-[fadeIn_1s_ease-out]">
            <button
              onClick={handleComplete}
              className="text-white hover:text-emerald-400 font-medium transition-all duration-300"
            >
              Skip for now - I'll add data later
            </button>
          </div>
        )}
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default DataImportPage;