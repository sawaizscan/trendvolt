(function() {
  const theme = localStorage.getItem('tv-theme') || 'dark';
  document.documentElement.classList.toggle('dark', theme === 'dark');

  document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function() {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('tv-theme', isDark ? 'dark' : 'light');
    });
  });
})();
