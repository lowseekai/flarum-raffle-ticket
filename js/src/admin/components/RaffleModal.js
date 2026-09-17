import app from 'flarum/admin/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';

export default class RaffleModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);

    const raffle = this.attrs.raffle;
    this.editing = Boolean(raffle);
    this.titleValue = raffle?.title || '';
    this.description = raffle?.desc || '';
    this.cost = raffle?.cost ?? 1;
    this.amount = raffle?.amount ?? 200;
    this.limit = raffle?.limit ?? 0;
    this.backgroundType = raffle?.image ? 'image' : 'color';
    this.color = raffle?.color || '';
    this.image = raffle?.image || '';
    this.prizes = this.editing ? this.parsePrizes(raffle.settings) : [];
    this.winPoints = 1;
    this.winAmount = 1;
  }

  className() {
    return 'RaffleModal Modal--large';
  }

  title() {
    return app.translator.trans(`ziven-guaguale.admin.${this.editing ? 'guaguale-edit' : 'guaguale-add'}`);
  }

  content() {
    const allocated = this.prizes.reduce((total, prize) => total + Number(prize.amount), 0);
    const losing = Math.max(0, Number(this.amount) - allocated);
    const chance = Number(this.amount) > 0 ? ((allocated / Number(this.amount)) * 100).toFixed(2) : '0.00';

    return (
      <div className="Modal-body">
        <form className="Form" onsubmit={(event) => this.onsubmit(event)}>
          {this.field('guaguale-item-title', <input required maxlength="255" className="FormControl" value={this.titleValue} oninput={(e) => (this.titleValue = e.target.value)} />)}
          {this.field('guaguale-item-desc', <textarea maxlength="255" className="FormControl" value={this.description} oninput={(e) => (this.description = e.target.value)} />)}

          <div className="RaffleModal-grid">
            {this.field('guaguale-item-cost', <input required type="number" min="0" step="1" className="FormControl" value={this.cost} oninput={(e) => (this.cost = e.target.value)} />)}
            {!this.editing && this.field('guaguale-item-amount', <input required type="number" min="1" step="1" className="FormControl" value={this.amount} oninput={(e) => (this.amount = e.target.value)} />)}
            {this.field('guaguale-item-limit', <input required type="number" min="0" step="1" className="FormControl" value={this.limit} oninput={(e) => (this.limit = e.target.value)} />, 'guaguale-item-limit-desc')}
          </div>

          <div className="Form-group">
            <label>{app.translator.trans('ziven-guaguale.admin.settings.guaguale-item-color-background')}</label>
            <div className="RaffleModal-background">
              <select className="FormControl" value={this.backgroundType} onchange={(e) => (this.backgroundType = e.target.value)}>
                <option value="color">{app.translator.trans('ziven-guaguale.admin.settings.guaguale-item-color')}</option>
                <option value="image">{app.translator.trans('ziven-guaguale.admin.settings.guaguale-item-background')}</option>
              </select>
              {this.backgroundType === 'color' ? (
                <input className="FormControl" maxlength="20" placeholder="#4f6f52" value={this.color} oninput={(e) => (this.color = e.target.value)} />
              ) : (
                <input className="FormControl" maxlength="255" placeholder="https://example.com/background.jpg" value={this.image} oninput={(e) => (this.image = e.target.value)} />
              )}
            </div>
          </div>

          {!this.editing && (
            <div className="Form-group">
              <label>{app.translator.trans('ziven-guaguale.admin.settings.guaguale-item-settings')}</label>
              <div className="helpText">
                {app.translator.trans('ziven-guaguale.admin.guaguale-data-win-chance', { winChance: chance })} ·{' '}
                {app.translator.trans('ziven-guaguale.admin.unallocated-tickets', { count: losing })}
              </div>
              <div className="RaffleModal-prizeInput">
                <input type="number" min="1" step="1" className="FormControl" aria-label={app.translator.trans('ziven-guaguale.admin.guaguale-data-win-price')} value={this.winPoints} oninput={(e) => (this.winPoints = e.target.value)} />
                <input type="number" min="1" step="1" className="FormControl" aria-label={app.translator.trans('ziven-guaguale.admin.guaguale-data-win-amount')} value={this.winAmount} oninput={(e) => (this.winAmount = e.target.value)} />
                <Button type="button" className="Button" icon="fas fa-plus" onclick={() => this.addPrize()}>
                  {app.translator.trans('ziven-guaguale.admin.guaguale-data-add')}
                </Button>
              </div>
              <div className="RaffleModal-prizes">
                {this.prizes.map((prize) => (
                  <span className="RaffleModal-prize" key={prize.points}>
                    {prize.points} × {prize.amount}
                    <button type="button" title={app.translator.trans('ziven-guaguale.admin.guaguale-data-remove')} onclick={() => this.removePrize(prize.points)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="Form-group Form-controls">
            <Button type="submit" className="Button Button--primary" icon="fas fa-save" loading={this.loading} disabled={this.loading}>
              {app.translator.trans(`ziven-guaguale.admin.guaguale-data-${this.editing ? 'update' : 'add'}`)}
            </Button>
            <Button type="button" className="Button" onclick={() => this.hide()}>
              {app.translator.trans('ziven-guaguale.admin.guaguale-data-cancel')}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  field(key, control, helpKey = null) {
    return (
      <div className="Form-group">
        <label>{app.translator.trans(`ziven-guaguale.admin.settings.${key}`)}</label>
        {helpKey && <div className="helpText">{app.translator.trans(`ziven-guaguale.admin.settings.${helpKey}`)}</div>}
        {control}
      </div>
    );
  }

  parsePrizes(settings) {
    try {
      const ratio = JSON.parse(settings || '{}').ratio || {};
      return Object.entries(ratio).filter(([points]) => Number(points) > 0).map(([points, amount]) => ({ points: Number(points), amount: Number(amount) }));
    } catch (error) {
      return [];
    }
  }

  addPrize() {
    const points = Number(this.winPoints);
    const amount = Number(this.winAmount);
    if (!Number.isInteger(points) || points < 1 || !Number.isInteger(amount) || amount < 1) return;

    const existing = this.prizes.find((prize) => prize.points === points);
    if (existing) existing.amount = amount;
    else this.prizes.push({ points, amount });
  }

  removePrize(points) {
    this.prizes = this.prizes.filter((prize) => prize.points !== points);
  }

  async onsubmit(event) {
    event.preventDefault();
    const amount = Number(this.amount);
    const allocated = this.prizes.reduce((total, prize) => total + prize.amount, 0);

    if (!this.editing && allocated > amount) {
      app.alerts.show({ type: 'error' }, app.translator.trans('ziven-guaguale.admin.guaguale-data-setting-invalid'));
      return;
    }

    const ratio = { 0: amount - allocated };
    this.prizes.forEach((prize) => (ratio[prize.points] = prize.amount));
    const attributes = {
      title: this.titleValue.trim(),
      desc: this.description.trim(),
      cost: Number(this.cost),
      limit: Number(this.limit),
      color: this.backgroundType === 'color' ? this.color.trim() || null : null,
      image: this.backgroundType === 'image' ? this.image.trim() || null : null,
    };

    if (!this.editing) {
      attributes.amount = amount;
      attributes.settings = JSON.stringify({ ratio });
    }

    this.loading = true;
    try {
      await app.request({
        method: this.editing ? 'PATCH' : 'POST',
        url: `${app.forum.attribute('apiUrl')}/guagualeList${this.editing ? `/${this.attrs.raffle.id}` : ''}`,
        body: { data: { attributes } },
      });
      this.hide();
      this.attrs.onSaved();
    } catch (error) {
      const message = error?.response?.errors?.[0]?.detail || app.translator.trans('ziven-guaguale.admin.guaguale-add-error');
      app.alerts.show({ type: 'error' }, message);
    } finally {
      this.loading = false;
      m.redraw();
    }
  }
}
