/* Create Request - single-page proposal + split quotation form */
PCT.Pages.RequestCreate = {
  title: 'สร้างคำขอใหม่',
  _data: {},

  render() {
    return `
      ${PCT.UI.pageHeader({
        title: 'สร้างคำขอใหม่',
        subtitle: 'หน้าเดียวจบ เลือกลูกค้า แยก Quotation และส่งคำขอ',
        breadcrumb: [{label:'Dashboard',route:'dashboard'},{label:'คำขอ',route:'requests'},{label:'สร้างใหม่',route:'request-create'}]
      })}

      <div class="quick-form-layout">
        <div class="quick-form-main">
          <div class="card mb-4">
            <div class="card-header"><div class="card-title">${PCT.Icons.filePlus} ข้อมูลหลัก</div></div>
            <div class="card-body quick-form-section">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label" for="proposal-no">หมายเลข Proposal <span class="required">*</span></label>
                  <input class="form-control" id="proposal-no" placeholder="เช่น PP-2026-0012" />
                </div>
                <div class="form-group">
                  <label class="form-label">Quotation No.</label>
                  <div class="readonly-pill td-mono" id="quotation-preview">เลือกประเภทการขายก่อน</div>
                </div>
              </div>

              <div>
                <div class="section-label">ประเภทการขาย</div>
                <div class="radio-group" id="sale-type-group">
                  ${[
                    ['hardware', 'Hardware', 'Quotation-1'],
                    ['hardware_software_installation', 'Hardware + Software & Installation', 'Quotation-1 และ Quotation-2']
                  ].map(([v,t,d])=>`
                    <label class="radio-card compact" data-val="${v}">
                      <input type="radio" name="sale-type" value="${v}" />
                      <div class="radio-check"></div>
                      <div class="radio-card-content">
                        <div class="radio-card-title">${t}</div>
                        <div class="radio-card-desc">${d}</div>
                      </div>
                    </label>`).join('')}
                </div>
              </div>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header"><div class="card-title">${PCT.Icons.building} ลูกค้า</div></div>
            <div class="card-body quick-form-section">
              <div class="radio-group" id="customer-mode-group">
                ${[
                  ['new_customer', 'ลูกค้าใหม่', 'กรอกชื่อบริษัท'],
                  ['existing_customer', 'ลูกค้าเก่า', 'เลือกจาก database'],
                  ['reseller', 'Reseller', 'เลือก reseller แล้วกรอกลูกค้าปลายทาง']
                ].map(([v,t,d])=>`
                  <label class="radio-card compact" data-val="${v}">
                    <input type="radio" name="customer-mode" value="${v}" />
                    <div class="radio-check"></div>
                    <div class="radio-card-content">
                      <div class="radio-card-title">${t}</div>
                      <div class="radio-card-desc">${d}</div>
                    </div>
                  </label>`).join('')}
              </div>
              <div id="customer-fields"></div>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header"><div class="card-title">${PCT.Icons.dollarSign} ราคาและ Quotation</div></div>
            <div class="card-body quick-form-section">
              <div id="price-fields">
                <div class="empty-state" style="padding:26px 16px">
                  <div class="empty-title">เลือกประเภทการขายก่อน</div>
                  <p class="empty-desc">ระบบจะแสดง Quotation และช่องราคาที่จำเป็นให้เอง</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header"><div class="card-title">${PCT.Icons.creditCard} งวดและเครดิต</div></div>
            <div class="card-body quick-form-section">
              <div class="form-group" style="max-width:260px">
                <label class="form-label" for="installment-count">จำนวนงวด <span class="required">*</span></label>
                <div class="input-group">
                  <input class="form-control" type="number" id="installment-count" min="1" max="4" value="1" />
                  <span class="input-addon">งวด</span>
                </div>
                <div class="form-hint">สูงสุด 4 งวด และเปอร์เซ็นต์รวมต้องเป็น 100%</div>
              </div>
              <div id="installment-plan-wrap"></div>
            </div>
          </div>
        </div>

        <aside class="quick-form-summary">
          <div class="card">
            <div class="card-header"><div class="card-title">${PCT.Icons.checkCircle} สรุป</div></div>
            <div class="card-body quick-summary-body">
              <div>
                <div class="info-item-label">Proposal</div>
                <div class="info-item-value td-mono" id="summary-proposal">—</div>
              </div>
              <div>
                <div class="info-item-label">Quotation</div>
                <div class="info-item-value td-mono" id="summary-quotation">—</div>
              </div>
              <div>
                <div class="info-item-label">ประเภทขาย</div>
                <div class="info-item-value" id="summary-type">—</div>
              </div>
              <div>
                <div class="info-item-label">ลูกค้า</div>
                <div class="info-item-value" id="summary-customer">—</div>
              </div>
              <hr class="divider" style="margin:6px 0" />
              <div class="quick-total-grid">
                <div>
                  <div class="info-item-label">Hardware</div>
                  <div class="info-item-value" id="summary-hardware">฿0</div>
                </div>
                <div>
                  <div class="info-item-label">Software</div>
                  <div class="info-item-value" id="summary-software">฿0</div>
                </div>
                <div>
                  <div class="info-item-label">Installation</div>
                  <div class="info-item-value" id="summary-installation">฿0</div>
                </div>
              </div>
              <div>
                <div class="info-item-label">ขายรวมทั้งหมด</div>
                <div class="info-item-value" id="summary-sale" style="font-size:1.25rem;color:var(--navy);font-weight:700">฿0</div>
              </div>
              <div>
                <div class="info-item-label">ต้นทุนรวมทั้งหมด</div>
                <div class="info-item-value" id="summary-cost">฿0</div>
              </div>
              <div>
                <div class="info-item-label">งวด</div>
                <div class="info-item-value" id="summary-installments">1 งวด · รวม 100%</div>
              </div>
              <div class="quick-form-actions">
                <button class="btn btn-secondary btn-full" id="save-draft-btn">${PCT.Icons.edit} บันทึกร่าง</button>
                <button class="btn btn-primary btn-full" id="submit-request-btn">${PCT.Icons.check} ส่งคำขอ</button>
              </div>
            </div>
          </div>
        </aside>
      </div>`;
  },

  init() {
    this._data = {};
    this._bindStaticEvents();
    this._renderInstallments(true);
    this._updateSummary();
  },

  _bindStaticEvents() {
    document.getElementById('proposal-no').addEventListener('input', () => this._updateSummary());
    document.getElementById('installment-count').addEventListener('input', () => this._renderInstallments(true));

    document.querySelectorAll('#sale-type-group .radio-card[data-val]').forEach(card => {
      card.addEventListener('click', () => {
        this._selectRadio('#sale-type-group', card);
        this._data.type = card.dataset.val;
        this._data.quotationRefs = this._makeQuotationRefs(this._data.type);
        document.getElementById('quotation-preview').textContent = this._quotationSummaryText();
        this._renderPriceFields();
        this._updateSummary();
      });
    });

    document.querySelectorAll('#customer-mode-group .radio-card[data-val]').forEach(card => {
      card.addEventListener('click', () => {
        this._selectRadio('#customer-mode-group', card);
        this._data.customerMode = card.dataset.val;
        this._renderCustomerFields();
        this._updateSummary();
      });
    });

    document.getElementById('save-draft-btn').onclick = () => this._submitAs('draft');
    document.getElementById('submit-request-btn').onclick = () => this._submitAs('pending');
  },

  _selectRadio(groupSelector, card) {
    document.querySelectorAll(`${groupSelector} .radio-card`).forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    card.querySelector('input').checked = true;
  },

  _makeQuotationRefs(type) {
    const base = PCT.Utils.genReqNo().replace('PCT-', 'QT-');
    return {
      base,
      hardware: `${base}-1`,
      softwareInstallation: type === 'hardware_software_installation' ? `${base}-2` : ''
    };
  },

  _quotationSummaryText() {
    const refs = this._data.quotationRefs;
    if (!refs) return 'เลือกประเภทการขายก่อน';
    return refs.softwareInstallation ? `${refs.hardware} / ${refs.softwareInstallation}` : refs.hardware;
  },

  _saleTypeLabel(type) {
    return type === 'hardware' ? 'Hardware' : 'Hardware + Software & Installation';
  },

  _renderCustomerFields() {
    const customers = PCT.Data.getCustomers().filter(c => c.status === 'active');
    const selectOptions = customers.map(c => `<option value="${c.id}">${PCT.Utils.escapeHtml(c.name)} (${PCT.Utils.escapeHtml(c.code)})</option>`).join('');

    let html = '';
    if (this._data.customerMode === 'new_customer') {
      html = `
        <div class="form-group">
          <label class="form-label" for="new-customer-name">บริษัท <span class="required">*</span></label>
          <input class="form-control" id="new-customer-name" placeholder="ชื่อบริษัท" />
        </div>`;
    }
    if (this._data.customerMode === 'existing_customer') {
      html = `
        <div class="form-group">
          <label class="form-label" for="existing-customer-id">ลูกค้าเก่า <span class="required">*</span></label>
          <select class="form-control" id="existing-customer-id">
            <option value="">เลือกลูกค้า...</option>
            ${selectOptions}
          </select>
        </div>`;
    }
    if (this._data.customerMode === 'reseller') {
      html = `
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label" for="reseller-id">Reseller <span class="required">*</span></label>
            <select class="form-control" id="reseller-id">
              <option value="">เลือก reseller...</option>
              ${selectOptions}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="end-customer-name">ลูกค้าปลายทาง <span class="required">*</span></label>
            <input class="form-control" id="end-customer-name" placeholder="ชื่อลูกค้าปลายทาง" />
          </div>
        </div>`;
    }
    document.getElementById('customer-fields').innerHTML = html;
    document.querySelectorAll('#customer-fields input,#customer-fields select').forEach(el => {
      el.addEventListener('input', () => this._updateSummary());
      el.addEventListener('change', () => this._updateSummary());
    });
  },

  _renderPriceFields() {
    const refs = this._data.quotationRefs || {};
    const softwareBlock = this._data.type === 'hardware_software_installation' ? `
      <div class="quote-price-card">
        <div class="quote-price-head">
          <div>
            <div class="section-label">Quotation No. -2</div>
            <div class="td-mono">${PCT.Utils.escapeHtml(refs.softwareInstallation || '')}</div>
          </div>
          <div class="quote-price-total" id="quote-2-total">รวม ฿0</div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label" for="software-sale-price">ราคาขาย Software <span class="required">*</span></label>
            <div class="input-group"><input class="form-control js-total-input" type="number" id="software-sale-price" min="0" step="1000" placeholder="0" /><span class="input-addon">THB</span></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="software-cost-price">ราคาทุน Software <span class="required">*</span></label>
            <div class="input-group"><input class="form-control js-total-input" type="number" id="software-cost-price" min="0" step="1000" placeholder="0" /><span class="input-addon">THB</span></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="installation-sale-price">ราคาขาย Installation <span class="required">*</span></label>
            <div class="input-group"><input class="form-control js-total-input" type="number" id="installation-sale-price" min="0" step="1000" placeholder="0" /><span class="input-addon">THB</span></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="installation-cost-price">ราคาทุน Installation <span class="required">*</span></label>
            <div class="input-group"><input class="form-control js-total-input" type="number" id="installation-cost-price" min="0" step="1000" placeholder="0" /><span class="input-addon">THB</span></div>
          </div>
        </div>
      </div>` : '';

    document.getElementById('price-fields').innerHTML = `
      <div class="quote-price-card">
        <div class="quote-price-head">
          <div>
            <div class="section-label">Quotation No. -1</div>
            <div class="td-mono">${PCT.Utils.escapeHtml(refs.hardware || '')}</div>
          </div>
          <div class="quote-price-total" id="quote-1-total">รวม ฿0</div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label" for="hardware-sale-price">ราคาขาย Hardware <span class="required">*</span></label>
            <div class="input-group"><input class="form-control js-total-input" type="number" id="hardware-sale-price" min="0" step="1000" placeholder="0" /><span class="input-addon">THB</span></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="hardware-cost-price">ราคาทุน Hardware <span class="required">*</span></label>
            <div class="input-group"><input class="form-control js-total-input" type="number" id="hardware-cost-price" min="0" step="1000" placeholder="0" /><span class="input-addon">THB</span></div>
          </div>
        </div>
      </div>
      ${softwareBlock}
      <div class="quote-grand-total">
        <span>รวม Hardware / Software / Installation</span>
        <strong id="price-grand-total">฿0</strong>
      </div>`;

    document.querySelectorAll('.js-total-input').forEach(el => {
      el.addEventListener('input', () => this._updateSummary());
    });
  },

  _renderInstallments(redistribute) {
    const countEl = document.getElementById('installment-count');
    let count = parseInt(countEl.value) || 1;
    count = Math.max(1, Math.min(4, count));
    countEl.value = count;

    const oldPlan = this._readInstallmentPlan(false);
    const basePct = Math.floor(100 / count);
    const remainder = 100 - (basePct * count);
    const plan = Array.from({ length: count }, (_, i) => {
      const old = oldPlan[i] || {};
      return {
        percent: redistribute ? basePct + (i === count - 1 ? remainder : 0) : (old.percent || basePct + (i === count - 1 ? remainder : 0)),
        creditDays: old.creditDays || 0
      };
    });

    document.getElementById('installment-plan-wrap').innerHTML = `
      <div class="table-container installment-table">
        <table class="data-table compact-table">
          <thead><tr><th>งวด</th><th>%</th><th>Credit</th></tr></thead>
          <tbody>
            ${plan.map((p,i)=>`
              <tr>
                <td class="td-bold">งวด ${i+1}</td>
                <td><div class="input-group"><input class="form-control installment-percent" type="number" min="0" max="100" step="1" value="${p.percent}" /><span class="input-addon">%</span></div></td>
                <td><div class="input-group"><input class="form-control installment-credit" type="number" min="0" max="180" step="1" value="${p.creditDays}" /><span class="input-addon">วัน</span></div></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="form-hint installment-total-hint" id="installment-total-hint"></div>`;

    document.querySelectorAll('.installment-percent,.installment-credit').forEach(el => {
      el.addEventListener('input', () => this._updateSummary());
    });
    this._updateSummary();
  },

  _readInstallmentPlan() {
    return [...document.querySelectorAll('#installment-plan-wrap tbody tr')].map((row, i) => {
      const percent = parseFloat(row.querySelector('.installment-percent')?.value) || 0;
      const creditDays = parseInt(row.querySelector('.installment-credit')?.value) || 0;
      return { installmentNo: i + 1, percent, creditDays };
    });
  },

  _getNumber(id) {
    return parseFloat(document.getElementById(id)?.value) || 0;
  },

  _priceTotals() {
    const hardwareSalePrice = this._getNumber('hardware-sale-price');
    const hardwareCostPrice = this._getNumber('hardware-cost-price');
    const softwareSalePrice = this._getNumber('software-sale-price');
    const softwareCostPrice = this._getNumber('software-cost-price');
    const installationSalePrice = this._getNumber('installation-sale-price');
    const installationCostPrice = this._getNumber('installation-cost-price');
    const quotation1Sale = hardwareSalePrice;
    const quotation1Cost = hardwareCostPrice;
    const quotation2Sale = softwareSalePrice + installationSalePrice;
    const quotation2Cost = softwareCostPrice + installationCostPrice;

    return {
      sale: quotation1Sale + quotation2Sale,
      cost: quotation1Cost + quotation2Cost,
      quotation1Sale,
      quotation1Cost,
      quotation2Sale,
      quotation2Cost,
      hardwareSalePrice,
      hardwareCostPrice,
      softwareSalePrice,
      softwareCostPrice,
      installationSalePrice,
      installationCostPrice
    };
  },

  _customerSummary() {
    if (this._data.customerMode === 'new_customer') return document.getElementById('new-customer-name')?.value.trim() || '—';
    if (this._data.customerMode === 'existing_customer') {
      const c = PCT.Data.getCustomerById(document.getElementById('existing-customer-id')?.value);
      return c ? c.name : '—';
    }
    if (this._data.customerMode === 'reseller') {
      const reseller = PCT.Data.getCustomerById(document.getElementById('reseller-id')?.value);
      const end = document.getElementById('end-customer-name')?.value.trim();
      return reseller ? `${reseller.name} > ${end || 'ลูกค้าปลายทาง'}` : (end || '—');
    }
    return '—';
  },

  _updateSummary() {
    const proposalNo = document.getElementById('proposal-no')?.value.trim() || '—';
    const totals = this._priceTotals();
    const plan = this._readInstallmentPlan();
    const pctTotal = plan.reduce((sum, row) => sum + row.percent, 0);
    const hint = document.getElementById('installment-total-hint');
    if (hint) {
      hint.textContent = `รวม ${pctTotal}%`;
      hint.classList.toggle('ok', pctTotal === 100);
      hint.classList.toggle('bad', pctTotal !== 100);
    }

    const q1Total = document.getElementById('quote-1-total');
    const q2Total = document.getElementById('quote-2-total');
    const grandTotal = document.getElementById('price-grand-total');
    if (q1Total) q1Total.textContent = `รวม ${PCT.Utils.formatCurrency(totals.quotation1Sale)}`;
    if (q2Total) q2Total.textContent = `รวม ${PCT.Utils.formatCurrency(totals.quotation2Sale)}`;
    if (grandTotal) grandTotal.textContent = PCT.Utils.formatCurrency(totals.sale);

    document.getElementById('summary-proposal').textContent = proposalNo;
    document.getElementById('summary-quotation').textContent = this._quotationSummaryText();
    document.getElementById('summary-type').textContent = this._data.type ? this._saleTypeLabel(this._data.type) : '—';
    document.getElementById('summary-customer').textContent = this._customerSummary();
    document.getElementById('summary-hardware').textContent = PCT.Utils.formatCurrency(totals.hardwareSalePrice);
    document.getElementById('summary-software').textContent = PCT.Utils.formatCurrency(totals.softwareSalePrice);
    document.getElementById('summary-installation').textContent = PCT.Utils.formatCurrency(totals.installationSalePrice);
    document.getElementById('summary-sale').textContent = PCT.Utils.formatCurrency(totals.sale);
    document.getElementById('summary-cost').textContent = PCT.Utils.formatCurrency(totals.cost);
    document.getElementById('summary-installments').textContent = `${plan.length || 1} งวด · รวม ${pctTotal}%`;
  },

  _collectAndValidate() {
    const proposalNo = document.getElementById('proposal-no').value.trim();
    const type = this._data.type;
    const customerMode = this._data.customerMode;
    const totals = this._priceTotals();
    const installmentCount = parseInt(document.getElementById('installment-count').value) || 0;

    if (!proposalNo) throw new Error('กรุณากรอกหมายเลข Proposal');
    if (!type) throw new Error('กรุณาเลือกประเภทการขาย');
    if (!customerMode) throw new Error('กรุณาเลือกรูปแบบลูกค้า');

    const customer = this._collectCustomer(customerMode);
    if (!totals.hardwareSalePrice || !totals.hardwareCostPrice) {
      throw new Error('กรุณากรอกราคาขายและราคาทุน Hardware');
    }
    if (type === 'hardware_software_installation' && (!totals.softwareSalePrice || !totals.softwareCostPrice || !totals.installationSalePrice || !totals.installationCostPrice)) {
      throw new Error('กรุณากรอกราคาขายและราคาทุนของ Software และ Installation');
    }
    if (installmentCount < 1 || installmentCount > 4) throw new Error('จำนวนงวดต้องอยู่ระหว่าง 1-4 งวด');

    const installmentPlan = this._readInstallmentPlan();
    const pctTotal = installmentPlan.reduce((sum, row) => sum + row.percent, 0);
    if (pctTotal !== 100) throw new Error(`เปอร์เซ็นต์งวดรวมต้องเป็น 100% ตอนนี้รวม ${pctTotal}%`);

    return { proposalNo, type, customerMode, totals, customer, installmentCount, installmentPlan };
  },

  _collectCustomer(customerMode) {
    if (customerMode === 'new_customer') {
      const name = document.getElementById('new-customer-name').value.trim();
      if (!name) throw new Error('กรุณากรอกชื่อบริษัท');
      return { customerId: 'new_' + PCT.Utils.uid(), customerName: name, customerCode: 'NEW', resellerName: '', endCustomerName: '' };
    }
    if (customerMode === 'existing_customer') {
      const id = document.getElementById('existing-customer-id').value;
      const customer = PCT.Data.getCustomerById(id);
      if (!customer) throw new Error('กรุณาเลือกลูกค้าเก่า');
      return { customerId: customer.id, customerName: customer.name, customerCode: customer.code, resellerName: '', endCustomerName: '' };
    }
    const reseller = PCT.Data.getCustomerById(document.getElementById('reseller-id').value);
    const endCustomerName = document.getElementById('end-customer-name').value.trim();
    if (!reseller) throw new Error('กรุณาเลือก reseller');
    if (!endCustomerName) throw new Error('กรุณากรอกลูกค้าปลายทาง');
    return { customerId: reseller.id, customerName: reseller.name, customerCode: reseller.code, resellerName: reseller.name, endCustomerName };
  },

  _submitAs(status) {
    let payload;
    try {
      payload = this._collectAndValidate();
    } catch (err) {
      PCT.UI.toast(err.message, 'warning');
      return;
    }

    const btn = document.getElementById(status === 'draft' ? 'save-draft-btn' : 'submit-request-btn');
    btn.disabled = true;
    btn.innerHTML = `<div class="spinner" style="width:16px;height:16px"></div> ${status === 'draft' ? 'กำลังบันทึก...' : 'กำลังส่ง...'}`;

    const user = PCT.Auth.getCurrentUser();
    const now = new Date().toISOString();
    const refs = this._data.quotationRefs;
    const req = {
      id: 'req_' + PCT.Utils.uid(),
      requestNo: PCT.Utils.genReqNo(),
      type: payload.type,
      proposalNo: payload.proposalNo,
      customerMode: payload.customerMode,
      customerId: payload.customer.customerId,
      customerName: payload.customer.customerName,
      customerCode: payload.customer.customerCode,
      resellerName: payload.customer.resellerName,
      endCustomerName: payload.customer.endCustomerName,
      requestedBy: user.id,
      requestedByName: user.name,
      department: user.department || '',
      quotationRef: refs.hardware,
      quotationRefs: refs,
      dealTitle: `${this._saleTypeLabel(payload.type)} ${this._quotationSummaryText()}`,
      dealValue: payload.totals.sale,
      dealCategories: payload.type === 'hardware' ? ['hardware'] : ['hardware', 'software', 'installation'],
      hardwareSalePrice: payload.totals.hardwareSalePrice || null,
      hardwareCostPrice: payload.totals.hardwareCostPrice || null,
      softwareSalePrice: payload.totals.softwareSalePrice || null,
      softwareCostPrice: payload.totals.softwareCostPrice || null,
      installationSalePrice: payload.totals.installationSalePrice || null,
      installationCostPrice: payload.totals.installationCostPrice || null,
      quotation1Sale: payload.totals.quotation1Sale,
      quotation1Cost: payload.totals.quotation1Cost,
      quotation2Sale: payload.totals.quotation2Sale,
      quotation2Cost: payload.totals.quotation2Cost,
      costPrice: payload.totals.cost,
      salePrice: payload.totals.sale,
      installmentCount: payload.installmentCount,
      installmentPlan: payload.installmentPlan,
      reason: '',
      notes: '',
      riskAssessment: 'low',
      status,
      approvals: [{ level:1, approverId:null, approverName:null, action:null, comment:'', actionAt:null }],
      accountingStatus: null,
      accountingNote: '',
      processedBy: null,
      processedAt: null,
      createdAt: now,
      updatedAt: now
    };

    setTimeout(() => {
      PCT.Data.saveRequest(req);
      PCT.UI.toast(status === 'draft' ? 'บันทึกร่างเรียบร้อยแล้ว' : 'ส่งคำขอสำเร็จ', 'success', this._quotationSummaryText());
      PCT.Router.navigate('request-detail', { id: req.id });
    }, 300);
  }
};
