import app from 'flarum/forum/app';

app.initializers.add('lowseekai/flarum-raffle-ticket-permission-fallback', () => {
  const user = app.session.user;
  const attributes = app.forum.data.attributes;

  if (attributes.zivenAllowGuaGuaLe === undefined) {
    attributes.zivenAllowGuaGuaLe = Boolean(user && user.can('ziven.zivenAllowGuaGuaLe'));
  }
});
