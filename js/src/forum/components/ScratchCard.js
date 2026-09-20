import Component from 'flarum/common/Component';
import app from 'flarum/forum/app';

export default class ScratchCard extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    this.drawing = false;
    this.opening = false;
    this.revealed = false;
    this.handlers = [];
  }

  view() {
    const purchase = this.attrs.purchase;
    const result = this.parseResult(purchase?.pruchase_result);
    const opened = Boolean(purchase?.opened || this.revealed);

    return (
      <div className={`GuaGuaLeScratchCard ${opened ? 'is-opened' : ''}`} oncreate={(vnode) => this.mount(vnode.dom)} onupdate={(vnode) => this.sync(vnode.dom)}>
        <div className="GuaGuaLeScratchCard-result" aria-live="polite">
          <div className="GuaGuaLeScratchCard-total">
            {app.translator.trans('ziven-guaguale.forum.guaguale-scratch-result', { money: purchase?.pruchase_win_total || 0 })}
          </div>
          <div className="GuaGuaLeScratchCard-prizes">
            {Object.entries(result).map(([value, count]) => (
              <span key={`${value}-${count}`}>{value} {this.currency()} x{count}</span>
            ))}
          </div>
        </div>
        {!opened && <canvas className="GuaGuaLeScratchCard-canvas" width="315" height="105" aria-label={app.translator.trans('ziven-guaguale.forum.guaguale-scratch-it')} />}
      </div>
    );
  }

  mount(dom) {
    this.sync(dom);
  }

  sync(dom) {
    const canvas = dom.querySelector('canvas');
    if (!canvas || this.canvas === canvas) return;

    this.canvas = canvas;
    this.context = canvas.getContext('2d', { willReadFrequently: true });
    this.context.globalCompositeOperation = 'source-over';
    this.context.fillStyle = '#aeb7c4';
    this.context.fillRect(0, 0, canvas.width, canvas.height);
    this.context.fillStyle = 'rgba(255, 255, 255, .72)';
    this.context.font = 'bold 18px sans-serif';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillText(
      app.translator.trans('ziven-guaguale.forum.guaguale-scratch-hint'),
      canvas.width / 2,
      canvas.height / 2
    );

    const start = (event) => {
      if (this.opening) return;
      this.drawing = true;
      canvas.setPointerCapture?.(event.pointerId);
      this.erase(event);
      event.preventDefault();
    };
    const move = (event) => {
      if (!this.drawing || this.opening) return;
      this.erase(event);
      event.preventDefault();
    };
    const end = () => {
      this.drawing = false;
    };

    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    this.handlers = [
      ['pointerdown', start],
      ['pointermove', move],
      ['pointerup', end],
      ['pointercancel', end],
    ];
  }

  onremove() {
    if (!this.canvas) return;
    this.handlers.forEach(([event, handler]) => this.canvas.removeEventListener(event, handler));
  }

  erase(event) {
    if (!this.context || !this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    this.context.save();
    this.context.globalCompositeOperation = 'destination-out';
    this.context.beginPath();
    this.context.arc(x, y, 17, 0, Math.PI * 2);
    this.context.fill();
    this.context.restore();

    const image = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    let transparent = 0;
    let sampled = 0;
    for (let i = 3; i < image.data.length; i += 4 * 8) {
      sampled += 1;
      if (image.data[i] < 32) transparent += 1;
    }

    if (sampled && transparent / sampled >= 0.38) {
      this.opening = true;
      Promise.resolve(this.attrs.onScratch?.()).catch(() => {
        this.opening = false;
        this.drawing = false;
      });
    }
  }

  parseResult(value) {
    try {
      const parsed = JSON.parse(value || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  currency() {
    return app.forum.attribute('pointSystem.currency_name') || 'Points';
  }
}
