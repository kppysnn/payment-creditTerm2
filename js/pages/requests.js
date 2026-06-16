/* Request List */
PCT.Pages.Requests = {
  title: 'คำขอทั้งหมด',

  render() {
    return `
      ${PCT.UI.pageHeader({
        title: 'คำขอทั้งหมด',
        breadcrumb: [{label:'Dashboard',route:'dashboard'},{label:'คำขอ',route:'requests'}],
        actions: PCT.Auth.hasRole('sales','admin')
          ? `<button class="btn btn-primary" onclick="PCT.Router.navigate('request-create')">${PCT.Icons.filePlus} สร้างคำขอใหม่</button>`
          : ''
      })}
      <div class="card">
        <div class="card-body" style="padding-bottom:0">
          <div class="filter-bar">
            <div class="search-box">
              ${PCT.Icons.search}
              <input class="form-control" id="req-search" placeholder="ค้นหาเลขที่คำขอ, ชื่อลูกค้า..." />
            </div>
            <select class="form-control filter-select" id="req-status-filter">
              <option value="">สถานะทั้งหมด</option>
              <option value="pending">รอพิจารณา</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="rejected">ไม่อนุมัติ</option>
              <option value="processed">ดำเนินการแล้ว</option>
            </select>
            <select class="form-control filter-select" id="req-type-filter">
              <option value="">ประเภทคำขอทั้งหมด</option>
              <option value="hardware">Hardware</option>
              <option value="hardware_software_installation">Hardware + Software & Installation</option>
              <option value="credit_term">วงเงินเครดิต</option>
              <option value="payment_term">เงื่อนไขชำระเงิน</option>
              <option value="both">ทั้งสองรายการ</option>
            </select>
          </div>
        </div>
        <div id="req-table-wrap"></div>
        <div class="card-footer" id="req-footer" style="justify-content:flex-end"></div>
      </div>`;
  },

  init() {
    this._page = 1;
    this._pageSize = 10;
    this._filters = { search:'', status:'', type:'' };
    this._renderTable();

    const debounced = PCT.Utils.debounce(() => { this._filters.search = document.getElementById('req-search').value.toLowerCase(); this._page=1; this._renderTable(); }, 250);
    document.getElementById('req-search').addEventListener('input', debounced);
    document.getElementById('req-status-filter').addEventListener('change', e => { this._filters.status = e.target.value; this._page=1; this._renderTable(); });
    document.getElementById('req-type-filter').addEventListener('change', e => { this._filters.type = e.target.value; this._page=1; this._renderTable(); });
  },

  _getFiltered() {
    const user = PCT.Auth.getCurrentUser();
    let reqs = PCT.Data.getRequests();
    if (user.role === 'sales') reqs = reqs.filter(r => r.requestedBy === user.id);
    const {search, status, type} = this._filters;
    if (search) reqs = reqs.filter(r =>
      r.requestNo.toLowerCase().includes(search) ||
      (r.quotationRef || '').toLowerCase().includes(search) ||
      (r.quotationRefs?.hardware || '').toLowerCase().includes(search) ||
      (r.quotationRefs?.softwareInstallation || '').toLowerCase().includes(search) ||
      r.customerName.toLowerCase().includes(search) ||
      (r.endCustomerName || '').toLowerCase().includes(search)
    );
    if (status) reqs = reqs.filter(r => r.status === status);
    if (type)   reqs = reqs.filter(r => r.type === type);
    return reqs.sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
  },

  _renderTable() {
    const all = this._getFiltered();
    const total = all.length;
    const start = (this._page - 1) * this._pageSize;
    const page  = all.slice(start, start + this._pageSize);
    const user  = PCT.Auth.getCurrentUser();

    const rows = page.map(r => {
      const canCancel = r.status === 'pending' && (r.requestedBy === user.id || user.role === 'admin');
      const quoteText = r.quotationRefs?.softwareInstallation
        ? `${r.quotationRefs.hardware} / ${r.quotationRefs.softwareInstallation}`
        : (r.quotationRef || r.quotationRefs?.hardware || '');
      return `
        <tr class="request-row">
          <td><span class="td-mono">${PCT.Utils.escapeHtml(r.requestNo)}</span></td>
          <td>
            <div class="request-customer-cell">
              <strong>${PCT.Utils.escapeHtml(r.customerName)}</strong>
              <span>${r.endCustomerName ? `ปลายทาง: ${PCT.Utils.escapeHtml(r.endCustomerName)}` : PCT.Utils.escapeHtml(r.customerCode || '—')}</span>
            </div>
          </td>
          <td>
            <div class="request-type-cell">
              <span>${PCT.REQUEST_TYPE_LABELS[r.type] || r.type}</span>
              ${quoteText ? `<small class="td-mono">${PCT.Utils.escapeHtml(quoteText)}</small>` : ''}
            </div>
          </td>
          <td>${r.salePrice ? PCT.Utils.formatCurrency(r.salePrice) : r.creditAmount ? PCT.Utils.formatCurrency(r.creditAmount) : r.paymentTermDays ? r.paymentTermDays+' วัน' : '—'}</td>
          <td>${PCT.Utils.statusBadge(r.status)}</td>
          <td class="text-secondary text-sm">${PCT.Utils.formatDate(r.createdAt)}</td>
          <td class="td-actions">
            <button class="btn btn-ghost btn-sm" onclick="PCT.Router.navigate('request-detail',{id:'${r.id}'})">${PCT.Icons.eye}</button>
            ${canCancel ? `<button class="btn-icon danger" onclick="PCT.Pages.Requests._cancel('${r.id}')" title="ยกเลิก">${PCT.Icons.trash}</button>` : ''}
          </td>
        </tr>`;
    }).join('');

    document.getElementById('req-table-wrap').innerHTML = total ? `
      <div class="table-container" style="border:none;border-radius:0">
        <table class="data-table">
          <thead><tr>
            <th>เลขที่คำขอ</th><th>ลูกค้า</th><th>ประเภท / Quotation</th><th>ยอดรวม</th><th>สถานะ</th><th>วันที่สร้าง</th><th></th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>` : `<div class="empty-state"><div class="empty-icon">${PCT.Icons.file}</div><div class="empty-title">ไม่พบข้อมูล</div><p class="empty-desc">ลองปรับเงื่อนไขการค้นหา</p></div>`;

    /* Pagination */
    const pages = Math.ceil(total / this._pageSize);
    let pagination = `<span class="text-xs text-muted">แสดง ${Math.min(start+1,total)}–${Math.min(start+this._pageSize,total)} จาก ${total} รายการ</span><div class="pagination">`;
    pagination += `<button class="page-btn" ${this._page===1?'disabled':''} onclick="PCT.Pages.Requests._goPage(${this._page-1})">${PCT.Icons.chevronLeft}</button>`;
    for (let i=1;i<=pages;i++) pagination += `<button class="page-btn ${i===this._page?'active':''}" onclick="PCT.Pages.Requests._goPage(${i})">${i}</button>`;
    pagination += `<button class="page-btn" ${this._page===pages||pages===0?'disabled':''} onclick="PCT.Pages.Requests._goPage(${this._page+1})">${PCT.Icons.chevronRight}</button></div>`;
    document.getElementById('req-footer').innerHTML = pagination;
  },

  _goPage(p) { this._page = p; this._renderTable(); },

  _cancel(id) {
    PCT.UI.confirm({
      title: 'ยกเลิกคำขอ',
      msg: 'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำขอนี้?',
      confirmLabel: 'ยกเลิกคำขอ',
      danger: true,
      onConfirm: () => {
        const req = PCT.Data.getRequestById(id);
        if (req) { req.status = 'cancelled'; PCT.Data.saveRequest(req); }
        PCT.UI.toast('ยกเลิกคำขอแล้ว', 'success');
        this._renderTable();
      }
    });
  }
};
