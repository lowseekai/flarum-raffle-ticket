import app from 'flarum/admin/app';
import RaffleAdminPage from './components/RaffleAdminPage';

app.initializers.add('lowseekai/flarum-raffle-ticket', () => {
  const register = (extensionId) => app.registry
    .for(extensionId)
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

  // Flarum installations created from the original package use the legacy
  // extension id, while newer deployments use the package-derived id.
  register('lowseekai-raffle-ticket');
  register('ziven-guaguale');
});
