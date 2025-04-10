document.addEventListener('DOMContentLoaded', () => {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const html = document.documentElement;
  
  // Check user's preference from localStorage
  if (localStorage.getItem('darkMode') === 'enabled' || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('darkMode'))) {
    html.classList.add('dark');
  }
  
  // Toggle dark mode on button click
  darkModeToggle.addEventListener('click', () => {
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('darkMode', 'disabled');
    } else {
      html.classList.add('dark');
      localStorage.setItem('darkMode', 'enabled');
    }
  });
}); 