try {
  require('./legacy');
} catch (error) {
  // The legacy management page is optional; keep Flarum 2 registration alive.
}
