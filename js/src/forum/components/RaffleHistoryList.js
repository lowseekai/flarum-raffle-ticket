import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import LinkButton from 'flarum/common/components/LinkButton';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import PurchaseModal from './PurchaseModal';

export default class RaffleHistoryList extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    this.items = [];
    this.summary = { costTotal: 0, winTotal: 0 };
    this.loading = true;
    this.loadingMore = false;
    this.hasMore = false;
    this.load(0, false);
  }

  view() {
    return (
      <section className="RaffleHistoryList">
        <div className="RaffleHistoryList-header">
          <h2>{app.translator.trans('ziven-guaguale.forum.guaguale-purchase-history')}</h2>
          <LinkButton href={app.route('guaguale')} icon="fas fa-ticket-alt" className="Button Button--primary">
            {app.translator.trans('ziven-guaguale.forum.guaguale-purchase-now')}
          </LinkButton>
        </div>
        <div className="RaffleHistoryPage-summary">
          {app.translator.trans('ziven-guaguale.forum.guaguale-purchase-summary', {
            purchaseCostTotal: this.summary.costTotal,
            purchaseWinTotal: this.summary.winTotal,
          })}
        </div>
        {this.loading ? <LoadingIndicator /> : this.items.length ? this.list() : <p className="helpText">{app.translator.trans('ziven-guaguale.forum.guaguale-history-list-empty')}</p>}
        {!this.loading && this.hasMore && (
          <div className="RaffleHistoryList-loadMore">
            <Button className="Button Button--primary" loading={this.loadingMore} onclick={() => this.load(this.items.length, true)}>
              {app.translator.trans('ziven-guaguale.forum.guaguale-history-list-load-more')}
            </Button>
          </div>
        )}
      </section>
    );
  }

  list() {
    return (
      <ul className="RaffleHistoryList-items">
        {this.items.map((item) => (
          <li key={item.id} className="guagualeHistoryContainer">
            <div className="RaffleHistoryList-primary">
              <strong>#{item.id}</strong>
              <span>{item.title}</span>
            </div>
            <div className="RaffleHistoryList-meta">
              <span>{app.translator.trans('ziven-guaguale.forum.guaguale-history-entry-count', { count: item.pruchase_count })}</span>
              <span>{app.translator.trans('ziven-guaguale.forum.guaguale-history-entry-cost', { cost: item.pruchase_cost_total, currency: this.currency() })}</span>
              <span>{app.translator.trans('ziven-guaguale.forum.guaguale-history-entry-time', { time: item.assigned_at })}</span>
            </div>
            <div className="RaffleHistoryList-result">
              {item.opened && <span>{app.translator.trans('ziven-guaguale.forum.guaguale-history-entry-win', { win: item.pruchase_win_total, currency: this.currency() })}</span>}
              {!item.opened && <span>{app.translator.trans('ziven-guaguale.forum.guaguale-purchase-not-scratch-yet')}</span>}
              <Button className="Button Button--link GuaGuaLeButton--transparent" onclick={() => this.showResult(item)}>
                {app.translator.trans(item.opened ? 'ziven-guaguale.forum.guaguale-purchase-view-result' : 'ziven-guaguale.forum.guaguale-scratch-it')}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  showResult(item) {
    app.modal.show(PurchaseModal, {
      purchase: item,
      onOpened: (purchase) => {
        Object.assign(item, purchase);
        this.load(0, false);
      },
    });
  }

  async load(offset = 0, append = false) {
    if (append) this.loadingMore = true;
    else this.loading = true;

    try {
      const requests = [
        app.request({ method: 'GET', url: `${app.forum.attribute('apiUrl')}/guagualePurchaseHistory?page[offset]=${offset}&page[limit]=20` }),
      ];

      if (!append) {
        requests.push(app.request({ method: 'GET', url: `${app.forum.attribute('apiUrl')}/guagualePurchaseHistorySummary` }));
      }

      const [history, summary] = await Promise.all(requests);
      const nextItems = (history.data || []).map((resource) => ({ id: resource.id, ...resource.attributes }));
      this.items = append ? [...this.items, ...nextItems] : nextItems;
      this.hasMore = Boolean(history.meta?.page?.hasMore || history.links?.next);
      if (summary) this.summary = summary.data?.[0]?.attributes || this.summary;
    } catch (error) {
      app.alerts.show({ type: 'error' }, error?.response?.errors?.[0]?.detail || app.translator.trans('ziven-guaguale.forum.purchase-error'));
    } finally {
      this.loading = false;
      this.loadingMore = false;
      m.redraw();
    }
  }

  currency() {
    return app.forum.attribute('pointSystem.currency_name') || 'Points';
  }
}
