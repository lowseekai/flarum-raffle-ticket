import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  new Extend.Admin()
    .setting(() => ({
      setting: 'ziven-guaguale.guagualeDisplayName',
      type: 'text',
      label: app.translator.trans('ziven-guaguale.admin.settings.guaguale-display-name'),
      help: app.translator.trans('ziven-guaguale.admin.settings.guaguale-display-name-default'),
    }))
    .setting(() => ({
      setting: 'ziven-guaguale.guagualeTimezone',
      type: 'text',
      label: app.translator.trans('ziven-guaguale.admin.settings.guaguale-timezone'),
      help: app.translator.trans('ziven-guaguale.admin.settings.guaguale-timezone-help'),
    }))
    .permission(
      () => ({
        icon: 'fas fa-ticket-alt',
        label: app.translator.trans('ziven-guaguale.admin.guaguale-allow-guaguale'),
        permission: 'ziven.zivenAllowGuaGuaLe',
      }),
      'moderate'
    ),
];
