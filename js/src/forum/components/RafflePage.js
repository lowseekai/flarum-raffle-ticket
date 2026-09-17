import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import Button from 'flarum/common/components/Button';
import LinkButton from 'flarum/common/components/LinkButton';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import PurchaseModal from './PurchaseModal';

export default class RafflePage extends Page {
  oninit(vnode) {
    super.oninit(vnode);
    this.raffles = [];
    this.purchaseCounts = {};
    this.loading = true;
    const title = this.displayName();
    app.history.push('guaguale', title);
    app.setTitle(title);
    this.load();
  }

  view() {
    return (
      <div className="RafflePage">
        <div className="container">
          <div className="RafflePage-toolbar">
            <h1>{this.displayName()}</h1>
            <LinkButton href={app.route('guaguale.history')} icon="fas fa-history" className="Button">
              {app.translator.trans('ziven-guaguale.forum.guaguale-view-history')}
            </LinkButton>
          </div>
          {this.loading ? (
            <LoadingIndicator />
          ) : this.raffles.length ? (
            <div className="RafflePage-list">{this.raffles.map((raffle) => this.card(raffle))}</div>
          ) : (
            <div className="RafflePage-empty">{app.translator.trans('ziven-guaguale.forum.guaguale-list-empty')}</div>
          )}
        </div>
      </div>
    );
  }

  card(raffle) {
    const remaining = Math.max(0, raffle.amount - raffle.purchased);
    const soldOut = remaining === 0;
    const purchased = this.purchaseCounts[raffle.id] || 0;

    return (
      <article className={`GuaGuaLeContainer ${soldOut ? 'is-soldOut' : ''}`} style={this.cardStyle(raffle)}>
        <div className="GuaGuaLeMask">
          <div className="GuaGuaLeTitle">{soldOut ? `[${app.translator.trans('ziven-guaguale.forum.guaguale-list-item-soldout-text')}] ` : ''}{raffle.title}</div>
          <div className="GuaGuaLeDescription">{raffle.desc}</div>
          <div className="GuaGuaLeDetails">
            <span>{app.translator.trans('ziven-guaguale.forum.guaguale-list-item-cost', { cost: `${raffle.cost} ${this.currency()}` })}</span>
            <span>
              {soldOut
                ? app.translator.trans('ziven-guaguale.forum.guaguale-list-item-soldout')
                : app.translator.trans('ziven-guaguale.forum.guaguale-list-item-available', { available: remaining })}
            </span>
            {raffle.limit > 0 && <span>{app.translator.trans('ziven-guaguale.forum.guaguale-purchase-limit', { limit: raffle.limit })}</span>}
            {purchased > 0 && <span>{app.translator.trans('ziven-guaguale.forum.guaguale-purchase-count', { count: purchased })}</span>}
          </div>
          <Button className="Button Button--primary RafflePage-buy" icon="fas fa-ticket-alt" disabled={soldOut} onclick={() => this.purchase(raffle)}>
            {soldOut ? app.translator.trans('ziven-guaguale.forum.guaguale-list-item-soldout-text') : app.translator.trans('ziven-guaguale.forum.guaguale-purchase-now')}
          </Button>
        </div>
      </article>
    );
  }

  cardStyle(raffle) {
    if (raffle.image) return { backgroundImage: `url(${raffle.image})` };
    return { backgroundColor: raffle.color || this.colorFromTitle(raffle.title) };
  }

  colorFromTitle(title) {
    const colors = ['#356859', '#5b4b8a', '#28666e', '#8a4f3d', '#3f5f7a'];
    const hash = [...String(title)].reduce((value, char) => value + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  purchase(raffle) {
    app.modal.show(PurchaseModal, { raffle, purchased: this.purchaseCounts[raffle.id] || 0, onPurchased: () => this.load() });
  }

  async load() {
    this.loading = true;
    try {
      const [raffles, counts] = await Promise.all([
        app.request({ method: 'GET', url: `${app.forum.attribute('apiUrl')}/guagualeList` }),
        app.request({ method: 'GET', url: `${app.forum.attribute('apiUrl')}/guagualePurchaseCount` }),
      ]);
      this.raffles = (raffles.data || []).map((resource) => ({ id: resource.id, ...resource.attributes }));
      this.purchaseCounts = Object.fromEntries((counts.data || []).map((resource) => [String(resource.attributes.gua_id), Number(resource.attributes.total_pruchase_count)]));
    } catch (error) {
      app.alerts.show({ type: 'error' }, this.errorMessage(error));
    } finally {
      this.loading = false;
      m.redraw();
    }
  }

  displayName() {
    return app.forum.attribute('guagualeDisplayName') || app.translator.trans('ziven-guaguale.forum.guaguale-display-name-default');
  }

  currency() {
    return app.forum.attribute('pointSystem.currency_name') || 'Points';
  }

  errorMessage(error) {
    return error?.response?.errors?.[0]?.detail || app.translator.trans('ziven-guaguale.forum.purchase-error');
  }
}
