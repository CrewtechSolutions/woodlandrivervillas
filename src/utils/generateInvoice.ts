import { Booking, AuthUser } from '../types';

export const generateInvoicePdf = (booking: Booking, user: AuthUser) => {
  const invoiceNum = `INV-2026-${booking.bookingCode || booking.id.slice(-6).toUpperCase()}`;
  const todayDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const raw = booking.raw || {};
  const breakdown = raw.metadata?.pricingBreakdown;
  const lineItems: any[] = breakdown?.details?.lineItems || [];

  const depositCents = raw.depositCents ?? breakdown?.price?.deposit ?? 600000;
  const depositAmount = Math.round(depositCents / 100);

  const grandTotal = booking.totalPrice || (raw.totalCents ? Math.round(raw.totalCents / 100) : 20315);

  const pickupLoc = raw.pickupLocation?.name || 'Zirad, Alibaug';
  const pickupAddr = raw.pickupLocation?.address || '230/3, Woodland River Villas, Zirad Pada, Zirad, Alibaug - 402201';

  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) {
    alert('Please allow popups to download your invoice.');
    return;
  }

  // Generate dynamic line item rows
  let lineItemsHtml = '';
  if (lineItems.length > 0) {
    lineItemsHtml = lineItems
      .map(
        (item: any) => `
      <tr>
        <td>
          <strong>${item.label || 'Villa Reservation Charge'}</strong><br />
          <span style="font-size: 12px; color: #6b7280;">${item.detail || ''}</span>
        </td>
        <td>${item.units || item.quantity || 1} Unit(s)</td>
        <td style="text-align: right;">₹${Math.round((item.total || item.unitPrice || 0) / 100).toLocaleString('en-IN')}</td>
      </tr>
    `
      )
      .join('');
  } else {
    lineItemsHtml = `
      <tr>
        <td>
          <strong>${booking.villaName}</strong><br />
          <span style="font-size: 12px; color: #6b7280;">${pickupAddr}</span>
        </td>
        <td>1 Stay</td>
        <td style="text-align: right;">₹${grandTotal.toLocaleString('en-IN')}</td>
      </tr>
    `;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice_${invoiceNum}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@400;500;600;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      color: #1a1a1a;
      background: #ffffff;
      padding: 40px;
      line-height: 1.5;
    }

    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #cfa856;
      padding-bottom: 25px;
      margin-bottom: 30px;
    }

    .brand-title {
      font-family: 'Cinzel', serif;
      font-size: 24px;
      font-weight: 700;
      color: #122223;
      letter-spacing: 1px;
    }

    .brand-sub {
      font-size: 12px;
      color: #cfa856;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 4px;
    }

    .invoice-badge {
      text-align: right;
    }

    .invoice-badge h1 {
      font-size: 28px;
      font-weight: 700;
      color: #122223;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .status-paid {
      display: inline-block;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      margin-top: 6px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 35px;
    }

    .meta-card {
      background: #f9fafb;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #f3f4f6;
    }

    .meta-card h3 {
      font-size: 11px;
      text-transform: uppercase;
      color: #cfa856;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }

    .meta-card p {
      font-size: 14px;
      color: #374151;
      margin-bottom: 4px;
    }

    .table-container {
      margin-bottom: 35px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: #122223;
      color: #ffffff;
      text-align: left;
      padding: 12px 16px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    th:first-child { border-top-left-radius: 8px; border-bottom-left-radius: 8px; }
    th:last-child { border-top-right-radius: 8px; border-bottom-right-radius: 8px; text-align: right; }

    td {
      padding: 16px;
      border-bottom: 1px solid #f3f4f6;
      font-size: 14px;
      color: #1f2937;
    }

    td:last-child { text-align: right; font-weight: 600; }

    .summary-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 35px;
    }

    .summary-box {
      width: 340px;
      background: #f9fafb;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: #4b5563;
      margin-bottom: 8px;
    }

    .summary-row.total {
      font-size: 18px;
      font-weight: 700;
      color: #122223;
      border-top: 2px solid #cfa856;
      padding-top: 10px;
      margin-top: 10px;
    }

    .terms-box {
      background: #fdfbf7;
      border: 1px solid #f5e8cf;
      padding: 20px;
      border-radius: 12px;
      font-size: 12px;
      color: #78350f;
      margin-bottom: 30px;
    }

    .terms-box h4 {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 6px;
      color: #92400e;
    }

    .footer {
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #f3f4f6;
      padding-top: 20px;
    }

    .print-actions {
      text-align: center;
      margin-bottom: 30px;
    }

    .print-btn {
      background: #cfa856;
      color: #ffffff;
      border: none;
      padding: 12px 30px;
      border-radius: 30px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(207, 168, 86, 0.3);
    }

    .print-btn:hover { background: #b89243; }

    @media print {
      body { padding: 0; background: #ffffff; }
      .invoice-container { border: none; box-shadow: none; padding: 0; }
      .print-actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="print-btn" onclick="window.print()">📥 Download / Print PDF Invoice</button>
  </div>

  <div class="invoice-container">
    <!-- HEADER ROW -->
    <div class="header-row">
      <div>
        <div class="brand-title">WOODLAND RIVER VILLA</div>
        <div class="brand-sub">LUXURY RESORT • ALIBAUG</div>
      </div>
      <div class="invoice-badge">
        <h1>TAX INVOICE</h1>
        <div class="status-paid">✓ ${booking.status.toUpperCase()}</div>
      </div>
    </div>

    <!-- META INFORMATION GRID -->
    <div class="meta-grid">
      <div class="meta-card">
        <h3>INVOICE & STAY DETAILS</h3>
        <p><strong>Invoice No:</strong> ${invoiceNum}</p>
        <p><strong>Check-In:</strong> ${booking.checkIn} (${booking.checkInTime || '14:00 hrs'})</p>
        <p><strong>Check-Out:</strong> ${booking.checkOut} (${booking.checkOutTime || '11:00 hrs'})</p>
        <p><strong>Location:</strong> ${pickupLoc}</p>
      </div>

      <div class="meta-card">
        <h3>BILLED TO (GUEST)</h3>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Phone:</strong> ${user.phone || '+91 Not Provided'}</p>
        <p><strong>Guest Count:</strong> ${booking.guestsDisplay || `${booking.guests} Guests`}</p>
        <p><strong>Member Status:</strong> Woodland VIP Member</p>
      </div>
    </div>

    <!-- RESERVATION ITEMIZATION TABLE -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Item / Description</th>
            <th>Duration / Qty</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${lineItemsHtml}
        </tbody>
      </table>
    </div>

    <!-- FINANCIAL SUMMARY BOX -->
    <div class="summary-section">
      <div class="summary-box">
        <div class="summary-row">
          <span>Security Deposit (Refundable)</span>
          <span>₹${depositAmount.toLocaleString('en-IN')}</span>
        </div>
        <div class="summary-row total">
          <span>Total Paid Amount</span>
          <span>₹${grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>

    <!-- RESORT TERMS & CANCELLATION -->
    <div class="terms-box">
      <h4>Resort Policies & Check-In Guidelines:</h4>
      • Check-In Time: 14:00 PM | Check-Out Time: 11:00 AM.<br />
      • Primary guest must present a government-issued photo ID at check-in.<br />
      • Refundable security deposit will be returned upon check-out inspection.
    </div>

    <!-- FOOTER -->
    <div class="footer">
      Thank you for choosing <strong>Woodland River Villa Alibaug</strong> for your luxury stay.<br />
      Need assistance? Contact us at <strong>stay@woodlandrivervillas.com</strong>.
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
