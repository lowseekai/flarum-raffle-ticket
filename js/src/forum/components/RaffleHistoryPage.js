import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import LinkButton from 'flarum/common/components/LinkButton';
import RaffleHistoryList from './RaffleHistoryList';

export default class RaffleHistoryPage extends Page {
  oninit(vnode) {
    super.oninit(vnode);
    const title = app.translator.trans('ziven-guaguale.forum.guaguale-purchase-history');
    app.history.push('guaguale.history', title);
    app.setTitle(title);
  }

  view() {
    return (
      <div className="RaffleHistoryPage">
        <div className="container">
          <div className="RafflePage-toolbar">
            <LinkButton href={app.route('guaguale')} icon="fas fa-arrow-left" className="Button Button--link">
              {app.translator.trans('ziven-guaguale.forum.guaguale-display-name-default')}
            </LinkButton>
          </div>
          <RaffleHistoryList />
        </div>
      </div>
    );
  }
}
