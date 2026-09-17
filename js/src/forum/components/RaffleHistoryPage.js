import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import Button from 'flarum/common/components/Button';
import LinkButton from 'flarum/common/components/LinkButton';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';

export default class RaffleHistoryPage extends Page {
  oninit(vnode) {
    super.oninit(vnode);
    this.items = [];
    this.summary = { costTotal: 0, winTotal: 0 };
    this.loading = true;
    this.opening = null;
    const title = app.translator.trans('ziven-guaguale.forum.guaguale-purchase-history');
    app.history.push('guaguale.history', title);
    app.setTitle(title);
    this.load();
  }

  view() {
    return (
      <div className="RaffleHistoryPage">
        <div className="container">
          <div className="RafflePage-toolbar">
            <h1>{app.translator.trans('ziven-guaguale.forum.guaguale-purchase-history')}</h1>
            <LinkButton href={app.route('guaguale')} icon="fas fa-ticket-alt" className="Button">
              {app.forum.attribute('guagualeDisplayName') || app.translator.trans('ziven-guaguale.forum.guaguale-display-name-default')}
            </LinkButton>
          </div>
          <div className="RaffleHistoryPage-summary">
            {app.translator.trans('ziven-guaguale.forum.guaguale-purchase-summary', { purchaseCostTotal: this.summary.costTotal, purchaseWinTotal: this.summary.winTotal })}
          </div>
          {this.loading ? <LoadingIndicator /> : this.items.length ? this.table() : <p>{app.translator.trans('ziven-guaguale.forum.guaguale-history-list-empty')}</p>}
        </div>
      </div>
    );
  }

  table() {
    return (
      <div className="RaffleHistoryPage-tableWrap">
        <table className="RaffleHistoryPage-table">
          <thead><tr><th>{app.translator.trans('ziven-guaguale.forum.guaguale-history-list-id')}</th><th>{app.translator.trans('ziven-guaguale.forum.guaguale-history-list-title')}</th><th>{app.translator.trans('ziven-guaguale.forum.guaguale-history-list-cost')}</th><th>{app.translator.trans('ziven-guaguale.forum.guaguale-history-list-count')}</th><th>{app.translator.trans('ziven-guaguale.forum.guaguale-history-list-assign-at')}</th><th>{app.translator.trans('ziven-guaguale.forum.guaguale-history-list-open-result')}</th></tr></thead>
          <tbody>{this.items.map((item) => <tr><td>#{item.id}</td><td>{item.title}</td><td>{item.pruchase_cost_total}</td><td>{item.pruchase_count}</td><td>{item.assigned_at}</td><td>{item.opened ? item.pruchase_win_total : <Button className="Button Button--small" loading={this.opening === item.id} onclick={() => this.scratch(item)}>{app.translator.trans('ziven-guaguale.forum.guaguale-scratch-it')}</Button>}</td></tr>)}</tbody>
        </table>
      </div>
    );
  }

  async load() {
    try {
      const [history, summary] = await Promise.all([
        app.request({ method: 'GET', url: `${app.forum.attribute('apiUrl')}/guagualePurchaseHistory` }),
        app.request({ method: 'GET', url: `${app.forum.attribute('apiUrl')}/guagualePurchaseHistorySummary` }),
      ]);
      this.items = (history.data || []).map((resource) => ({ id: resource.id, ...resource.attributes }));
      this.summary = summary.data?.[0]?.attributes || this.summary;
    } catch (error) {
      app.alerts.show({ type: 'error' }, error?.response?.errors?.[0]?.detail || app.translator.trans('ziven-guaguale.forum.purchase-error'));
    } finally {
      this.loading = false;
      m.redraw();
    }
  }

  async scratch(item) {
    this.opening = item.id;
    try {
      const response = await app.request({ method: 'PATCH', url: `${app.forum.attribute('apiUrl')}/guagualePurchase/${item.id}`, body: { data: { attributes: { guagualePurchaseID: Number(item.id) } } } });
      Object.assign(item, response.data?.[0]?.attributes || {});
      await this.load();
    } catch (error) {
      app.alerts.show({ type: 'error' }, error?.response?.errors?.[0]?.detail || app.translator.trans('ziven-guaguale.forum.guaguale-open-error'));
    } finally {
      this.opening = null;
      m.redraw();
    }
  }
}
