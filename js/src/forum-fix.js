import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import IndexSidebar from 'flarum/forum/components/IndexSidebar';
import UserPage from 'flarum/forum/components/UserPage';
import LinkButton from 'flarum/common/components/LinkButton';
import RafflePage from './forum/components/RafflePage';
import RaffleHistoryPage from './forum/components/RaffleHistoryPage';
import UserRaffleHistoryPage from './forum/components/UserRaffleHistoryPage';

app.initializers.add('lowseekai/flarum-raffle-ticket', () => {
  app.routes.guaguale = { path: '/guaguale', component: RafflePage };
  app.routes['guaguale.history'] = { path: '/guaguale/history', component: RaffleHistoryPage };
  app.routes['user.guagualePurchaseHistory'] = {
    path: '/u/:username/guagualePurchaseHistory',
    component: UserRaffleHistoryPage,
  };

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

  extend(UserPage.prototype, 'navItems', function (items) {
    const user = this.user;
    const currentUser = app.session.user;

    if (!app.forum.attribute('zivenAllowGuaGuaLe') || !user || !currentUser || user.id() !== currentUser.id()) return;

    items.add(
      'guagualePurchaseHistory',
      <LinkButton href={app.route('user.guagualePurchaseHistory', { username: user.slug() })} icon="fas fa-ticket-alt">
        {app.translator.trans('ziven-guaguale.forum.guaguale-purchase-history')}
      </LinkButton>,
      85
    );
  });
});
