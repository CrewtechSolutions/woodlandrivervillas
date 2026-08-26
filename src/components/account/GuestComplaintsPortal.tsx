import React, { useState, useEffect } from 'react';
import { Booking, ComplaintTicket } from '../../types';
import { siteConfig } from '../../data/siteConfig';

interface GuestComplaintsPortalProps {
  bookings: Booking[];
}

const STORAGE_KEY = 'woodland_guest_complaints_v1';

export const GuestComplaintsPortal: React.FC<GuestComplaintsPortalProps> = ({ bookings }) => {
  const [tickets, setTickets] = useState<ComplaintTicket[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'resolved'>('all');

  // Form State
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [category, setCategory] = useState<ComplaintTicket['category']>('housekeeping');
  const [priority, setPriority] = useState<ComplaintTicket['priority']>('medium');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-select first booking if available
  useEffect(() => {
    if (bookings.length > 0 && !selectedBookingId) {
      setSelectedBookingId(bookings[0].id);
    }
  }, [bookings, selectedBookingId]);

  // Load complaints from localStorage or pre-populate demo complaint
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setTickets(JSON.parse(saved));
      } else {
        const initialTickets: ComplaintTicket[] = [
          {
            id: 'TICKET-2026-9841',
            bookingId: bookings[0]?.id || 'cmsj9yh0j002i3qmehqcy6fl8',
            bookingCode: bookings[0]?.bookingCode || 'WVR-IUIJUUZH',
            villaName: bookings[0]?.villaName || 'ROSEWOOD CABANA',
            category: 'amenities',
            subject: 'Pool Temperature & High-Speed Optical WiFi Check',
            description: 'Requested pool heater check and high-speed optical WiFi credentials for remote executive work during stay.',
            status: 'resolved',
            priority: 'medium',
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
            resolutionNote: 'Resort Manager verified pool heater temperature settings (28°C) and handed over dedicated optical router credentials.',
          },
        ];
        setTickets(initialTickets);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTickets));
      }
    } catch (e) {
      console.warn('Failed to load tickets from localStorage:', e);
    }
  }, [bookings]);

  // Save tickets on change
  const saveTickets = (updated: ComplaintTicket[]) => {
    setTickets(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save tickets:', e);
    }
  };

  const handleRegisterComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) {
      setFormMessage({ type: 'error', text: 'Please select a villa booking to associate with this complaint.' });
      return;
    }
    if (!subject.trim() || !description.trim()) {
      setFormMessage({ type: 'error', text: 'Please fill in both subject and description fields.' });
      return;
    }

    const targetBooking = bookings.find((b) => b.id === selectedBookingId) || bookings[0];

    const newTicket: ComplaintTicket = {
      id: `TICKET-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingId: targetBooking?.id || selectedBookingId,
      bookingCode: targetBooking?.bookingCode || targetBooking?.id || 'WVR-1001',
      villaName: targetBooking?.villaName || 'Woodland River Villa',
      category,
      subject,
      description,
      status: 'open',
      priority,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newTicket, ...tickets];
    saveTickets(updated);

    setFormMessage({ type: 'success', text: `Support ticket #${newTicket.id} lodged successfully! Resort management is reviewing it.` });
    setSubject('');
    setDescription('');
    setTimeout(() => {
      setFormMessage(null);
    }, 4000);
  };

  const filteredTickets = tickets.filter((t) => {
    if (activeFilter === 'active') return t.status === 'open' || t.status === 'in_progress';
    if (activeFilter === 'resolved') return t.status === 'resolved';
    return true;
  });

  const activeCount = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'housekeeping': return '🧹 Housekeeping & Hygiene';
      case 'amenities': return '🏊 Amenities (Pool/WiFi/AC)';
      case 'billing': return '💳 Billing & Payments';
      case 'staff_service': return '🛎️ Staff & Service';
      case 'maintenance': return '🔧 Maintenance & Repairs';
      default: return '💬 General Inquiry';
    }
  };

  return (
    <div>
      {/* STATS STRIP ON TOP */}
      <div className="row x-gap-16 y-gap-16 mb-32">
        <div className="col-md-4 col-sm-6">
          <div className="stat-card-luxury">
            <div className="size-48 rounded-12 bg-light-1 text-accent-1 flex-center flex-shrink-0 border-1 border-light-1">
              <i className="icon-chat text-20"></i>
            </div>
            <div>
              <div className="text-24 font-serif fw-700 text-dark-1">{tickets.length}</div>
              <div className="text-11 uppercase text-sec fw-600 tracking-wider">TOTAL TICKETS</div>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6">
          <div className="stat-card-luxury">
            <div className="size-48 rounded-12 bg-amber-50 text-amber-600 flex-center flex-shrink-0 border-1 border-amber-200">
              <i className="icon-clock text-20"></i>
            </div>
            <div>
              <div className="text-24 font-serif fw-700 text-amber-600">{activeCount}</div>
              <div className="text-11 uppercase text-sec fw-600 tracking-wider">ACTIVE / PENDING</div>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-12">
          <div className="stat-card-luxury">
            <div className="size-48 rounded-12 bg-emerald-50 text-emerald-600 flex-center flex-shrink-0 border-1 border-emerald-200">
              <i className="icon-check text-20"></i>
            </div>
            <div>
              <div className="text-24 font-serif fw-700 text-emerald-700">{resolvedCount}</div>
              <div className="text-11 uppercase text-sec fw-600 tracking-wider">RESOLVED ISSUES</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN LUXURY RESORT GUEST SUPPORT LAYOUT */}
      <div className="row y-gap-30">
        {/* LEFT COLUMN: TICKETS HISTORY & FILTER LIST (7 COLS) */}
        <div className="col-lg-7">
          <div className="profile-card">
            {/* CARD HEADER & FILTER PILLS */}
            <div className="d-flex justify-between items-center mb-24 pb-16 border-bottom-light flex-wrap y-gap-12">
              <div>
                <div className="text-12 uppercase text-accent-1 font-semibold tracking-wider mb-2">HISTORY & STATUS</div>
                <h3 className="text-24 font-serif fw-700 text-dark-1">Support Tickets</h3>
              </div>

              {/* FILTER TABS */}
              <div className="filter-tabs-wrapper">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`filter-tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
                >
                  All ({tickets.length})
                </button>
                <button
                  onClick={() => setActiveFilter('active')}
                  className={`filter-tab-btn ${activeFilter === 'active' ? 'active' : ''}`}
                >
                  Active ({activeCount})
                </button>
                <button
                  onClick={() => setActiveFilter('resolved')}
                  className={`filter-tab-btn ${activeFilter === 'resolved' ? 'active' : ''}`}
                >
                  Resolved ({resolvedCount})
                </button>
              </div>
            </div>

            {/* TICKETS CARDS LIST */}
            {filteredTickets.length > 0 ? (
              <div>
                {filteredTickets.map((t) => (
                  <div key={t.id} className="complaint-card">
                    <div className="d-flex justify-between items-start flex-wrap y-gap-10 mb-12">
                      <div>
                        <div className="d-flex items-center x-gap-8 mb-6 flex-wrap">
                          <span
                            className={`ticket-status-badge ${
                              t.status === 'resolved'
                                ? 'ticket-status-resolved'
                                : t.status === 'in_progress'
                                ? 'ticket-status-in_progress'
                                : 'ticket-status-open'
                            }`}
                          >
                            <span className="status-dot"></span>
                            {t.status.replace('_', ' ').toUpperCase()}
                          </span>

                          <span className={`priority-pill priority-${t.priority}`}>
                            {t.priority} priority
                          </span>

                          <span className="text-12 font-mono text-sec bg-light-1 px-10 py-2 rounded-100 border-1 border-light-1">
                            #{t.id}
                          </span>
                        </div>

                        <h4 className="text-19 font-serif fw-700 text-dark-1">{t.subject}</h4>
                      </div>

                      <div className="text-right md:text-left">
                        <div className="text-13 fw-700 text-dark-1">{t.villaName}</div>
                        <div className="text-11 text-sec font-mono">ID: {t.bookingCode}</div>
                        <div className="text-11 text-sec mt-2">Filed: {t.createdAt}</div>
                      </div>
                    </div>

                    <div className="p-14 rounded-12 bg-light-1 text-14 text-dark-1 mb-12 border-1 border-light-1">
                      <div className="text-11 uppercase text-accent-1 font-bold tracking-wider mb-2">
                        {getCategoryLabel(t.category)}
                      </div>
                      {t.description}
                    </div>

                    {t.resolutionNote && (
                      <div className="p-14 rounded-12 bg-emerald-50 text-emerald-900 border-1 border-emerald-200 text-13">
                        <strong className="d-block text-11 uppercase text-emerald-700 font-bold tracking-wider mb-2">
                          ✓ Resort Manager Resolution Note:
                        </strong>
                        {t.resolutionNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-40 text-center bg-light-1 rounded-20 border-1 border-light-1">
                <i className="icon-chat text-32 text-accent-1 mb-12 d-block"></i>
                <h4 className="text-20 font-serif fw-700 text-dark-1 mb-6">No Support Tickets Found</h4>
                <p className="text-14 text-sec">No complaint tickets match the selected status filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: LODGE NEW COMPLAINT FORM CARD (5 COLS) */}
        <div className="col-lg-5">
          <div className="profile-card">
            <div className="text-12 uppercase text-accent-1 font-semibold tracking-wider mb-2">GUEST ASSISTANCE</div>
            <h3 className="text-24 font-serif fw-700 text-dark-1 mb-20">Lodge Support Ticket</h3>

            {formMessage && (
              <div
                className={`p-14 mb-20 rounded-14 text-13 font-semibold border-1 ${
                  formMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                {formMessage.text}
              </div>
            )}

            <form onSubmit={handleRegisterComplaint}>
              <div className="space-y-16">
                {/* BOOKING SELECTOR */}
                <div>
                  <label className="text-12 font-bold text-dark-1 mb-6 d-block uppercase tracking-wider">
                    Associated Villa Stay *
                  </label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="form-control-luxury"
                    required
                  >
                    <option value="">-- Select Reservation --</option>
                    {bookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.villaName} ({b.bookingCode || b.id.slice(-6)}) - {b.checkIn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CATEGORY SELECTOR */}
                <div>
                  <label className="text-12 font-bold text-dark-1 mb-6 d-block uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="form-control-luxury"
                    required
                  >
                    <option value="housekeeping">Housekeeping & Hygiene</option>
                    <option value="amenities">Amenities (Pool/WiFi/AC)</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="staff_service">Staff & Service</option>
                    <option value="maintenance">Maintenance & Repairs</option>
                    <option value="other">General Inquiry</option>
                  </select>
                </div>

                {/* PRIORITY URGENCY */}
                <div>
                  <label className="text-12 font-bold text-dark-1 mb-6 d-block uppercase tracking-wider">
                    Priority Urgency *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="form-control-luxury"
                    required
                  >
                    <option value="low">Normal Urgency</option>
                    <option value="medium">High Priority</option>
                    <option value="high">Emergency / Immediate Action</option>
                  </select>
                </div>

                {/* SUBJECT */}
                <div>
                  <label className="text-12 font-bold text-dark-1 mb-6 d-block uppercase tracking-wider">
                    Subject Summary *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. WiFi router signal weak in master suite"
                    className="form-control-luxury"
                    required
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="text-12 font-bold text-dark-1 mb-6 d-block uppercase tracking-wider">
                    Detailed Description *
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details so our resort manager can address your concern immediately..."
                    className="form-control-luxury"
                    style={{ height: 'auto' }}
                    required
                  ></textarea>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  className="button bg-accent-1 text-white rounded-200 w-1/1 justify-center py-14 text-14 fw-700 shadow-xs hover-accent-dark transition-all mt-10"
                >
                  <i className="icon-check mr-8 text-16"></i> SUBMIT SUPPORT TICKET
                </button>
              </div>
            </form>

            {/* DIRECT EMERGENCY ESCALATION BUTTON */}
            <div className="pt-20 mt-20 border-top-light">
              <a
                href={`https://wa.me/${siteConfig.phoneNumbers[0].replace(/[^0-9]/g, '')}?text=URGENT%20ASSISTANCE%20REQUIRED%20FOR%20VILLA%20RESERVATION`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-concierge-whatsapp"
              >
                <i className="icon-chat text-18"></i> Urgent WhatsApp Emergency Hotline
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
