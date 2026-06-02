import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Plus, Check, AlertCircle, Trash2, ChevronRight, ChevronLeft, DollarSign, Sparkles, Link } from 'lucide-react';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import api from '../services/apiService';

interface AddServiceWizardProps {
  onClose?: () => void;
  onSuccess: () => void;
  serviceToEdit?: any;
  standalone?: boolean;
}

interface WorkType {
  name: string;
  price: string;
}

interface SubServiceItem {
  id: string;
  name: string;
  description: string;
  image: string;
  workTypes: WorkType[];
  directPrice: string;
  pricingConfigured?: boolean;
}

export default function AddServiceWizard({ onClose, onSuccess, serviceToEdit, standalone }: AddServiceWizardProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // Step 1: Main Service State
  const [name, setName] = useState(serviceToEdit ? serviceToEdit.brand || serviceToEdit.name || '' : '');
  const [tagline, setTagline] = useState(serviceToEdit ? serviceToEdit.tagline || '' : '');
  const [description, setDescription] = useState(serviceToEdit ? serviceToEdit.description || '' : '');
  const [image, setImage] = useState(serviceToEdit ? serviceToEdit.image || serviceToEdit.imageUrl || '' : '');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>(
    serviceToEdit && (serviceToEdit.image || serviceToEdit.imageUrl || '').startsWith('http') ? 'url' : 'upload'
  );
  const [imageUrl, setImageUrl] = useState(
    serviceToEdit && (serviceToEdit.image || serviceToEdit.imageUrl || '').startsWith('http')
      ? serviceToEdit.image || serviceToEdit.imageUrl
      : ''
  );
  const [step1DragActive, setStep1DragActive] = useState(false);
  const [step1FileError, setStep1FileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Subservices State
  const [subservices, setSubservices] = useState<SubServiceItem[]>(() => {
    if (serviceToEdit && serviceToEdit.subServices) {
      return serviceToEdit.subServices.map((sub: any) => {
        const workTypesList: WorkType[] = [];
        let directPrice = '';
        
        if (sub.workTypes && sub.workTypes.length > 0) {
          sub.workTypes.forEach((wtName: string) => {
            const price = sub.prices && sub.prices[wtName] ? String(sub.prices[wtName]) : '';
            workTypesList.push({ name: wtName, price });
          });
          // Preserve Base Price / Standard Price from database if present!
          if (sub.prices && sub.prices['Base Price']) {
            directPrice = String(sub.prices['Base Price']);
          }
        } else if (sub.prices) {
          const keys = Object.keys(sub.prices);
          if (keys.length > 0) {
            if (sub.prices['Base Price']) {
              directPrice = String(sub.prices['Base Price']);
            } else {
              directPrice = String(sub.prices[keys[0]]);
            }
          }
        }
        
        return {
          id: sub.id || Math.random().toString(36).substring(2),
          name: sub.name || '',
          description: sub.description || '',
          image: sub.imageUrl || sub.image || '',
          workTypes: workTypesList,
          directPrice,
          pricingConfigured: true
        };
      });
    }
    return [];
  });
  const [showSubserviceForm, setShowSubserviceForm] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  // Subservice Form State (for adding/editing a subservice)
  const [subName, setSubName] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [subImage, setSubImage] = useState('');
  const [subImageMode, setSubImageMode] = useState<'upload' | 'url'>('upload');
  const [subImageUrl, setSubImageUrl] = useState('');
  const [subDragActive, setSubDragActive] = useState(false);
  const [subFileError, setSubFileError] = useState('');
  const subFileInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Work Types configuration per subservice
  const [activeSubForPricing, setActiveSubForPricing] = useState<string | null>(null);
  
  const [subWorkTypes, setSubWorkTypes] = useState<WorkType[]>([]);
  const [subDirectPrice, setSubDirectPrice] = useState('');
  const [subFormSubmitted, setSubFormSubmitted] = useState(false);
  const [subFormError, setSubFormError] = useState('');

  // ─── Drag & Drop Handlers ──────────────────────────────────────────────────
  const handleDrag = (e: React.DragEvent, setDragState: (active: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragState(true);
    } else if (e.type === "dragleave") {
      setDragState(false);
    }
  };

  const processFile = (file: File, setImageState: (b64: string) => void, setErrorState: (err: string) => void) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isValidExtension = ['png', 'jpg', 'jpeg'].includes(fileExtension || '');

    if (!validTypes.includes(file.type) && !isValidExtension) {
      setErrorState('Unsupported file format. Please upload .png, .jpg, or .jpeg');
      return;
    }

    setErrorState('');
    const reader = new FileReader();
    reader.onload = () => {
      setImageState(reader.result as string);
    };
    reader.onerror = () => {
      setErrorState('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDropStep1 = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStep1DragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0], setImage, setStep1FileError);
    }
  };

  const handleDropSub = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSubDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0], setSubImage, setSubFileError);
    }
  };

  // ─── Validation Helpers ────────────────────────────────────────────────────
  const validateStep1 = () => {
    return (
      name.trim() !== '' &&
      tagline.trim() !== '' &&
      description.trim() !== '' &&
      description.length <= 250 &&
      image !== ''
    );
  };

  const validateSubserviceForm = () => {
    if (!subName.trim() || !subDescription.trim() || subDescription.length > 150 || !subImage) {
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    return subservices.every(sub => {
      if (sub.workTypes.length > 0) {
        return sub.workTypes.every(wt => wt.name.trim() !== '' && wt.price.trim() !== '' && !isNaN(Number(wt.price)) && Number(wt.price) >= 0);
      } else {
        return sub.directPrice.trim() !== '' && !isNaN(Number(sub.directPrice)) && Number(sub.directPrice) >= 0;
      }
    });
  };

  // ─── Flow Actions ─────────────────────────────────────────────────────────
  const handleContinue = () => {
    setSubmitted(true);
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
        setGlobalError('');
      } else {
        setGlobalError('Please fix all errors in Step 1 before continuing.');
      }
    } else if (step === 2) {
      if (subservices.length > 0) {
        setStep(3);
        setGlobalError('');
      } else {
        setGlobalError('At least one subservice is required before continuing.');
      }
    }
  };

  const handleAddWorkType = () => {
    setSubWorkTypes([...subWorkTypes, { name: '', price: '' }]);
  };

  const handleRemoveWorkType = (index: number) => {
    setSubWorkTypes(subWorkTypes.filter((_, i) => i !== index));
  };

  const handleUpdateWorkType = (index: number, field: keyof WorkType, value: string) => {
    const updated = [...subWorkTypes];
    updated[index] = { ...updated[index], [field]: value };
    setSubWorkTypes(updated);
  };

  const handleSaveSubserviceItem = () => {
    setSubFormSubmitted(true);
    if (!validateSubserviceForm()) {
      setSubFormError('Please fill out all required fields (name, description ≤150 chars, image).');
      return;
    }

    const newItem: SubServiceItem = {
      id: editingSubId || Math.random().toString(36).substring(2),
      name: subName.trim(),
      description: subDescription.trim(),
      image: subImage,
      workTypes: editingSubId ? (subservices.find(s => s.id === editingSubId)?.workTypes || []) : [],
      directPrice: editingSubId ? (subservices.find(s => s.id === editingSubId)?.directPrice || '') : '',
    };

    if (editingSubId) {
      setSubservices(subservices.map(s => s.id === editingSubId ? newItem : s));
    } else {
      setSubservices([...subservices, newItem]);
    }

    // Reset subservice form state
    setShowSubserviceForm(false);
    setEditingSubId(null);
    setSubName('');
    setSubDescription('');
    setSubImage('');
    setSubImageMode('upload');
    setSubImageUrl('');
    setSubWorkTypes([]);
    setSubDirectPrice('');
    setSubFormSubmitted(false);
    setSubFormError('');
  };

  const handleEditSubservice = (sub: SubServiceItem) => {
    setEditingSubId(sub.id);
    setSubName(sub.name);
    setSubDescription(sub.description);
    setSubImage(sub.image);
    setSubImageMode(sub.image.startsWith('http') ? 'url' : 'upload');
    setSubImageUrl(sub.image.startsWith('http') ? sub.image : '');
    setSubWorkTypes(sub.workTypes);
    setSubDirectPrice(sub.directPrice);
    setShowSubserviceForm(true);
  };

  // Step 3: Update pricing for a subservice
  const handleUpdateSubservicePricing = (subId: string, workTypes: WorkType[], directPrice: string) => {
    setSubservices(subservices.map(s => s.id === subId ? { ...s, workTypes, directPrice } : s));
  };

  const handleDeleteSubservice = (id: string) => {
    setSubservices(subservices.filter(s => s.id !== id));
  };

  const handleFinishWizard = async () => {
    setGlobalError('');
    if (!validateStep1()) {
      setStep(1);
      setGlobalError('Main service details are invalid.');
      return;
    }
    if (subservices.length === 0) {
      setStep(2);
      setGlobalError('At least one subservice is required.');
      return;
    }
    if (!validateStep3()) {
      setGlobalError('Please configure valid pricing for all subservices.');
      return;
    }

    setSaving(true);
    try {
      // 1. Upload main service image to Firebase Storage if it's base64/new
      let mainImageUrl = image;
      if (image && image.startsWith('data:')) {
        const uploadRes = await api.post('/api/upload/image', {
          image: image,
          folder: 'services',
        });
        mainImageUrl = uploadRes.data.url;
      }

      // 2. Format subservices list
      const formattedSubservices = [];
      for (const sub of subservices) {
        let subImageUrl = sub.image;
        if (sub.image && sub.image.startsWith('data:')) {
          const subUploadRes = await api.post('/api/upload/image', {
            image: sub.image,
            folder: 'subservices',
          });
          subImageUrl = subUploadRes.data.url;
        }

        const workTypesList = sub.workTypes.map(w => w.name);
        const pricesMap: Record<string, string> = {};
        
        if (sub.workTypes.length > 0) {
          sub.workTypes.forEach(wt => {
            pricesMap[wt.name] = wt.price;
          });
          // Preserve the Base Price / Standard Price if it exists
          if (sub.directPrice) {
            pricesMap['Base Price'] = sub.directPrice;
          }
        } else {
          pricesMap['Base Price'] = sub.directPrice;
        }

        formattedSubservices.push({
          id: sub.id || Math.random().toString(36).substring(2),
          name: sub.name,
          description: sub.description,
          imageUrl: subImageUrl,
          workTypes: workTypesList,
          prices: pricesMap,
        });
      }

      if (serviceToEdit) {
        // Edit Mode: Update service category
        const serviceId = serviceToEdit.id;
        await api.put(`/api/services/${serviceId}`, {
          name: name.trim(),
          description: description.trim(),
          tagline: tagline.trim(),
          imageUrl: mainImageUrl,
          subServices: formattedSubservices,
        });
      } else {
        // Add Mode: Create service category
        const mainResponse = await api.post('/api/services', {
          name: name.trim(),
          description: description.trim(),
          tagline: tagline.trim(),
          imageUrl: mainImageUrl,
        });

        const serviceId = mainResponse.data.id;
        if (!serviceId) {
          throw new Error('Failed to retrieve created service ID');
        }

        // Add each subservice via individual requests
        for (const sub of formattedSubservices) {
          await api.post(`/api/services/${serviceId}/subservices`, {
            name: sub.name,
            description: sub.description,
            imageUrl: sub.imageUrl,
            workTypes: sub.workTypes,
            prices: sub.prices,
          });
        }
      }

      onSuccess();
    } catch (err: any) {
      console.error(err);
      setGlobalError(err.response?.data?.message || 'Failed to successfully save service wizard data.');
    } finally {
      setSaving(false);
    }
  };

  const [deleting, setDeleting] = useState(false);

  const handleDeleteService = async () => {
    if (!serviceToEdit) return;
    const confirmDelete = window.confirm("Are you sure you want to remove this service?");
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      console.log("[CAVEMAN] Initiating permanent deletion of service", serviceToEdit.id);
      await api.delete(`/api/services/${serviceToEdit.id}`);
      console.log("[CAVEMAN] Successfully deleted service", serviceToEdit.id);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("[CAVEMAN] Error deleting service", err);
      setGlobalError(err.response?.data?.message || 'Failed to permanently delete this service.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={standalone ? "w-full max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl" : "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"} onClick={standalone ? undefined : () => onClose && onClose()}>
      <motion.div 
        initial={standalone ? undefined : { opacity: 0, scale: 0.95, y: 15 }} 
        animate={standalone ? undefined : { opacity: 1, scale: 1, y: 0 }} 
        exit={standalone ? undefined : { opacity: 0, scale: 0.95, y: 15 }}
        transition={standalone ? undefined : { duration: 0.25, ease: 'easeOut' }}
        className={standalone ? "w-full flex flex-col" : "w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl"}
        onClick={standalone ? undefined : e => e.stopPropagation()}
      >
        {/* Wizard Header */}
        <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-850 bg-gradient-to-r from-brand-navy/5 to-transparent flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-navy dark:bg-brand-green/20 flex items-center justify-center text-white dark:text-brand-green">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                {serviceToEdit ? 'Edit Service' : 'Add New Service'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {serviceToEdit ? 'Update service category details' : 'Multi-step service category builder'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {serviceToEdit && (
              <button 
                onClick={handleDeleteService}
                disabled={deleting}
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-650 transition-colors border border-red-500/20"
                title="Delete Service"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Wizard Progress Bar */}
        <div className="px-8 py-5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-center gap-4 sm:gap-6 flex-shrink-0">
          {[
            { id: 1, label: 'Main Service' },
            { id: 2, label: 'Subservices' },
            { id: 3, label: 'Work Types & Pricing' }
          ].map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step >= s.id 
                    ? 'bg-brand-navy dark:bg-brand-green text-white shadow-md shadow-brand-navy/10 dark:shadow-brand-green/10' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}>
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span className={`text-xs font-bold transition-all duration-300 hidden sm:inline ${
                  step >= s.id ? 'text-slate-800 dark:text-white' : 'text-slate-400'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div className={`w-8 sm:w-12 h-0.5 rounded transition-all duration-300 ${
                  step > s.id ? 'bg-brand-navy dark:bg-brand-green' : 'bg-slate-200 dark:bg-slate-800'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Wizard Error Banner */}
        {globalError && (
          <div className="mx-8 mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex gap-3 items-center">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{globalError}</span>
          </div>
        )}

        {/* Wizard Scrollable Content */}
        <div className="flex-grow overflow-y-auto px-8 py-6 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* ─── STEP 1: Main Service Details ─── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Service Category Name *</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="input-base w-full text-sm rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-navy/20 transition-shadow outline-none"
                    placeholder="e.g. PoolFix" 
                  />
                  {submitted && !name.trim() && (
                    <p className="text-xs text-red-500 font-medium mt-1">Service category name is required.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Tagline *</label>
                  <input 
                    type="text" 
                    value={tagline} 
                    onChange={e => setTagline(e.target.value)}
                    className="input-base w-full text-sm rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-navy/20 transition-shadow outline-none"
                    placeholder="e.g. Professional Pool Care & Maintenance" 
                  />
                  {submitted && !tagline.trim() && (
                    <p className="text-xs text-red-500 font-medium mt-1">Tagline is required.</p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description *</label>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${description.length > 250 ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      {description.length} / 250
                    </span>
                  </div>
                  <textarea 
                    value={description} 
                    onChange={e => { if (e.target.value.length <= 250) setDescription(e.target.value); }}
                    maxLength={250}
                    className="input-base w-full text-sm min-h-[100px] rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-navy/20 transition-shadow outline-none resize-none"
                    placeholder="Describe what this service category offers..." 
                  />
                  {submitted && !description.trim() && (
                    <p className="text-xs text-red-500 font-medium mt-1">Description is required.</p>
                  )}
                </div>

                {/* Image Upload / URL */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Service Image *</label>
                  
                  {/* Upload / URL toggle tabs */}
                  <div className="flex gap-1 mb-2">
                    <button onClick={() => setImageMode('upload')} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${imageMode === 'upload' ? 'bg-brand-navy text-white dark:bg-brand-green' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                      <Upload className="w-3.5 h-3.5" /> Upload
                    </button>
                    <button onClick={() => setImageMode('url')} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${imageMode === 'url' ? 'bg-brand-navy text-white dark:bg-brand-green' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                      <Link className="w-3.5 h-3.5" /> URL
                    </button>
                  </div>

                  {imageMode === 'upload' ? (
                    image ? (
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-44 group">
                        <img src={image} alt="Main Service Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={() => { setImage(''); setImageUrl(''); }}
                            className="p-3 bg-red-650 hover:bg-red-600 rounded-full text-white shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragEnter={e => handleDrag(e, setStep1DragActive)}
                        onDragLeave={e => handleDrag(e, setStep1DragActive)}
                        onDragOver={e => handleDrag(e, setStep1DragActive)}
                        onDrop={handleDropStep1}
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${step1DragActive ? 'border-brand-navy bg-brand-navy/5 dark:border-brand-green dark:bg-brand-green/5' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/20'}`}
                      >
                        <Upload className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2.5" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Drag & drop service image here</p>
                        <p className="text-xs text-slate-400 mt-1">Accepts only .png, .jpg, .jpeg formats</p>
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              processFile(e.target.files[0], setImage, setStep1FileError);
                            }
                          }}
                          accept="image/png, image/jpeg, image/jpg"
                          className="hidden" 
                        />
                      </div>
                    )
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={e => {
                          const val = e.target.value;
                          setImageUrl(val);
                          // Auto-set image when URL looks valid
                          if (val.trim().match(/^https?:\/\/.+\..+/)) {
                            setImage(val.trim());
                          } else {
                            setImage('');
                          }
                        }}
                        className="w-full text-sm rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-navy/20"
                        placeholder="https://example.com/image.png"
                      />
                      {imageUrl.trim().match(/^https?:\/\/.+\..+/) && (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-44">
                          <img
                            src={imageUrl.trim()}
                            alt="URL Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {step1FileError && (
                    <p className="text-xs text-red-500 font-medium mt-1">{step1FileError}</p>
                  )}
                  {submitted && !image && (
                    <p className="text-xs text-red-500 font-medium mt-1">Service image is required.</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─── STEP 2: Subservices & Pricing ─── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Subservice Creator Form (Show inline inside the wizard step) */}
                {showSubserviceForm ? (
                  <Card className="border-brand-navy/20 dark:border-brand-green/20 bg-slate-50/40 dark:bg-slate-800/20">
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-brand-navy dark:text-brand-green" />
                          {editingSubId ? 'Edit Subservice' : 'Create Subservice'}
                        </h4>
                        <button 
                          onClick={() => {
                            setShowSubserviceForm(false);
                            setEditingSubId(null);
                            setSubFormError('');
                          }} 
                          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {subFormError && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex gap-2 items-center">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span className="font-semibold">{subFormError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Subservice Name *</label>
                            <input 
                              type="text" 
                              value={subName} 
                              onChange={e => setSubName(e.target.value)}
                              className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-navy/20"
                              placeholder="e.g. Deep Cleaning" 
                            />
                            {subFormSubmitted && !subName.trim() && (
                              <p className="text-[10px] text-red-500 font-semibold mt-0.5">Subservice name is required.</p>
                            )}
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description *</label>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${subDescription.length > 150 ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                {subDescription.length} / 150
                              </span>
                            </div>
                            <textarea 
                              value={subDescription} 
                              onChange={e => { if (e.target.value.length <= 150) setSubDescription(e.target.value); }}
                              maxLength={150}
                              className="w-full text-xs min-h-[70px] rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-navy/20 resize-none"
                              placeholder="Describe this subservice..." 
                            />
                            {subFormSubmitted && !subDescription.trim() && (
                              <p className="text-[10px] text-red-500 font-semibold mt-0.5">Description is required.</p>
                            )}
                          </div>
                        </div>

                        {/* Subservice Image */}
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Subservice Image *</label>
                          
                          {/* Upload / URL toggle */}
                          <div className="flex gap-1 mb-1.5">
                            <button onClick={() => setSubImageMode('upload')} className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${subImageMode === 'upload' ? 'bg-brand-navy text-white dark:bg-brand-green' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                              <Upload className="w-3 h-3" /> Upload
                            </button>
                            <button onClick={() => setSubImageMode('url')} className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${subImageMode === 'url' ? 'bg-brand-navy text-white dark:bg-brand-green' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                              <Link className="w-3 h-3" /> URL
                            </button>
                          </div>

                          {subImageMode === 'upload' ? (
                            subImage ? (
                              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-28 group">
                                <img src={subImage} alt="Subservice Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button 
                                    onClick={() => { setSubImage(''); setSubImageUrl(''); }}
                                    className="p-2 bg-red-650 hover:bg-red-650 rounded-full text-white shadow"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onDragEnter={e => handleDrag(e, setSubDragActive)}
                                onDragLeave={e => handleDrag(e, setSubDragActive)}
                                onDragOver={e => handleDrag(e, setSubDragActive)}
                                onDrop={handleDropSub}
                                onClick={() => subFileInputRef.current?.click()}
                                className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${subDragActive ? 'border-brand-navy bg-brand-navy/5 dark:border-brand-green dark:bg-brand-green/5' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/20'}`}
                              >
                                <Upload className="w-5 h-5 text-slate-400 dark:text-slate-600 mb-1" />
                                <p className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300">Drag & drop subservice image</p>
                                <input 
                                  type="file" 
                                  ref={subFileInputRef}
                                  onChange={e => {
                                    if (e.target.files && e.target.files[0]) {
                                      processFile(e.target.files[0], setSubImage, setSubFileError);
                                    }
                                  }}
                                  accept="image/png, image/jpeg, image/jpg"
                                  className="hidden" 
                                />
                              </div>
                            )
                          ) : (
                            <div className="space-y-1.5">
                              <input
                                type="url"
                                value={subImageUrl}
                                onChange={e => {
                                  const val = e.target.value;
                                  setSubImageUrl(val);
                                  // Auto-set subservice image when URL looks valid
                                  if (val.trim().match(/^https?:\/\/.+\..+/)) {
                                    setSubImage(val.trim());
                                  } else {
                                    setSubImage('');
                                  }
                                }}
                                className="w-full text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-navy/20"
                                placeholder="https://example.com/image.png"
                              />
                              {subImageUrl.trim().match(/^https?:\/\/.+\..+/) && (
                                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-28">
                                  <img
                                    src={subImageUrl.trim()}
                                    alt="Subservice URL Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                          {subFileError && (
                            <p className="text-[10px] text-red-500 font-semibold mt-0.5">{subFileError}</p>
                          )}
                          {subFormSubmitted && !subImage && (
                            <p className="text-[10px] text-red-500 font-semibold mt-0.5">Image is required.</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setShowSubserviceForm(false);
                            setEditingSubId(null);
                            setSubFormError('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="success" 
                          size="sm" 
                          onClick={handleSaveSubserviceItem}
                        >
                          {editingSubId ? 'Save Changes' : 'Add Subservice'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Subservices List</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">At least one subservice is required.</p>
                    </div>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => {
                        setShowSubserviceForm(true);
                        setEditingSubId(null);
                        setSubName('');
                        setSubDescription('');
                        setSubImage('');
                        setSubImageMode('upload');
                        setSubImageUrl('');
                        setSubWorkTypes([]);
                        setSubDirectPrice('');
                        setSubFormSubmitted(false);
                        setSubFormError('');
                      }} 
                      icon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add Subservice
                    </Button>
                  </div>
                )}

                {/* List of Added Subservices */}
                {subservices.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {subservices.map(sub => (
                      <div 
                        key={sub.id} 
                        className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="flex gap-3 items-start">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                              <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{sub.name}</h5>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">{sub.description}</p>
                            </div>
                          </div>

                          <div className="border-t border-slate-50 dark:border-slate-800/50 pt-2.5">
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Pricing configured in Step 3</p>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end border-t border-slate-50 dark:border-slate-850 pt-3 mt-3">
                          <button 
                            onClick={() => handleEditSubservice(sub)}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteSubservice(sub.id)}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-500/5 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  !showSubserviceForm && (
                    <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No subservices added yet.</p>
                      <p className="text-xs text-slate-400 mt-0.5">Please add at least one subservice to complete setup.</p>
                    </div>
                  )
                )}

                {submitted && subservices.length === 0 && (
                  <p className="text-xs text-red-500 font-semibold mt-1"></p>
                )}
              </motion.div>
            )}

            {/* ─── STEP 3: Work Types & Pricing ─── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Configure Work Types & Pricing</h4>
                  <p className="text-xs text-slate-500 mt-0.5">For each subservice, optionally add work types with individual prices. If no work types, a direct price is required.</p>
                </div>

                {subservices.map(sub => {
                  const isActive = activeSubForPricing === sub.id;
                  return (
                    <Card key={sub.id} className={`${isActive ? 'border-brand-navy/30 dark:border-brand-green/30' : 'border-slate-100 dark:border-slate-800'}`}>
                      <div className="p-4">
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setActiveSubForPricing(isActive ? null : sub.id)}
                        >
                          <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                              <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">{sub.name}</h5>
                              <p className="text-[10px] text-slate-500">
                                {sub.workTypes.length > 0 
                                  ? `${sub.workTypes.length} work type(s)` 
                                  : sub.directPrice 
                                    ? `Direct: ₱${sub.directPrice}` 
                                    : 'No pricing set'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                        </div>

                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Work Types</h5>
                                <p className="text-[10px] text-slate-500 mt-0.5">Optional. Each work type requires its own price.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...sub.workTypes, { name: '', price: '' }];
                                  handleUpdateSubservicePricing(sub.id, updated, sub.directPrice);
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-navy hover:text-brand-navy/90 dark:text-brand-green dark:hover:text-brand-green/80 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add Work Type
                              </button>
                            </div>

                            {sub.workTypes.length > 0 ? (
                              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {sub.workTypes.map((wt, index) => (
                                  <div key={index} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center p-2.5 sm:p-0 rounded-xl bg-slate-50 dark:bg-slate-900/50 sm:bg-transparent dark:sm:bg-transparent border border-slate-100 dark:border-slate-800/60 sm:border-none">
                                    <textarea 
                                      value={wt.name}
                                      onChange={e => {
                                        const updated = [...sub.workTypes];
                                        updated[index] = { ...updated[index], name: e.target.value };
                                        handleUpdateSubservicePricing(sub.id, updated, sub.directPrice);
                                      }}
                                      rows={1}
                                      className="flex-grow text-xs rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-navy/20 resize-none overflow-hidden min-h-[36px]"
                                      placeholder="Work Type (e.g. Standard Mattress)"
                                      onInput={e => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = `${target.scrollHeight}px`;
                                      }}
                                    />
                                    <div className="flex gap-2 items-center">
                                      <div className="relative flex-grow sm:w-28">
                                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input 
                                          type="text"
                                          value={wt.price}
                                          onChange={e => {
                                            const updated = [...sub.workTypes];
                                            updated[index] = { ...updated[index], price: e.target.value };
                                            handleUpdateSubservicePricing(sub.id, updated, sub.directPrice);
                                          }}
                                          className="w-full pl-7 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-navy/20"
                                          placeholder="Enter price"
                                        />
                                      </div>
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          const updated = sub.workTypes.filter((_, i) => i !== index);
                                          handleUpdateSubservicePricing(sub.id, updated, sub.directPrice);
                                        }}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                {submitted && sub.workTypes.some(w => !w.name.trim() || !w.price.trim() || isNaN(Number(w.price)) || Number(w.price) < 0) && (
                                  <p className="text-[10px] text-red-500 font-semibold mt-1">Each work type requires a name and a valid price.</p>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Direct Subservice Price (₱) *</label>
                                <div className="relative max-w-xs">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₱</span>
                                  <input 
                                    type="text"
                                    value={sub.directPrice}
                                    onChange={e => handleUpdateSubservicePricing(sub.id, sub.workTypes, e.target.value)}
                                    className="w-full pl-7 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-navy/20"
                                    placeholder="Enter price"
                                  />
                                </div>
                                {submitted && (!sub.directPrice.trim() || isNaN(Number(sub.directPrice)) || Number(sub.directPrice) < 0) && (
                                  <p className="text-[10px] text-red-500 font-semibold mt-1">A valid price is required when no work types are added.</p>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Wizard Footer Controls */}
        <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/10 flex items-center justify-between flex-shrink-0">
          <div>
            {step > 1 && (
              <Button 
                variant="ghost" 
                onClick={() => setStep(step - 1)}
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            {step < 3 ? (
              <Button 
                variant="primary" 
                onClick={handleContinue}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            ) : (
              <Button 
                variant="success" 
                onClick={handleFinishWizard}
                loading={saving}
                disabled={subservices.length === 0}
                icon={<Check className="w-4 h-4" />}
              >
                Save Service
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
