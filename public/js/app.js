// Main App Module
const DashboardModule = (() => {
  // Handle sidebar for mobile
  const handleMobileNavigation = () => {
    const dashboardSidebar = document.querySelector('.dashboard-sidebar');
    const dashboardContent = document.querySelector('.dashboard-content');
    const hamburgerBtn = document.createElement('button');
    
    // Create hamburger button for mobile
    hamburgerBtn.className = 'btn-icon mobile-menu-toggle';
    hamburgerBtn.innerHTML = '<i class="fas fa-bars"></i>';
    
    // Only add on mobile screens
    if (window.innerWidth <= 768) {
      // Add to header if not already there
      if (!document.querySelector('.mobile-menu-toggle')) {
        const logo = document.querySelector('.logo');
        logo.prepend(hamburgerBtn);
      }
      
      // Toggle sidebar
      hamburgerBtn.addEventListener('click', () => {
        const isExpanded = dashboardSidebar.classList.toggle('expanded');
        if (isExpanded) {
          dashboardSidebar.style.width = '250px';
          hamburgerBtn.innerHTML = '<i class="fas fa-times"></i>';
        } else {
          dashboardSidebar.style.width = '60px';
          hamburgerBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
      });
      
      // Close sidebar when clicking on content area
      dashboardContent.addEventListener('click', () => {
        if (dashboardSidebar.classList.contains('expanded')) {
          dashboardSidebar.classList.remove('expanded');
          dashboardSidebar.style.width = '60px';
          hamburgerBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
      });
    }
  };
  
  // Handle touch events
  const handleTouchEvents = () => {
    // Add active states for touch devices
    document.querySelectorAll('.btn, .btn-icon, a').forEach(element => {
      element.addEventListener('touchstart', function() {
        this.classList.add('touch-active');
      });
      
      element.addEventListener('touchend', function() {
        this.classList.remove('touch-active');
      });
    });
  };
  
  // Initialize the dashboard
  const init = () => {
    // Initialize UI module
    if (typeof UIModule !== 'undefined') {
      UIModule.init();
    }
    
    // Handle mobile navigation
    handleMobileNavigation();
    
    // Add touch events
    handleTouchEvents();
    
    // Re-initialize on resize
    window.addEventListener('resize', handleMobileNavigation);
  };
  
  // Public API
  return {
    init
  };
})();

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Auth module first
  if (typeof AuthModule !== 'undefined') {
    AuthModule.init();
  }
}); 