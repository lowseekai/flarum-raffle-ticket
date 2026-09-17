import app from 'flarum/admin/app';
import RaffleAdminPage from './components/RaffleAdminPage';

app.initializers.add('lowseekai/flarum-raffle-ticket', () => {
  const registry = app.registry.for('lowseekai-raffle-ticket');

  registry
    .registerPage(RaffleAdminPage)
    .registerSetting({
      setting: 'ziven-guaguale.guagualeDisplayName',
      type: 'text',
      label: app.translator.trans('ziven-guaguale.admin.settings.guaguale-display-name'),
      help: app.translator.trans('ziven-guaguale.admin.settings.guaguale-display-name-default'),
    })
    .registerSetting({
      setting: 'ziven-guaguale.guagualeTimezone',
      type: 'text',
      label: app.translator.trans('ziven-guaguale.admin.settings.guaguale-timezone'),
      help: app.translator.trans('ziven-guaguale.admin.settings.guaguale-timezone-help'),
    })
    .registerPermission(
      {
        icon: 'fas fa-ticket-alt',
        label: app.translator.trans('ziven-guaguale.admin.guaguale-allow-guaguale'),
        permission: 'ziven.zivenAllowGuaGuaLe',
      },
      'moderate'
    );
});
