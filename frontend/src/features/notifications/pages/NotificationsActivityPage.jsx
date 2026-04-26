import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar';
import Sidebar from '../../../components/layout/Sidebar';
import api from '../../../services/api';
import {
  Bell,
  Calendar,
  Wrench,
  AlertCircle,
  Building2,
  ChevronLeft,
  Loader2,
  ExternalLink,
} from 'lucide-react';

const MOCK_ITEMS = [
  {
    id: 1,
    title: 'Booking Approved',
    message: 'Your facility booking for the main hall has been approved.',
    detailMessage: 'Full detail would appear here in live mode.',
    type: 'BOOKING_APPROVED',
    read: false,
    referenceId: '1',
    actionPath: '/dashboard/bookings/1',
    createdAt: new Date().toISOString(),
  },
];

function formatDateTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function typeLabel(type) {
  if (!type) return 'General';
  return type.replace(/_/g, ' ');
}

function TypeIcon({ type }) {
  const t = type || '';
  if (t.includes('BOOKING')) return <Calendar className="w-5 h-5" />;
  if (t.includes('TICKET')) return <Wrench className="w-5 h-5" />;
  if (t.includes('FACILITY') || t.includes('RESOURCE')) return <Building2 className="w-5 h-5" />;
  return <AlertCircle className="w-5 h-5" />;
}

export default function NotificationsActivityPage() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const isMockMode =
    !localStorage.getItem('token') || localStorage.getItem('token') === 'dummy-token';

  const loadPage = useCallback(
    async (pageIndex, append) => {
      if (isMockMode) {
        setItems(MOCK_ITEMS);
        setTotalPages(1);
        setLoading(false);
        setLoadingMore(false);
        return;
      }
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const res = await api.get('/api/notifications/paged', {
          params: { page: pageIndex, size: 20 },
        });
        const data = res.data;
        const content = data.content || [];
        setTotalPages(data.totalPages ?? 0);
        if (append) {
          setItems((prev) => [...prev, ...content]);
        } else {
          setItems(content);
        }
      } catch (e) {
        console.error('Failed to load notifications', e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [isMockMode]
  );

  useEffect(() => {
    setPage(0);
    loadPage(0, false);
  }, [loadPage]);

  useEffect(() => {
    const onVis = () => {
      if (!document.hidden && !isMockMode) {
        loadPage(0, false);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [loadPage, isMockMode]);

  const handleMarkReadAndOpen = async (n) => {
    if (isMockMode) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      if (n.actionPath) navigate(n.actionPath);
      return;
    }
    if (!n.read) {
      try {
        await api.patch(`/api/notifications/${n.id}/read`);
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      } catch (err) {
        console.error(err);
      }
    }
    if (n.actionPath) navigate(n.actionPath);
  };

  const loadMore = () => {
    const next = page + 1;
    if (next >= totalPages) return;
    setPage(next);
    loadPage(next, true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fa] font-sans">
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isDesktopMenuOpen={isDesktopMenuOpen}
        setIsDesktopMenuOpen={setIsDesktopMenuOpen}
      />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          setIsDesktopMenuOpen={setIsDesktopMenuOpen}
        />
        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#003049] hover:text-[#F77F00] mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-2xl bg-[#003049]/10 text-[#003049]">
                <Bell className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-[#003049] tracking-tight">
                  All activity
                </h1>
                <p className="text-gray-500 text-sm font-medium mt-1">
                  Full history of your notifications. Open an item to jump to the related page.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {loading ? (
                <div className="flex justify-center py-16 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="font-bold text-gray-500">No notifications yet</p>
                </div>
              ) : (
                items.map((n) => (
                  <article
                    key={n.id}
                    className={`rounded-2xl border p-5 md:p-6 shadow-sm transition-colors ${
                      n.read ? 'bg-white border-gray-100' : 'bg-[#003049]/[0.03] border-[#003049]/20'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div
                        className={`mt-0.5 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          (n.type || '').includes('BOOKING')
                            ? 'bg-[#FCBF49]/20 text-[#F77F00]'
                            : (n.type || '').includes('TICKET')
                              ? 'bg-[#D62828]/10 text-[#D62828]'
                              : (n.type || '').includes('FACILITY')
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-[#003049]/10 text-[#003049]'
                        }`}
                      >
                        <TypeIcon type={n.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h2 className="font-black text-[#003049] text-lg leading-tight">{n.title}</h2>
                          {!n.read && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-[#D62828] text-white px-2 py-0.5 rounded-full">
                              Unread
                            </span>
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {typeLabel(n.type)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium mb-3">{n.message}</p>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border-t border-gray-100 pt-3">
                          {n.detailMessage || n.message}
                        </div>
                        <p className="text-xs text-gray-400 font-bold mt-3">{formatDateTime(n.createdAt)}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {n.actionPath && (
                            <button
                              type="button"
                              onClick={() => handleMarkReadAndOpen(n)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#003049] text-white text-sm font-bold hover:bg-[#004d73] transition-colors"
                            >
                              Open related page
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                          {!n.read && (
                            <button
                              type="button"
                              onClick={async () => {
                                if (isMockMode) {
                                  setItems((prev) =>
                                    prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
                                  );
                                  return;
                                }
                                try {
                                  await api.patch(`/api/notifications/${n.id}/read`);
                                  setItems((prev) =>
                                    prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
                                  );
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-700 hover:border-[#003049] hover:text-[#003049] transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            {!loading && !isMockMode && page + 1 < totalPages && (
              <div className="flex justify-center mt-10">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 rounded-xl font-bold text-[#003049] border-2 border-[#003049] hover:bg-[#003049] hover:text-white transition-colors disabled:opacity-50"
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
