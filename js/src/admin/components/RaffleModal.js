import app from 'flarum/admin/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import Icon from 'flarum/common/components/Icon';

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
    this.backgroundType = raffle?.image ? 'background' : 'color';
    this.color = raffle?.color || '';
    this.image = raffle?.image || '';
    this.prizes = this.editing ? this.parsePrizes(raffle.settings) : [];
    this.winPoints = '';
    this.winAmount = '';
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
    const chance = Number(this.amount) > 0 ? this.precisionRound((allocated / Number(this.amount)) * 100, 2) : 0;

    return (
      <div className="Modal-body">
        <form className="Form" onsubmit={(event) => this.onsubmit(event)}>
          <div className="Form-group RaffleModal-form">
            {this.field('guaguale-item-title', <input required maxlength="255" className="FormControl" value={this.titleValue} oninput={(e) => (this.titleValue = e.target.value)} />)}
            {this.field('guaguale-item-desc', <textarea required maxlength="255" className="FormControl" value={this.description} oninput={(e) => (this.description = e.target.value)} />)}
            {this.field('guaguale-item-cost', <input required type="number" min="1" step="1" className="FormControl" value={this.cost} oninput={(e) => (this.cost = e.target.value)} />)}
            {this.field('guaguale-item-amount', <input required disabled={this.editing} type="number" min="1" step="1" className="FormControl" value={this.amount} oninput={(e) => (this.amount = e.target.value)} />)}
            {this.field('guaguale-item-limit', <input required type="number" min="0" step="1" className="FormControl" value={this.limit} oninput={(e) => (this.limit = e.target.value)} />)}

            <div className="GuaGuaLeSettingsLabel">{app.translator.trans('ziven-guaguale.admin.settings.guaguale-item-color-background')}</div>
            <div className="RaffleModal-background">
              <span className="Select">
                <select className="Select-input FormControl" value={this.backgroundType} onchange={(e) => (this.backgroundType = e.target.value)}>
                  <option value="background">{app.translator.trans('ziven-guaguale.admin.settings.guaguale-item-background')}</option>
                  <option value="color">{app.translator.trans('ziven-guaguale.admin.settings.guaguale-item-color')}</option>
                </select>
                <Icon name="fas fa-sort" className="Select-caret" />
              </span>
              {this.backgroundType === 'color' ? (
                <div className="GuaGuaLeColorAndBackground">
                  <input className="FormControl" maxlength="20" placeholder={app.translator.trans('ziven-guaguale.admin.settings.guaguale-item-color-placeholder')} value={this.color} oninput={(e) => (this.color = e.target.value)} />
                  <span className="RaffleModal-colorPreview" style={{ backgroundColor: this.color }} />
                </div>
              ) : (
                <div className="GuaGuaLeColorAndBackground">
                  <input className="FormControl" maxlength="255" placeholder={app.translator.trans('ziven-guaguale.admin.settings.guaguale-item-background-placeholder')} value={this.image} oninput={(e) => (this.image = e.target.value)} />
                </div>
              )}
            </div>

            <div className="GuaGuaLeSettingsLabel">
              {app.translator.trans('ziven-guaguale.admin.settings.guaguale-item-settings')}{' '}
              <span className="RaffleModal-winChance">{app.translator.trans('ziven-guaguale.admin.guaguale-data-win-chance', { winChance: chance })}</span>
            </div>
            {!this.editing && (
              <div className="RaffleModal-prizeSettings">
                <div className="RaffleModal-prizeInput">
                  <label>{app.translator.trans('ziven-guaguale.admin.guaguale-data-win-price')}</label>
                  <input type="number" min="1" step="1" className="FormControl" value={this.winPoints} oninput={(e) => (this.winPoints = e.target.value)} />
                  <label>{app.translator.trans('ziven-guaguale.admin.guaguale-data-win-amount')}</label>
                  <input type="number" min="1" step="1" className="FormControl" value={this.winAmount} oninput={(e) => (this.winAmount = e.target.value)} />
                  <Button type="button" className="Button Button--primary" onclick={() => this.addPrize()}>
                    {app.translator.trans('ziven-guaguale.admin.guaguale-data-add')}
                  </Button>
                </div>
                <div className="RaffleModal-prizes">
                  {this.prizeTag({ points: 0, amount: losing }, false)}
                  {this.prizes.map((prize) => this.prizeTag(prize, true))}
                </div>
              </div>
            )}
            {this.editing && <div className="RaffleModal-prizes">{this.editingPrizeTags()}</div>}
          </div>

          <div className="Form-group Form-controls RaffleModal-controls">
            <Button type="submit" className="Button Button--primary" loading={this.loading} disabled={this.loading}>
              {app.translator.trans(`ziven-guaguale.admin.guaguale-data-${this.editing ? 'update' : 'add'}`)}
            </Button>
            <Button type="button" className="Button guagualeButton--gray" onclick={() => this.hide()}>
              {app.translator.trans('ziven-guaguale.admin.guaguale-data-cancel')}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  field(key, control) {
    return [
      <div className="GuaGuaLeSettingsLabel">{app.translator.trans(`ziven-guaguale.admin.settings.${key}`)}</div>,
      control,
    ];
  }

  prizeTag(prize, removable) {
    return (
      <span className="RaffleModal-prize" key={prize.points}>
        {prize.points} {app.forum.attribute('pointSystem.currency_name') || 'Points'} x{prize.amount}
        {removable && <button type="button" aria-label={app.translator.trans('ziven-guaguale.admin.guaguale-data-remove')} onclick={() => this.removePrize(prize.points)}>x</button>}
      </span>
    );
  }

  editingPrizeTags() {
    return Object.entries(this.parseRatio(this.attrs.raffle.settings)).map(([points, amount]) => this.prizeTag({ points: Number(points), amount: Number(amount) }, false));
  }

  parseRatio(settings) {
    try { return JSON.parse(settings || '{}').ratio || {}; } catch (error) { return {}; }
  }

  parsePrizes(settings) {
    return Object.entries(this.parseRatio(settings)).filter(([points]) => Number(points) > 0).map(([points, amount]) => ({ points: Number(points), amount: Number(amount) }));
  }

  addPrize() {
    const points = Number(this.winPoints);
    const amount = Number(this.winAmount);
    if (!Number.isInteger(points) || points < 1 || !Number.isInteger(amount) || amount < 1) return;
    const existing = this.prizes.find((prize) => prize.points === points);
    if (existing) existing.amount = amount;
    else this.prizes.push({ points, amount });
    this.winPoints = '';
    this.winAmount = '';
  }

  removePrize(points) {
    this.prizes = this.prizes.filter((prize) => prize.points !== points);
  }

  precisionRound(value, precision) {
    const factor = 10 ** precision;
    return Math.round(value * factor) / factor;
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
      title: this.titleValue.trim(), desc: this.description.trim(), cost: Number(this.cost), limit: Number(this.limit),
      color: this.backgroundType === 'color' ? this.color.trim() || null : null,
      image: this.backgroundType === 'background' ? this.image.trim() || null : null,
    };
    if (!this.editing) {
      attributes.amount = amount;
      attributes.settings = JSON.stringify({ ratio });
    }

    this.loading = true;
    try {
      await app.request({ method: this.editing ? 'PATCH' : 'POST', url: `${app.forum.attribute('apiUrl')}/guagualeList${this.editing ? `/${this.attrs.raffle.id}` : ''}`, body: { data: { attributes } } });
      this.hide();
      this.attrs.onSaved();
    } catch (error) {
      app.alerts.show({ type: 'error' }, error?.response?.errors?.[0]?.detail || app.translator.trans('ziven-guaguale.admin.guaguale-add-error'));
    } finally {
      this.loading = false;
      m.redraw();
    }
  }
}
