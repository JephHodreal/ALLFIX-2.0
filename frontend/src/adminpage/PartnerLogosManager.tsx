import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image, X, AlertCircle, Edit2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../components/shared/Card';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/shared/Button';
import api from '../services/apiService';
import { AdminPageHeader } from '../components/shared/AdminPageHeader';

const SortableLogoCard = ({ logo, onEdit, onDelete, failedLogos, setFailedLogos }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: logo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-white dark:bg-slate-900 border ${isDragging ? 'border-brand-blue shadow-2xl scale-105' : 'border-slate-200 dark:border-slate-800 shadow-md'} hover:shadow-lg rounded-3xl p-6 transition-all flex flex-col justify-between items-center min-h-[180px] cursor-grab active:cursor-grabbing`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-3 left-3 p-1.5 text-slate-300 hover:text-slate-500 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-grab active:cursor-grabbing outline-none"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(logo)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-navy hover:bg-slate-100 dark:hover:bg-slate-800 transition-all pointer-events-auto"
          title="Edit Partner Logo"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(logo.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-550 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all pointer-events-auto"
          title="Delete Partner Logo"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-2 w-full min-h-[100px] pointer-events-none">
        {failedLogos[logo.id] ? (
          <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <Image className="w-8 h-8 mb-1.5 opacity-60" />
            <span className="text-[10px] font-extrabold text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
              Invalid Image Link
            </span>
          </div>
        ) : (
          <img
            src={logo.url}
            alt={logo.name}
            className="h-[80px] w-full object-contain filter dark:brightness-90 transition-transform group-hover:scale-105"
            onError={() => {
              setFailedLogos((prev: Record<string, boolean>) => ({ ...prev, [logo.id]: true }));
            }}
          />
        )}
      </div>

      <div className="mt-4 text-center pointer-events-none">
        <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 block truncate max-w-[200px]">
          {logo.name}
        </span>
      </div>
    </div>
  );
};

export default function PartnerLogosManager() {
  const [logos, setLogos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

  // Form states
  const [name, setName] = useState('');
  const [urlType, setUrlType] = useState<'upload' | 'link'>('upload');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  const loadLogos = () => {
    setLoading(true);
    api.get('/api/partner-logos')
      .then(res => {
        setLogos(res.data || []);
      })
      .catch(err => {
        console.error('Failed to load partner logos', err);
      })
      .finally(() => setLoading(false));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadLogos();
  }, []);

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await api.post('/api/upload/image', {
          image: base64Data,
          folder: 'partner-logos'
        });
        setLogoUrl(res.data.url);
      } catch (err: any) {
        console.error('Upload failed', err);
        setError('Failed to upload image. Please try again.');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Partner name is required.');
      return;
    }
    if (!logoUrl.trim()) {
      setError('Logo image or link is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        url: logoUrl.trim()
      };

      if (editingId) {
        await api.put(`/api/admin/partner-logos/${editingId}`, payload);
      } else {
        await api.post('/api/admin/partner-logos', payload);
      }
      setShowAddModal(false);
      setEditingId(null);

      // Reset
      setName('');
      setLogoUrl('');
      setUrlType('upload');
      setPreviewFailed(false);

      loadLogos();
    } catch (err: any) {
      console.error('Failed to add partner logo', err);
      const detail = err?.response?.data?.message || err?.message || 'Unknown error';
      setError(`Failed to add partner logo: ${detail}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this partner logo?')) {
      try {
        await api.delete(`/api/admin/partner-logos/${id}`);
        setLogos(prev => prev.filter(logo => logo.id !== id));
      } catch (err) {
        console.error('Failed to delete partner logo', err);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = logos.findIndex((item) => item.id === active.id);
      const newIndex = logos.findIndex((item) => item.id === over?.id);
      
      const newOrder = arrayMove(logos, oldIndex, newIndex);
      setLogos(newOrder); // Optimistic UI update
      
      try {
        const ids = newOrder.map(logo => logo.id);
        await api.post('/api/admin/partner-logos/reorder', ids);
      } catch (err) {
        console.error('Failed to save new order', err);
        loadLogos();
      }
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Partner Logos"
        subtitle="Manage the partner logos displayed in the auto-scrolling ticker on the Vendor Landing page."
        icon={<Image />}
        action={
          <Button onClick={() => { 
            setEditingId(null);
            setName('');
            setLogoUrl('');
            setUrlType('upload');
            setShowAddModal(true); 
            setError(''); 
            setPreviewFailed(false); 
          }} icon={<Plus className="w-4 h-4" />}>
            Add Partner Logo
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-3xl" />
          ))}
        </div>
      ) : logos.length === 0 ? (
        <EmptyState
          title="No Partner Logos Configured"
          description="Click 'Add Partner Logo' to upload image files or provide links of partner logos."
        />
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <SortableContext 
              items={logos.map(l => l.id)}
              strategy={rectSortingStrategy}
            >
              {logos.map((logo) => (
                <SortableLogoCard 
                  key={logo.id} 
                  logo={logo} 
                  failedLogos={failedLogos}
                  setFailedLogos={setFailedLogos}
                  onEdit={(editedLogo: any) => {
                    setEditingId(editedLogo.id);
                    setName(editedLogo.name);
                    setLogoUrl(editedLogo.url);
                    setUrlType(editedLogo.url.startsWith('http') && !editedLogo.url.includes('firebase') ? 'link' : 'upload');
                    setShowAddModal(true);
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      )}

      {/* Add Partner Logo Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div
            className="w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {editingId ? 'Edit Partner Logo' : 'Add Partner Logo'}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold">
                      {editingId ? 'Update the image or link for this partner logo' : 'Upload an image or add a link to the partner\'s logo'}
                    </p>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex gap-2 items-center">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Partner Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Cloudflare"
                      required
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Logo Source *</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => { setUrlType('upload'); setLogoUrl(''); }}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${urlType === 'upload' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400'}`}
                      >
                        Upload Image
                      </button>
                      <button
                        type="button"
                        onClick={() => { setUrlType('link'); setLogoUrl(''); }}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${urlType === 'link' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400'}`}
                      >
                        Image Link / URL
                      </button>
                    </div>
                  </div>

                  {urlType === 'upload' ? (
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                        Upload Logo File
                      </label>
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-350 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative group">
                        {uploadingImage ? (
                          <div className="text-xs text-slate-500 font-bold animate-pulse">Uploading Image...</div>
                        ) : logoUrl ? (
                          <div className="relative w-full h-32 rounded-xl overflow-hidden flex items-center justify-center bg-white dark:bg-slate-900">
                            <img src={logoUrl} alt="Preview" className="max-h-full max-w-full object-contain p-2" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLogoUrl('');
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-lg transition-colors z-10"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Plus className="w-6 h-6 text-slate-400 mb-2" />
                            <p className="text-xs font-semibold text-slate-650 dark:text-slate-400">
                              Click to upload logo image
                            </p>
                            <p className="text-[10px] text-slate-450 mt-1">PNG, JPG, SVG, or WEBP allowed</p>
                          </>
                        )}
                        {!logoUrl && !uploadingImage && (
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleUploadLogo}
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Logo Image URL *</label>
                        <input
                          type="url"
                          value={logoUrl}
                          onChange={e => {
                            setLogoUrl(e.target.value);
                            setPreviewFailed(false);
                          }}
                          placeholder="https://example.com/logo.png"
                          required
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400"
                        />
                      </div>
                      {logoUrl && (
                        <div>
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Link Preview</label>
                          <div className="w-full h-24 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-800/30 p-2">
                            {previewFailed ? (
                              <div className="text-center text-[10px] text-red-500 font-bold flex flex-col items-center">
                                <AlertCircle className="w-5 h-5 mb-1 text-red-500" />
                                <span>Unable to load image. Please verify the link.</span>
                              </div>
                            ) : (
                              <img
                                src={logoUrl}
                                alt="Link Preview"
                                className="max-h-full max-w-full object-contain"
                                onError={() => setPreviewFailed(true)}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="py-2.5 px-4 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <Button
                      type="submit"
                      disabled={uploadingImage || saving}
                    >
                      {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Logo'}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
