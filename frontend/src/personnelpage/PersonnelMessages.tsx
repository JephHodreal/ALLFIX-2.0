import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, Send, Building2, ShieldCheck, Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { AdminPageHeader } from '../components/shared/AdminPageHeader';
import { Button } from '../components/shared/Button';
import { useAuth } from '../context/AuthContext';
import { useChatMessages, ChatMessage } from '../hooks/useChat';
import api from '../services/apiService';

export function PersonnelMessages() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(0);

  // Deterministic 24/7 Vendor HQ Thread ID
  const hqThreadId = useMemo(() => {
    if (!profile?.id || !profile?.vendor_id) return null;
    return `hq_${profile.id}_${profile.vendor_id}`;
  }, [profile?.id, profile?.vendor_id]);

  const { messages, loading: messagesLoading, sendMessage } = useChatMessages(hqThreadId || '', profile?.id);

  // Auto-prefill text if navigated from booking deep-link
  useEffect(() => {
    if (location.state?.prefill) {
      setInputText(location.state.prefill);
    }
  }, [location.state]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (messagesEndRef.current) {
        const isInitialLoad = prevMessagesLength.current === 0 || messages.length === 0;
        messagesEndRef.current.scrollIntoView({ behavior: isInitialLoad ? 'auto' : 'smooth', block: 'nearest' });
        prevMessagesLength.current = messages.length;
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !hqThreadId) return;
    const msgText = inputText;
    setInputText('');

    try {
      // Send as internal administrative channel (isLogistics = false)
      await sendMessage(
        profile?.id || user?.uid || '',
        'technician',
        msgText,
        false,
        profile?.avatar_url
      );
    } catch (err) {
      console.error('Failed to send message:', err);
      setInputText(msgText); // Restore text on failure
    }
  };

  const [vendorCompany, setVendorCompany] = useState<any>(null);

  useEffect(() => {
    if (profile?.vendor_id) {
      api.get(`/api/vendors/${profile.vendor_id}`)
        .then(res => setVendorCompany(res.data))
        .catch(() => {});
    }
  }, [profile?.vendor_id]);

  const companyName = useMemo(() => {
    return vendorCompany?.company_name || vendorCompany?.vendor_name || vendorCompany?.name || profile?.vendor_name || profile?.company_name || 'Vendor Agency';
  }, [vendorCompany, profile]);

  const latestVendorAvatar = useMemo(() => {
    const lastVendorMsg = [...messages].reverse().find(m => m.sender_id !== (profile?.id || user?.uid) && m.sender_avatar);
    return lastVendorMsg?.sender_avatar || vendorCompany?.avatar_url || vendorCompany?.logo_url || profile?.vendor_avatar || profile?.vendor_logo;
  }, [messages, vendorCompany, profile?.vendor_avatar, profile?.vendor_logo, profile?.id, user?.uid]);

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)]">
      {/* Standard Admin Header */}
      <AdminPageHeader
        title="Messages"
        subtitle="Direct 24/7 communication line with your vendor manager and administrative support."
        icon={<MessageSquare />}
      />

      {/* Main Chat Hub Card */}
      <div className="flex-1 max-w-5xl w-full mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0 overflow-hidden">
        
        {/* Top Channel Info Banner */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-white font-black text-base shadow-sm shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
              {latestVendorAvatar ? (
                <img src={latestVendorAvatar} alt={companyName} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white truncate text-base">
                  {companyName}
                </h3>
                <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active 24/7 Concierge Support Channel</span>
              </p>
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/50 min-h-0">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !hqThreadId ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 animate-bounce" />
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">Agency Account Required</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Your account is not linked to a Vendor ID. Please contact system support to link your personnel account to a certified vendor agency.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">No Messages Yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                This is your direct communication line with your vendor manager. Send a message below to coordinate schedules, report issues, or request support.
              </p>
            </div>
          ) : (
            messages.map((msg: ChatMessage) => {
              const isMe = msg.sender_id === (profile?.id || user?.uid);
              const timeStr = msg.created_at?.toDate 
                ? msg.created_at.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Just now';
              const avatarToShow = msg.sender_avatar || latestVendorAvatar;

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-white font-black text-xs shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                      {avatarToShow ? (
                        <img src={avatarToShow} alt={companyName} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm relative group ${
                      isMe
                        ? 'bg-brand-green text-white rounded-br-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200/80 dark:border-slate-700/80 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>

                    <div className={`flex items-center gap-1.5 mt-1 text-[10px] ${isMe ? 'text-white/80 justify-end' : 'text-slate-400 justify-start'}`}>
                      <span>{timeStr}</span>
                      {isMe && (
                        <span className="inline-flex items-center">
                          {msg.delivery_status === 'sending' ? (
                            <Clock className="w-3 h-3 text-white/70 animate-spin" />
                          ) : msg.is_read ? (
                            <span className="text-blue-200 font-black tracking-tighter text-[11px]">✓✓</span>
                          ) : (
                            <span className="text-white/80 font-bold">✓</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={hqThreadId ? `Type a message to ${companyName}...` : "Account not linked to vendor..."}
              disabled={!hqThreadId}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={!inputText.trim() || !hqThreadId}
              className="bg-brand-green hover:bg-[#005e3f] text-white px-5 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default PersonnelMessages;
