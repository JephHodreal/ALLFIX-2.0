function VendorProfileTab() {
  const { profile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { confirm: showAlert, ConfirmComponent } = useConfirm();
  
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  
  const [isEditingOps, setIsEditingOps] = useState(false);
  const [opsData, setOpsData] = useState({
    contact_person: '',
    phone: '',
    street: '',
    city: '',
    region: '',
    postal_code: ''
  });

  const [isEditingPayout, setIsEditingPayout] = useState(false);
  const [payoutData, setPayoutData] = useState({
    account_name: '',
    bank_name: '',
    account_number: ''
  });

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setAvatarUrl((profile as any).avatar_url || '');
      setOpsData({
        contact_person: (profile as any).contact_person || '',
        phone: (profile as any).phone || '',
        street: (profile as any).street || '',
        city: (profile as any).city || '',
        region: (profile as any).region || 'National Capital Region',
        postal_code: (profile as any).postal_code || ''
      });
      setPayoutData({
        account_name: (profile as any).account_name || '',
        bank_name: (profile as any).bank_name || '',
        account_number: (profile as any).account_number || ''
      });
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarUrl(URL.createObjectURL(file));
      setSelectedAvatar(file);
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) return;
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const res = await api.post('/api/upload/image', {
          image: reader.result,
          folder: 'vendors/avatar'
        });
        await api.put(\`/api/vendors/\${profile?.id}\`, { avatar_url: res.data.url });
        showAlert({ title: 'Success', message: 'Company logo updated!', type: 'success', hideCancel: true });
        setSelectedAvatar(null);
        await refreshProfile();
      };
      reader.readAsDataURL(selectedAvatar);
    } catch (err) {
      showAlert({ title: 'Error', message: 'Failed to upload logo.', type: 'danger', hideCancel: true });
    }
  };

  const handleSaveOps = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(\`/api/vendors/\${profile?.id}\`, opsData);
      setIsEditingOps(false);
      await refreshProfile();
      showAlert({ title: 'Success', message: 'Operations details updated.', type: 'success', hideCancel: true });
    } catch (err) {
      showAlert({ title: 'Error', message: 'Failed to save operations details.', type: 'danger', hideCancel: true });
    }
  };

  const handleSavePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(\`/api/vendors/\${profile?.id}\`, payoutData);
      setIsEditingPayout(false);
      await refreshProfile();
      showAlert({ title: 'Success', message: 'Payout details updated.', type: 'success', hideCancel: true });
    } catch (err) {
      showAlert({ title: 'Error', message: 'Failed to save payout details.', type: 'danger', hideCancel: true });
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, title: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(fieldName);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const res = await api.post('/api/upload/image', {
          image: reader.result,
          folder: 'vendors/documents'
        });
        await api.put(\`/api/vendors/\${profile?.id}\`, { [fieldName]: res.data.url });
        await refreshProfile();
        showAlert({ title: 'Success', message: \`\${title} updated successfully. Awaiting Admin verification.\`, type: 'info', hideCancel: true });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showAlert({ title: 'Error', message: \`Failed to upload \${title}.\`, type: 'danger', hideCancel: true });
    } finally {
      setUploadingDoc(null);
    }
  };

  if (!profile) return <EmptyState title="Profile not loaded" />;

  const btnBase = "inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 w-full sm:w-auto";
  const btnSuccess = \`\${btnBase} text-white bg-brand-green hover:bg-[#005e3f] focus:ring-brand-green dark:bg-brand-green dark:hover:bg-[#005e3f]\`;
  const btnGhost = \`\${btnBase} text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 focus:ring-slate-900 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700\`;
  const inputClass = "w-full mt-1.5 px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-white dark:focus:ring-white transition-all shadow-sm";

  const EditButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className={btnGhost}>
      <Edit className="w-4 h-4 shrink-0" /> Edit
    </button>
  );

  return (
    <div className="space-y-3 h-full flex flex-col">
      <AdminPageHeader
        title="Company Profile"
        subtitle="Manage your vendor identity, business compliance, and payout details."
        icon={<Building2 />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch flex-1 pb-2">
        {/* ─── LEFT COLUMN ─── */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <Card className="flex flex-col items-center justify-center text-center p-4">
            <div className="relative group mb-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-10 h-10 text-slate-400" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer focus:outline-none"
              >
                <span className="text-xs font-semibold">Change Logo</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white break-words w-full">
              {(profile as any).company_name || profile.first_name + ' ' + profile.last_name}
            </h2>
            {(() => {
              const status = (profile as any).acc_approve;
              if (status === 'approved') return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-green/10 text-brand-green border border-brand-green/20 mt-1 mb-3">
                  <Check className="w-3 h-3" /> Verified
                </span>
              );
              if (status === 'pending') return (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 mt-1 mb-3">
                  Pending Review
                </span>
              );
              return (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 mt-1 mb-3">
                  Unverified
                </span>
              );
            })()}
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate w-full mb-2">
              {profile.email}
            </p>
            <div className="w-full flex flex-col gap-2">
              {!selectedAvatar ? (
                <button onClick={() => fileInputRef.current?.click()} className={\`\${btnGhost} w-full\`}>Upload Logo</button>
              ) : (
                <div className="flex gap-2 w-full">
                  <button onClick={() => { setAvatarUrl((profile as any).avatar_url || ''); setSelectedAvatar(null); }} className={\`\${btnGhost} flex-1\`}>Cancel</button>
                  <button onClick={handleSaveAvatar} className={\`\${btnSuccess} flex-1\`}>Save</button>
                </div>
              )}
            </div>
          </Card>

          {/* Operations Card */}
          <Card className="flex flex-col p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">Headquarters & Operations</h2>
              {!isEditingOps && <EditButton onClick={() => setIsEditingOps(true)} />}
            </div>
            {!isEditingOps ? (
              <div className="flex flex-col gap-y-4 py-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                  <div className="flex flex-col">
                    <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-0.5">Contact Person</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{(profile as any).contact_person || '—'}</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-0.5">Primary Phone</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{(profile as any).phone || '—'}</p>
                  </div>
                  <div className="flex flex-col sm:col-span-2">
                    <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-0.5">HQ Address</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {[
                        (profile as any).street,
                        (profile as any).city,
                        (profile as any).region,
                        (profile as any).postal_code
                      ].filter(Boolean).join(', ') || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col border-t border-slate-100 dark:border-slate-800 pt-3">
                  <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">Approved Service Categories</p>
                  <div className="flex flex-wrap gap-1.5">
                    {((profile as any).services || []).length > 0 ? ((profile as any).services || []).map((s: any, idx: number) => (
                       <span key={idx} className="px-2.5 py-1 bg-brand-navy/5 text-brand-navy dark:bg-brand-green/10 dark:text-brand-green font-bold text-[10px] rounded-lg border border-brand-navy/10 dark:border-brand-green/20">{s.service}</span>
                    )) : (
                       <span className="text-xs font-medium text-slate-500 italic">No services approved yet.</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveOps} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Contact Person Name</label>
                    <input required type="text" value={opsData.contact_person} onChange={(e) => setOpsData({ ...opsData, contact_person: e.target.value })} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Phone</label>
                    <input required type="text" value={opsData.phone} onChange={(e) => setOpsData({ ...opsData, phone: e.target.value })} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2 border-t border-slate-200 dark:border-slate-700 pt-2 mt-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Street / Bldg / Barangay</label>
                    <input required type="text" value={opsData.street} onChange={(e) => setOpsData({ ...opsData, street: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">City</label>
                    <input required type="text" value={opsData.city} onChange={(e) => setOpsData({ ...opsData, city: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Region</label>
                    <input type="text" value={opsData.region} onChange={(e) => setOpsData({ ...opsData, region: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Postal Code</label>
                    <input type="text" value={opsData.postal_code} onChange={(e) => setOpsData({ ...opsData, postal_code: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsEditingOps(false)} className={btnGhost}>Cancel</button>
                  <button type="submit" className={btnSuccess}>Save Changes</button>
                </div>
              </form>
            )}
          </Card>

          {/* Information Security Card */}
          <Card className="flex flex-col flex-1 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">Information Security</h2>
              <EditButton onClick={() => showAlert({ title: 'Information Security', message: 'Contact Admin to change business email or reset password.', type: 'info', hideCancel: true })} />
            </div>
            <div className="grid grid-cols-1 gap-y-3">
              <div className="flex flex-col">
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-0.5">Business Email</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.email}</p>
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-0.5">Password</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">••••••••••••</p>
              </div>
            </div>
          </Card>
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {/* Compliance Card */}
          <Card className="flex flex-col p-4 flex-1">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white mb-3">Compliance & Permits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'business_permit_url', label: 'Business Permit' },
                { key: 'bir_certificate_url', label: 'BIR Certificate' },
                { key: 'professional_license_url', label: 'Professional License' },
                { key: 'proof_of_insurance_url', label: 'Proof of Insurance' }
              ].map(doc => {
                 const url = (profile as any)[doc.key];
                 return (
                   <div key={doc.key} className="flex flex-col items-center justify-center p-4 border rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                     <div className="w-full h-32 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg mb-3 overflow-hidden relative group">
                        {url ? (
                           <>
                             {url.toLowerCase().endsWith('.pdf') ? <FileText className="w-10 h-10 text-brand-navy" /> : <img src={url} alt={doc.label} className="w-full h-full object-cover" />}
                             <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <a href={url} target="_blank" rel="noreferrer" className="text-white text-xs font-bold mb-2 hover:underline">View Document</a>
                                <label className="cursor-pointer bg-brand-green text-white text-[10px] font-bold px-3 py-1.5 rounded-full hover:bg-[#005e3f] transition-colors">
                                   Update File
                                   <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleDocumentUpload(e, doc.key, doc.label)} />
                                </label>
                             </div>
                           </>
                        ) : (
                           <div className="flex flex-col items-center justify-center w-full h-full text-slate-400">
                              {uploadingDoc === doc.key ? (
                                <span className="text-xs font-medium animate-pulse">Uploading...</span>
                              ) : (
                                <>
                                  <ClipboardList className="w-6 h-6 mb-1 opacity-50" />
                                  <label className="cursor-pointer mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                                     Upload
                                     <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleDocumentUpload(e, doc.key, doc.label)} />
                                  </label>
                                </>
                              )}
                           </div>
                        )}
                     </div>
                     <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">{doc.label}</p>
                   </div>
                 );
              })}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">Uploading a new document will replace the existing one and notify Admin for verification.</p>
          </Card>

          {/* Financials Card */}
          <Card className="flex flex-col p-4 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">Payout Methods</h2>
              {!isEditingPayout && <EditButton onClick={() => setIsEditingPayout(true)} />}
            </div>
            {!isEditingPayout ? (
              <div className="flex-1 flex flex-col justify-center">
                {((profile as any).account_number && (profile as any).bank_name) ? (
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20"><CreditCard className="w-16 h-16 text-white" /></div>
                    <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">Bank Name</p>
                    <p className="text-lg font-bold text-white mb-4">{(profile as any).bank_name}</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-0.5">Account Number</p>
                        <p className="text-sm font-mono text-slate-200">**** **** {((profile as any).account_number || '').slice(-4)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-0.5">Account Name</p>
                        <p className="text-sm font-medium text-slate-200">{(profile as any).account_name}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 flex flex-col justify-center items-center text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <CreditCard className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2 opacity-50" />
                    <p className="text-sm font-medium text-slate-900 dark:text-white">No payout method linked.</p>
                    <button onClick={() => setIsEditingPayout(true)} className={\`\${btnGhost} mt-4\`}>Add Bank Account</button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSavePayout} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Bank Name (e.g., BDO, GCash, Maya)</label>
                  <input required type="text" value={payoutData.bank_name} onChange={(e) => setPayoutData({ ...payoutData, bank_name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Account Name</label>
                  <input required type="text" value={payoutData.account_name} onChange={(e) => setPayoutData({ ...payoutData, account_name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Account Number</label>
                  <input required type="text" value={payoutData.account_number} onChange={(e) => setPayoutData({ ...payoutData, account_number: e.target.value })} className={inputClass} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsEditingPayout(false)} className={btnGhost}>Cancel</button>
                  <button type="submit" className={btnSuccess}>Save Account</button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
      <ConfirmComponent />
    </div>
  );
}
