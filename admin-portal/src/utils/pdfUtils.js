/**
 * Language Academy — PDF Generation Utilities
 * Shared module for generating branded receipts, vouchers, and report headers.
 * Uses html2pdf.js for PDF generation.
 */
import html2pdf from 'html2pdf.js';
import logoSrc from '../assets/logo.png';

// ── Institution Info ──
export const getInstitutionInfo = () => ({
  name: 'Language Academy',
  address: 'SEL SUFI SQUARE, Unit: 1104, Level: 11, Dhanmondi R/A, Dhaka 1209',
  phone: '+880 1913-373581',
  email: 'hello@languageacademy.com.bd',
  website: 'languageacademy.com.bd'
});

// ── Logo as base64 (preloaded from import) ──
let logoBase64Cache = null;

export const getLogoBase64 = () => {
  return new Promise((resolve) => {
    if (logoBase64Cache) { resolve(logoBase64Cache); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      logoBase64Cache = canvas.toDataURL('image/png');
      resolve(logoBase64Cache);
    };
    img.onerror = () => resolve('');
    img.src = logoSrc;
  });
};

// ── Number to Words (BDT) ──
export const numberToWords = (num) => {
  if (num === 0) return 'Zero Taka Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const n = ('000000000' + Math.floor(Math.abs(num))).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return String(num) + ' Taka Only';
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() + ' Taka Only';
};

// ── Branded PDF Header HTML (for reports) ──
export const buildPdfHeaderHtml = async (reportTitle, periodText) => {
  const info = getInstitutionInfo();
  const logo = await getLogoBase64();
  return `
    <div style="text-align:center; margin-bottom:24px; padding-bottom:18px; border-bottom:3px solid #275fa7;">
      ${logo ? `<img src="${logo}" style="height:60px; margin-bottom:8px;" />` : ''}
      <div style="font-size:20px; font-weight:700; color:#275fa7; margin-bottom:2px; font-family:'Outfit',sans-serif;">${info.name}</div>
      <div style="font-size:11px; color:#64748b;">${info.address}</div>
      <div style="font-size:11px; color:#64748b;">Phone: ${info.phone} | Email: ${info.email}</div>
      <div style="font-size:11px; color:#64748b;">Web: ${info.website}</div>
      ${reportTitle ? `<div style="font-size:16px; font-weight:600; color:#0f172a; margin-top:14px;">${reportTitle}</div>` : ''}
      ${periodText ? `<div style="font-size:12px; color:#64748b; margin-top:4px;">${periodText}</div>` : ''}
    </div>
  `;
};

// ── Signature Block HTML ──
export const buildSignatureBlockHtml = (signatures = ['Created by', 'Received by', 'Approved by']) => {
  const cols = signatures.map(label => `
    <div style="flex:1; text-align:center; padding:0 16px;">
      <div style="border-bottom:1px solid #334155; width:100%; margin-bottom:8px; height:40px;"></div>
      <div style="font-size:11px; font-weight:600; color:#334155;">${label}</div>
    </div>
  `).join('');
  return `
    <div style="display:flex; justify-content:space-between; margin-top:48px; padding-top:16px;">
      ${cols}
    </div>
  `;
};

// ── Watermark HTML (transparent logo) ──
const buildWatermarkHtml = (logoData, opacity = 0.04) => {
  if (!logoData) return '';
  return `
    <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:0; pointer-events:none;">
      <img src="${logoData}" style="width:280px; height:280px; opacity:${opacity}; object-fit:contain;" />
    </div>
  `;
};

// ══════════════════════════════════════════════════
// RECEIPT — Colorful, Brand-Friendly
// Supports both Student Enrollment and Custom Income
// ══════════════════════════════════════════════════

export const generateReceiptHtml = async (tx) => {
  const info = getInstitutionInfo();
  const logo = await getLogoBase64();
  const amount = parseFloat(tx.amount || 0);
  const amountWords = numberToWords(Math.floor(amount));
  const receiptNo = tx.receipt_no || `RCP-${tx.id}-${Date.now().toString().slice(-4)}`;
  const paidAt = tx.paid_at ? new Date(tx.paid_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  const method = (tx.method || 'cash').toUpperCase();
  const branch = tx.branch_name || 'Dhanmondi';

  // Detect if this is a custom income or enrollment receipt
  const isCustom = tx.source === 'manual' || (!tx.enrollment_id && tx.invoice_id) || tx.Invoice?.invoice_type === 'custom';

  const recipientName = isCustom
    ? (tx.Invoice?.customer_name || tx.Invoice?.Customer?.name || tx.customer_name || 'Customer')
    : (tx.Enrollment?.Student?.User?.name || tx.Invoice?.Student?.User?.name || tx.student_name || 'Student');
  const recipientLabel = isCustom ? 'Name' : 'Student Name';
  const recipientSuffix = isCustom
    ? (tx.Invoice?.Customer?.company ? ` (${tx.Invoice.Customer.company})` : '')
    : ` <span style="color:#64748b; font-weight:500;">(STU-${tx.Enrollment?.student_id || tx.Invoice?.student_id || tx.student_id || '-'})</span>`;

  const forLabel = isCustom ? 'For' : 'Course Name';
  const forValue = isCustom
    ? (tx.Invoice?.IncomeCategory?.name || 'Custom Income')
    : (tx.Enrollment?.Batch?.Course?.title || tx.course_name || 'Tuition Fee');
  const forSuffix = isCustom
    ? ''
    : ` <span style="color:#64748b; font-size:11px;">(Batch: ${tx.Enrollment?.Batch?.code || tx.batch_code || '-'})</span>`;

  const notesValue = isCustom
    ? (tx.Invoice?.notes || tx.transaction_ref || 'Custom Income Payment')
    : (tx.transaction_ref ? `Ref: ${tx.transaction_ref}` : 'Tuition Fee Payment');

  return `
    <div style="width:100%; font-family:'Inter','Segoe UI',sans-serif; position:relative; overflow:hidden; background:#ffffff; padding:0;">
      
      <!-- Top Accent Bar -->
      <div style="height:4px; background:linear-gradient(90deg, #275fa7, #7bc62e);"></div>
      
      <!-- Header -->
      <div style="padding:20px 28px 14px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0;">
        <div style="display:flex; align-items:center; gap:12px;">
          ${logo ? `<img src="${logo}" style="height:48px;" />` : ''}
          <div>
            <div style="font-size:18px; font-weight:800; color:#275fa7; font-family:'Outfit',sans-serif;">LANGUAGE ACADEMY</div>
            <div style="font-size:9px; color:#64748b;">${info.address}</div>
            <div style="font-size:9px; color:#64748b;">Phone: ${info.phone} | ${info.email} | ${info.website}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:16px; font-weight:800; color:#275fa7; letter-spacing:2px; border:2px solid #275fa7; padding:4px 14px; border-radius:6px;">MONEY RECEIPT</div>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:18px 28px; position:relative;">
        ${buildWatermarkHtml(logo, 0.04)}

        <!-- Receipt Meta Row -->
        <div style="display:flex; justify-content:space-between; margin-bottom:18px; position:relative; z-index:1;">
          <div style="display:flex; gap:28px;">
            <div>
              <div style="font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px;">Receipt No</div>
              <div style="font-size:13px; font-weight:700; color:#275fa7;">${receiptNo}</div>
            </div>
            <div>
              <div style="font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px;">Date / Time</div>
              <div style="font-size:13px; font-weight:600;">${paidAt}</div>
            </div>
            <div>
              <div style="font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px;">Branch</div>
              <div style="font-size:13px; font-weight:600;">${branch}</div>
            </div>
          </div>
        </div>

        <!-- Detail Table -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:18px; position:relative; z-index:1;">
          <tr style="background:#f8fafc;">
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0; width:30%;">${recipientLabel}</td>
            <td style="padding:10px 14px; font-size:13px; font-weight:700; color:#1e293b; border:1px solid #e2e8f0;">${recipientName}${recipientSuffix}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0;">${forLabel}</td>
            <td style="padding:10px 14px; font-size:13px; font-weight:600; color:#1e293b; border:1px solid #e2e8f0;">${forValue}${forSuffix}</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0;">Payment Method</td>
            <td style="padding:10px 14px; font-size:13px; font-weight:600; color:#1e293b; border:1px solid #e2e8f0;">${method}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0;">Amount (BDT)</td>
            <td style="padding:10px 14px; font-size:20px; font-weight:800; color:#275fa7; border:1px solid #e2e8f0;">৳${amount.toLocaleString()}</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0;">Amount in Words</td>
            <td style="padding:10px 14px; font-size:12px; font-weight:600; color:#475569; border:1px solid #e2e8f0; text-transform:uppercase;">${amountWords}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0;">Notes</td>
            <td style="padding:10px 14px; font-size:13px; color:#334155; border:1px solid #e2e8f0;">${notesValue}</td>
          </tr>
        </table>

        <!-- Signatures -->
        ${buildSignatureBlockHtml(['Created by', 'Received by', 'Approved by'])}
      </div>

      <!-- Bottom Accent Bar -->
      <div style="height:3px; background:linear-gradient(90deg, #7bc62e, #275fa7); margin-top:8px;"></div>
    </div>
  `;
};

export const downloadReceiptPdf = async (tx) => {
  const html = await generateReceiptHtml(tx);
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.background = 'white';

  const opt = {
    margin: [6, 6, 6, 6],
    filename: `Receipt-${tx.receipt_no || tx.id}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a5', orientation: 'landscape' }
  };

  await html2pdf().set(opt).from(container).save();
};


// ══════════════════════════════════════════════════
// INVOICE PDF — Branded Invoice Export
// ══════════════════════════════════════════════════

export const generateInvoiceHtml = async (inv) => {
  const info = getInstitutionInfo();
  const logo = await getLogoBase64();
  const amount = parseFloat(inv.amount || 0);
  const paid = parseFloat(inv.paid || 0);
  const due = amount - paid;
  const amountWords = numberToWords(Math.floor(amount));
  const issuedAt = inv.issued_at ? new Date(inv.issued_at).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : new Date().toLocaleDateString('en-GB', { dateStyle: 'medium' });
  const dueDate = inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : 'N/A';

  const isCustom = inv.invoice_type === 'custom';
  const recipientName = isCustom
    ? (inv.customer_name || inv.Customer?.name || 'Customer')
    : (inv.Student?.User?.name || inv.Enrollment?.Student?.User?.name || 'Student');
  const recipientCompany = isCustom ? (inv.customer_company || inv.Customer?.company || '') : '';
  const recipientPhone = isCustom ? (inv.customer_phone || inv.Customer?.phone || '') : '';
  const recipientEmail = isCustom ? (inv.customer_email || inv.Customer?.email || '') : (inv.Student?.User?.email || '');
  const recipientAddress = isCustom ? (inv.customer_address || inv.Customer?.address || '') : '';
  const forText = isCustom
    ? (inv.IncomeCategory?.name || 'Custom Income')
    : (inv.Enrollment?.Batch?.Course?.title || 'Tuition Fee');

  const statusColor = { paid: '#10b981', pending: '#f59e0b', overdue: '#ef4444', partial: '#3b82f6', draft: '#64748b' }[inv.status] || '#64748b';

  return `
    <div style="width:100%; font-family:'Inter','Segoe UI',sans-serif; position:relative; overflow:hidden; background:#ffffff; padding:0;">
      
      <!-- Top Accent Bar -->
      <div style="height:4px; background:linear-gradient(90deg, #275fa7, #7bc62e);"></div>
      
      <!-- Header -->
      <div style="padding:24px 32px 16px; display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid #e2e8f0;">
        <div style="display:flex; align-items:center; gap:14px;">
          ${logo ? `<img src="${logo}" style="height:52px;" />` : ''}
          <div>
            <div style="font-size:20px; font-weight:800; color:#275fa7; font-family:'Outfit',sans-serif;">LANGUAGE ACADEMY</div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">${info.address}</div>
            <div style="font-size:10px; color:#64748b;">Phone: ${info.phone} | ${info.email}</div>
            <div style="font-size:10px; color:#64748b;">Web: ${info.website}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:20px; font-weight:800; color:#275fa7; letter-spacing:3px; border:2px solid #275fa7; padding:6px 18px; border-radius:6px;">INVOICE</div>
          <div style="margin-top:10px; font-size:12px; color:#64748b;">Invoice #: <strong style="color:#1e293b;">${inv.invoice_no || 'N/A'}</strong></div>
          <div style="font-size:12px; color:#64748b;">Date: <strong style="color:#1e293b;">${issuedAt}</strong></div>
          <div style="font-size:12px; color:#64748b;">Due: <strong style="color:#1e293b;">${dueDate}</strong></div>
          <div style="margin-top:6px;"><span style="padding:4px 12px; border-radius:12px; font-size:11px; font-weight:700; background:${statusColor}20; color:${statusColor}; text-transform:uppercase;">${inv.status}</span></div>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:24px 32px; position:relative;">
        ${buildWatermarkHtml(logo, 0.03)}

        <!-- Bill To -->
        <div style="margin-bottom:24px; position:relative; z-index:1;">
          <div style="font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:6px; font-weight:700;">Bill To</div>
          <div style="font-size:15px; font-weight:700; color:#1e293b;">${recipientName}</div>
          ${recipientCompany ? `<div style="font-size:12px; color:#475569;">${recipientCompany}</div>` : ''}
          ${recipientPhone ? `<div style="font-size:12px; color:#64748b;">📱 ${recipientPhone}</div>` : ''}
          ${recipientEmail ? `<div style="font-size:12px; color:#64748b;">✉ ${recipientEmail}</div>` : ''}
          ${recipientAddress ? `<div style="font-size:12px; color:#64748b;">📍 ${recipientAddress}</div>` : ''}
        </div>

        <!-- Items Table -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:20px; position:relative; z-index:1;">
          <thead>
            <tr style="background:#275fa7;">
              <th style="padding:10px 14px; font-size:10px; font-weight:700; color:#fff; text-align:left; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #1e4d8a;">#</th>
              <th style="padding:10px 14px; font-size:10px; font-weight:700; color:#fff; text-align:left; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #1e4d8a;">Description</th>
              <th style="padding:10px 14px; font-size:10px; font-weight:700; color:#fff; text-align:right; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #1e4d8a;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#f8fafc;">
              <td style="padding:12px 14px; font-size:12px; border:1px solid #e2e8f0;">1</td>
              <td style="padding:12px 14px; font-size:13px; font-weight:600; color:#1e293b; border:1px solid #e2e8f0;">
                ${forText}
                ${inv.notes ? `<div style="font-size:11px; color:#64748b; margin-top:4px;">${inv.notes}</div>` : ''}
              </td>
              <td style="padding:12px 14px; font-size:14px; font-weight:700; color:#1e293b; border:1px solid #e2e8f0; text-align:right;">৳${amount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <!-- Totals -->
        <div style="display:flex; justify-content:flex-end; position:relative; z-index:1;">
          <table style="width:260px; border-collapse:collapse;">
            <tr>
              <td style="padding:8px 14px; font-size:12px; font-weight:600; color:#64748b; border:1px solid #e2e8f0;">Subtotal</td>
              <td style="padding:8px 14px; font-size:13px; font-weight:600; text-align:right; border:1px solid #e2e8f0;">৳${amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:8px 14px; font-size:12px; font-weight:600; color:#10b981; border:1px solid #e2e8f0;">Paid</td>
              <td style="padding:8px 14px; font-size:13px; font-weight:600; text-align:right; color:#10b981; border:1px solid #e2e8f0;">৳${paid.toLocaleString()}</td>
            </tr>
            <tr style="background:#f0f9ff;">
              <td style="padding:10px 14px; font-size:13px; font-weight:800; color:#275fa7; border:1px solid #e2e8f0;">Balance Due</td>
              <td style="padding:10px 14px; font-size:16px; font-weight:800; text-align:right; color:#275fa7; border:1px solid #e2e8f0;">৳${due.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <!-- Amount in Words -->
        <div style="margin-top:16px; padding:10px 14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; position:relative; z-index:1;">
          <span style="font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:1px; font-weight:700;">Amount in Words: </span>
          <span style="font-size:12px; font-weight:600; color:#475569; text-transform:uppercase;">${amountWords}</span>
        </div>

        <!-- Signatures -->
        ${buildSignatureBlockHtml(['Prepared by', 'Received by', 'Authorized by'])}
      </div>

      <!-- Footer -->
      <div style="padding:10px 32px; border-top:1px solid #e2e8f0; text-align:center;">
        <div style="font-size:10px; color:#94a3b8;">Thank you for your business · ${info.name} · ${info.website}</div>
      </div>
      
      <!-- Bottom Accent Bar -->
      <div style="height:3px; background:linear-gradient(90deg, #7bc62e, #275fa7);"></div>
    </div>
  `;
};

export const downloadInvoicePdf = async (inv) => {
  const html = await generateInvoiceHtml(inv);
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.background = 'white';

  const opt = {
    margin: [8, 8, 8, 8],
    filename: `Invoice-${inv.invoice_no || inv.id}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  await html2pdf().set(opt).from(container).save();
};


// ══════════════════════════════════════════════════
// VOUCHER — White background, Brand-color accents (A5 Landscape)
// ══════════════════════════════════════════════════

export const generateVoucherHtml = async (expense) => {
  const info = getInstitutionInfo();
  const logo = await getLogoBase64();
  const amount = parseFloat(expense.amount || 0);
  const amountWords = numberToWords(Math.floor(amount));
  const voucherNo = `VCH-${expense.id}-${Date.now().toString().slice(-4)}`;
  const expDate = expense.date ? new Date(expense.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const branch = expense.branch_name || 'Dhanmondi';
  const payee = expense.category || 'Office Expense';
  const method = (expense.payment_method || 'cash').replace(/_/g, ' ').toUpperCase();
  const reason = expense.description || 'Office Expense';

  return `
    <div style="width:100%; font-family:'Inter','Segoe UI',sans-serif; position:relative; overflow:hidden; background:#ffffff; padding:0;">
      
      <!-- Top Accent Bar -->
      <div style="height:4px; background:linear-gradient(90deg, #275fa7, #7bc62e);"></div>
      
      <!-- Header -->
      <div style="padding:20px 28px 14px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0;">
        <div style="display:flex; align-items:center; gap:12px;">
          ${logo ? `<img src="${logo}" style="height:48px;" />` : ''}
          <div>
            <div style="font-size:18px; font-weight:800; color:#275fa7; font-family:'Outfit',sans-serif;">LANGUAGE ACADEMY</div>
            <div style="font-size:9px; color:#64748b;">${info.address}</div>
            <div style="font-size:9px; color:#64748b;">Phone: ${info.phone} | ${info.email} | ${info.website}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:16px; font-weight:800; color:#275fa7; letter-spacing:2px; border:2px solid #275fa7; padding:4px 14px; border-radius:6px;">MONEY VOUCHER</div>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:18px 28px; position:relative;">
        ${buildWatermarkHtml(logo, 0.04)}

        <!-- Voucher Meta Row -->
        <div style="display:flex; justify-content:space-between; margin-bottom:18px; position:relative; z-index:1;">
          <div style="display:flex; gap:28px;">
            <div>
              <div style="font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px;">Voucher No</div>
              <div style="font-size:13px; font-weight:700; color:#275fa7;">${voucherNo}</div>
            </div>
            <div>
              <div style="font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px;">Date</div>
              <div style="font-size:13px; font-weight:600;">${expDate}</div>
            </div>
            <div>
              <div style="font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px;">Branch</div>
              <div style="font-size:13px; font-weight:600;">${branch}</div>
            </div>
          </div>
        </div>

        <!-- Detail Table -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:18px; position:relative; z-index:1;">
          <tr style="background:#f8fafc;">
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0; width:30%;">Payee</td>
            <td style="padding:10px 14px; font-size:13px; font-weight:600; color:#1e293b; border:1px solid #e2e8f0;">${payee}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0;">Payment Method</td>
            <td style="padding:10px 14px; font-size:13px; font-weight:600; color:#1e293b; border:1px solid #e2e8f0;">${method}</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0;">Amount (BDT)</td>
            <td style="padding:10px 14px; font-size:20px; font-weight:800; color:#275fa7; border:1px solid #e2e8f0;">৳${amount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0;">Amount in Words</td>
            <td style="padding:10px 14px; font-size:12px; font-weight:600; color:#475569; border:1px solid #e2e8f0; text-transform:uppercase;">${amountWords}</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0;">Reason / Description</td>
            <td style="padding:10px 14px; font-size:13px; color:#334155; border:1px solid #e2e8f0;">${reason}</td>
          </tr>
        </table>

        <!-- Signatures -->
        ${buildSignatureBlockHtml(['Created by', 'Checked by', 'Approved by'])}
      </div>

      <!-- Bottom Accent Bar -->
      <div style="height:3px; background:linear-gradient(90deg, #7bc62e, #275fa7); margin-top:8px;"></div>
    </div>
  `;
};

export const downloadVoucherPdf = async (expense) => {
  const html = await generateVoucherHtml(expense);
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.background = 'white';

  const opt = {
    margin: [6, 6, 6, 6],
    filename: `Voucher-${expense.id}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a5', orientation: 'landscape' }
  };

  await html2pdf().set(opt).from(container).save();
};


// ══════════════════════════════════════════════════
// EXPENSE LIST PDF EXPORT
// ══════════════════════════════════════════════════

export const downloadExpenseListPdf = async (expenses, dateRange) => {
  const info = getInstitutionInfo();
  const logo = await getLogoBase64();
  const periodText = dateRange?.from && dateRange?.to
    ? `Period: ${dateRange.from} to ${dateRange.to}`
    : `Generated: ${new Date().toLocaleDateString('en-GB', { dateStyle: 'medium' })}`;

  const header = await buildPdfHeaderHtml('Expense Report', periodText);

  const totalAmount = expenses.reduce((s, e) => s + (e.status === 'deleted' ? 0 : parseFloat(e.amount || 0)), 0);

  const tableRows = expenses.map((e, i) => {
    const isDeleted = e.status === 'deleted';
    const dec = isDeleted ? 'line-through' : 'none';
    const col = isDeleted ? '#94a3b8' : '#1e293b';
    const amtCol = isDeleted ? '#94a3b8' : '#1e293b';
    
    return `
    <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'}; color:${col};">
      <td style="padding:8px 10px; border:1px solid #e2e8f0; font-size:11px;">${e.date ? new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '-'}</td>
      <td style="padding:8px 10px; border:1px solid #e2e8f0; font-size:11px;">
        <span style="text-decoration:${dec}">${e.description || '-'}</span>
        ${isDeleted ? `<div style="font-size:9px; color:#ef4444; margin-top:2px;">Reason: ${e.deletion_reason || 'N/A'}</div>` : ''}
      </td>
      <td style="padding:8px 10px; border:1px solid #e2e8f0; font-size:11px;">${e.category || '-'}</td>
      <td style="padding:8px 10px; border:1px solid #e2e8f0; font-size:11px; text-align:right; font-weight:600; text-decoration:${dec}; color:${amtCol};">৳${parseFloat(e.amount).toLocaleString()}</td>
      <td style="padding:8px 10px; border:1px solid #e2e8f0; font-size:11px;">${(e.payment_method || '').replace(/_/g, ' ')}</td>
      <td style="padding:8px 10px; border:1px solid #e2e8f0; font-size:11px; text-transform:uppercase;">${isDeleted ? 'REVERSED' : e.status}</td>
    </tr>
  `}).join('');

  const html = `
    <div style="font-family:'Inter','Segoe UI',sans-serif; padding:20px; background:#fff; color:#1e293b;">
      ${header}
      <table style="width:100%; border-collapse:collapse; margin-top:16px;">
        <thead>
          <tr style="background:#275fa7;">
            <th style="padding:10px; border:1px solid #1e4d8a; font-size:10px; font-weight:700; color:#fff; text-align:left; text-transform:uppercase; letter-spacing:0.5px;">Date</th>
            <th style="padding:10px; border:1px solid #1e4d8a; font-size:10px; font-weight:700; color:#fff; text-align:left; text-transform:uppercase; letter-spacing:0.5px;">Description</th>
            <th style="padding:10px; border:1px solid #1e4d8a; font-size:10px; font-weight:700; color:#fff; text-align:left; text-transform:uppercase; letter-spacing:0.5px;">Category</th>
            <th style="padding:10px; border:1px solid #1e4d8a; font-size:10px; font-weight:700; color:#fff; text-align:right; text-transform:uppercase; letter-spacing:0.5px;">Amount</th>
            <th style="padding:10px; border:1px solid #1e4d8a; font-size:10px; font-weight:700; color:#fff; text-align:left; text-transform:uppercase; letter-spacing:0.5px;">Method</th>
            <th style="padding:10px; border:1px solid #1e4d8a; font-size:10px; font-weight:700; color:#fff; text-align:left; text-transform:uppercase; letter-spacing:0.5px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
          <tr style="background:#f0f9ff; font-weight:700;">
            <td colspan="3" style="padding:10px; border:1px solid #e2e8f0; font-size:12px; text-align:right;">TOTAL</td>
            <td style="padding:10px; border:1px solid #e2e8f0; font-size:14px; text-align:right; color:#275fa7;">৳${totalAmount.toLocaleString()}</td>
            <td colspan="2" style="border:1px solid #e2e8f0;"></td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top:32px; text-align:center; font-size:10px; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:8px;">
        Generated on ${new Date().toLocaleString()} | ${info.name} Finance System
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = html;

  const opt = {
    margin: [10, 10, 10, 10],
    filename: `Expense-Report-${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  await html2pdf().set(opt).from(container).save();
};
