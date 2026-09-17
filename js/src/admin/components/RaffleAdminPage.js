import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import RaffleModal from './RaffleModal';

export default class RaffleAdminPage extends ExtensionPage {
  oninit(vnode) {
    super.oninit(vnode);
    this.raffles = [];
    this.loadingRaffles = true;
    this.savingRaffle = null;
    this.loadRaffles();
  }

  content(vnode) {
    return [super.content(vnode), this.managementContent()];
  }

  managementContent() {
    return (
      <div className="ExtensionPage-settings RaffleAdmin">
        <div className="container">
          <div className="RaffleAdmin-heading">
            <h3>{app.translator.trans('ziven-guaguale.admin.management-title')}</h3>
            <Button className="Button Button--primary" icon="fas fa-plus" onclick={() => this.openModal()}>
              {app.translator.trans('ziven-guaguale.admin.guaguale-add')}
            </Button>
          </div>

          {this.loadingRaffles ? (
            <LoadingIndicator />
          ) : this.raffles.length ? (
            <div className="RaffleAdmin-list">{this.raffles.map((raffle) => this.raffleRow(raffle))}</div>
          ) : (
            <p className="helpText">{app.translator.trans('ziven-guaguale.admin.management-empty')}</p>
          )}
        </div>
      </div>
    );
  }

  raffleRow(raffle) {
    const busy = this.savingRaffle === raffle.id;

    return (
      <div className={`RaffleAdmin-item ${raffle.activated ? '' : 'is-inactive'}`} key={raffle.id}>
        <div className="RaffleAdmin-preview" style={this.previewStyle(raffle)} />
        <div className="RaffleAdmin-details">
          <div className="RaffleAdmin-titleLine">
            <strong>{raffle.title}</strong>
            <span className={`RaffleAdmin-status ${raffle.activated ? 'is-active' : ''}`}>
              {app.translator.trans(
                `ziven-guaguale.admin.settings.${raffle.activated ? 'guaguale-item-activated' : 'guaguale-item-deactivated'}`
              )}
            </span>
          </div>
          {raffle.desc && <p>{raffle.desc}</p>}
          <div className="RaffleAdmin-meta">
            <span>#{raffle.id}</span>
            <span>{app.translator.trans('ziven-guaguale.admin.settings.guaguale-item-cost')}: {raffle.cost}</span>
            <span>{app.translator.trans('ziven-guaguale.admin.settings.guaguale-item-amount')}: {raffle.amount}</span>
            <span>{app.translator.trans('ziven-guaguale.admin.settings.guaguale-item-purchased')}: {raffle.purchased}</span>
            <span>
              {app.translator.trans('ziven-guaguale.admin.settings.guaguale-item-limit')}:{' '}
              {raffle.limit || app.translator.trans('ziven-guaguale.admin.settings.guaguale-item-unlimited')}
            </span>
          </div>
        </div>
        <div className="RaffleAdmin-actions">
          <Button className="Button" icon="fas fa-pen" disabled={busy} onclick={() => this.openModal(raffle)}>
            {app.translator.trans('ziven-guaguale.admin.settings.guaguale-item-edit')}
          </Button>
          {raffle.activated && (
            <Button className="Button Button--danger" icon="fas fa-trash" loading={busy} onclick={() => this.deactivate(raffle)}>
              {app.translator.trans('ziven-guaguale.admin.settings.guaguale-item-delete')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  previewStyle(raffle) {
    if (raffle.image) {
      return { backgroundImage: `url(${raffle.image})` };
    }

    return { backgroundColor: raffle.color || '#4f6f52' };
  }

  apiUrl(path) {
    return `${app.forum.attribute('apiUrl')}${path}`;
  }

  async loadRaffles() {
    this.loadingRaffles = true;

    try {
      const response = await app.request({ method: 'GET', url: this.apiUrl('/guagualeList?includeInactive=1') });
      this.raffles = (response.data || []).map((resource) => ({ id: resource.id, ...resource.attributes }));
    } catch (error) {
      this.showError(error);
    } finally {
      this.loadingRaffles = false;
      m.redraw();
    }
  }

  openModal(raffle = null) {
    app.modal.show(RaffleModal, {
      raffle,
      onSaved: () => this.loadRaffles(),
    });
  }

  async deactivate(raffle) {
    if (!confirm(app.translator.trans('ziven-guaguale.admin.settings.guaguale-item-delete-confirmation'))) return;

    this.savingRaffle = raffle.id;
    try {
      await app.request({
        method: 'PATCH',
        url: this.apiUrl(`/guagualeList/${raffle.id}`),
        body: { data: { attributes: { activated: false } } },
      });
      await this.loadRaffles();
    } catch (error) {
      this.showError(error);
    } finally {
      this.savingRaffle = null;
      m.redraw();
    }
  }

  showError(error) {
    const message = error?.response?.errors?.[0]?.detail || app.translator.trans('ziven-guaguale.admin.management-load-error');
    app.alerts.show({ type: 'error' }, message);
  }
}
