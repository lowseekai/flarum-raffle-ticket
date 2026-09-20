import app from 'flarum/forum/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import ScratchCard from './ScratchCard';

export default class PurchaseModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);
    this.count = 1;
    this.purchase = this.attrs.purchase || null;
    this.loading = false;
  }

  className() {
    return 'RafflePurchaseModal Modal--small';
  }

  title() {
    return this.attrs.raffle?.title || this.purchase?.title || app.translator.trans('ziven-guaguale.forum.guaguale-purchase');
  }

  content() {
    if (this.purchase) return this.scratchContent();

    const raffle = this.attrs.raffle;
    const remaining = Math.max(0, Number(raffle.amount) - Number(raffle.purchased));
    const purchased = Number(this.attrs.purchased || 0);
    const limit = Number(raffle.limit || 0);
    const limitRemaining = limit > 0 ? Math.max(0, limit - purchased) : remaining;
    const max = Math.min(remaining, limitRemaining);
    const count = Math.max(1, Math.min(max || 1, Number(this.count) || 1));
    const cost = Number(raffle.cost || 0);

    return (
      <div className="Modal-body">
        <form className="Form RafflePurchaseModal-form" onsubmit={(event) => this.buy(event)}>
          <div className="RafflePurchaseModal-facts">
            <div><span>{app.translator.trans('ziven-guaguale.forum.guaguale-available-label')}</span><strong>{remaining} {app.translator.trans('ziven-guaguale.forum.guaguale-unit-name')}</strong></div>
            <div><span>{app.translator.trans('ziven-guaguale.forum.guaguale-limit-label')}</span><strong>{limit > 0 ? `${limit} ${app.translator.trans('ziven-guaguale.forum.guaguale-unit-name')}` : app.translator.trans('ziven-guaguale.forum.guaguale-unlimited')}</strong></div>
            <div><span>{app.translator.trans('ziven-guaguale.forum.guaguale-purchased-label')}</span><strong>{purchased} {app.translator.trans('ziven-guaguale.forum.guaguale-unit-name')}</strong></div>
          </div>

          <div className="Form-group">
            <label>{app.translator.trans('ziven-guaguale.forum.guaguale-purchase-input-placeholder')}</label>
            <input autofocus required type="number" min="1" max={max} step="1" className="FormControl" value={this.count} oninput={(event) => (this.count = event.target.value)} />
          </div>

          <div className="RafflePurchaseModal-payment">
            <div><span>{app.translator.trans('ziven-guaguale.forum.guaguale-price-label')}</span><strong>{cost} {this.currency()}</strong></div>
            <div><span>{app.translator.trans('ziven-guaguale.forum.guaguale-current-money-amount')}</span><strong>{Number(app.session.user?.attribute('pointBalance') || 0)} {this.currency()}</strong></div>
            <div className="is-total"><span>{app.translator.trans('ziven-guaguale.forum.guaguale-payment-total')}</span><strong>{cost * count} {this.currency()}</strong></div>
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
        {!this.purchase.opened && <p className="helpText">{app.translator.trans('ziven-guaguale.forum.guaguale-scratch-instruction')}</p>}
        <ScratchCard purchase={this.purchase} onScratch={() => this.scratch()} />
        {this.loading && <div className="RafflePurchaseModal-opening">{app.translator.trans('ziven-guaguale.forum.guaguale-opening')}</div>}
        <div className="Form-controls">
          <Button className="Button" disabled={this.loading} onclick={() => this.hide()}>{app.translator.trans('ziven-guaguale.forum.guaguale-close')}</Button>
        </div>
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
      this.attrs.onPurchased?.();
    } catch (error) {
      app.alerts.show({ type: 'error' }, this.errorMessage(error));
    } finally {
      this.loading = false;
      m.redraw();
    }
  }

  async scratch() {
    if (this.loading || this.purchase?.opened) return;
    this.loading = true;
    m.redraw();
    try {
      const response = await app.request({
        method: 'PATCH',
        url: `${app.forum.attribute('apiUrl')}/guagualePurchase/${this.purchase.id}`,
        body: { data: { attributes: { guagualePurchaseID: Number(this.purchase.id) } } },
      });
      this.purchase = this.resource(response.data?.[0]);
      this.attrs.onOpened?.(this.purchase);
    } catch (error) {
      app.alerts.show({ type: 'error' }, this.errorMessage(error));
      throw error;
    } finally {
      this.loading = false;
      m.redraw();
    }
  }

  resource(resource) {
    return resource ? { id: resource.id, ...resource.attributes } : null;
  }

  currency() {
    return app.forum.attribute('pointSystem.currency_name') || 'Points';
  }

  errorMessage(error) {
    return error?.response?.errors?.[0]?.detail || app.translator.trans('ziven-guaguale.forum.purchase-error');
  }
}
