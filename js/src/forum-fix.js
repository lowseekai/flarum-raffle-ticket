import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import IndexSidebar from 'flarum/forum/components/IndexSidebar';
import LinkButton from 'flarum/common/components/LinkButton';
import RafflePage from './forum/components/RafflePage';
import RaffleHistoryPage from './forum/components/RaffleHistoryPage';

app.initializers.add('lowseekai/flarum-raffle-ticket', () => {
  app.routes.guaguale = { path: '/guaguale', component: RafflePage };
  app.routes['guaguale.history'] = { path: '/guaguale/history', component: RaffleHistoryPage };

  extend(IndexSidebar.prototype, 'navItems', function (items) {
    if (!app.forum.attribute('zivenAllowGuaGuaLe')) return;
    items.add(
      'guaguale',
      <LinkButton href={app.route('guaguale')} icon="fas fa-ticket-alt">
        {app.forum.attribute('guagualeDisplayName') || app.translator.trans('ziven-guaguale.forum.guaguale-display-name-default')}
      </LinkButton>,
      84
    );
  });
});
