import app from 'flarum/forum/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';

export default class PurchaseModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);
    this.count = 1;
    this.purchase = null;
  }

  className() {
    return 'RafflePurchaseModal Modal--small';
  }

  title() {
    return this.attrs.raffle.title;
  }

  content() {
    if (this.purchase?.opened) return this.resultContent();
    if (this.purchase) return this.scratchContent();

    const raffle = this.attrs.raffle;
    const remaining = Math.max(0, raffle.amount - raffle.purchased);
    const limitRemaining = raffle.limit > 0 ? Math.max(0, raffle.limit - this.attrs.purchased) : remaining;
    const max = Math.min(remaining, limitRemaining);

    return (
      <div className="Modal-body">
        <form className="Form" onsubmit={(event) => this.buy(event)}>
          <div className="Form-group">
            <label>{app.translator.trans('ziven-guaguale.forum.guaguale-purchase-input-placeholder')}</label>
            <input autofocus required type="number" min="1" max={max} step="1" className="FormControl" value={this.count} oninput={(event) => (this.count = event.target.value)} />
            <div className="helpText">
              {app.translator.trans('ziven-guaguale.forum.guaguale-current-money-amount')} {Number(app.session.user?.attribute('pointBalance') || 0)} {this.currency()}
              <br />
              {app.translator.trans('ziven-guaguale.forum.guaguale-available-amount', { count: remaining })}
            </div>
          </div>
          <div className="Form-group Form-controls">
            <Button type="submit" className="Button Button--primary" loading={this.loading} disabled={max < 1}>
              {app.translator.trans('ziven-guaguale.forum.guaguale-purchase-confirm')}
            </Button>
            <Button type="button" className="Button" onclick={() => this.hide()}>{app.translator.trans('ziven-guaguale.forum.guaguale-purchase-cancel')}</Button>
          </div>
        </form>
      </div>
    );
  }

  scratchContent() {
    return (
      <div className="Modal-body RafflePurchaseModal-result">
        <p>{app.translator.trans('ziven-guaguale.forum.guaguale-purchase-success')}</p>
        <Button className="Button Button--primary" icon="fas fa-ticket-alt" loading={this.loading} onclick={() => this.scratch()}>
          {app.translator.trans('ziven-guaguale.forum.guaguale-purchase-scratch')}
        </Button>
      </div>
    );
  }

  resultContent() {
    const result = this.parseResult(this.purchase.pruchase_result);
    return (
      <div className="Modal-body RafflePurchaseModal-result">
        <div className="RafflePurchaseModal-total">
          {app.translator.trans('ziven-guaguale.forum.guaguale-scratch-result', { money: this.purchase.pruchase_win_total })}
        </div>
        <div className="RafflePurchaseModal-prizes">
          {Object.entries(result).map(([value, count]) => <span>{value} {this.currency()} x{count}</span>)}
        </div>
        <Button className="Button" onclick={() => this.hide()}>{app.translator.trans('ziven-guaguale.forum.guaguale-close')}</Button>
      </div>
    );
  }

  async buy(event) {
    event.preventDefault();
    this.loading = true;
    try {
      const response = await app.request({
        method: 'POST',
        url: `${app.forum.attribute('apiUrl')}/guagualePurchase`,
        body: { data: { attributes: { guagualeID: Number(this.attrs.raffle.id), guagualePurchaseCount: Number(this.count) } } },
      });
      this.purchase = this.resource(response.data?.[0]);
      this.attrs.onPurchased();
    } catch (error) {
      app.alerts.show({ type: 'error' }, this.errorMessage(error));
    } finally {
      this.loading = false;
      m.redraw();
    }
  }

  async scratch() {
    this.loading = true;
    try {
      const response = await app.request({
        method: 'PATCH',
        url: `${app.forum.attribute('apiUrl')}/guagualePurchase/${this.purchase.id}`,
        body: { data: { attributes: { guagualePurchaseID: Number(this.purchase.id) } } },
      });
      this.purchase = this.resource(response.data?.[0]);
    } catch (error) {
      app.alerts.show({ type: 'error' }, this.errorMessage(error));
    } finally {
      this.loading = false;
      m.redraw();
    }
  }

  resource(resource) {
    return resource ? { id: resource.id, ...resource.attributes } : null;
  }

  parseResult(value) {
    try { return JSON.parse(value || '{}'); } catch (error) { return {}; }
  }

  currency() {
    return app.forum.attribute('pointSystem.currency_name') || 'Points';
  }

  errorMessage(error) {
    return error?.response?.errors?.[0]?.detail || app.translator.trans('ziven-guaguale.forum.purchase-error');
  }
}
