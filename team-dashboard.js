document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Check if user role is team member
    if (currentUser.role !== 'team_member') {
        // Redirect to appropriate dashboard based on role
        if (currentUser.role === 'manager') {
            window.location.href = 'manager-dashboard.html';
        } else {
            window.location.href = 'login.html';
        }
        return;
    }
    
    // Update user info in sidebar
    document.getElementById('user-name').textContent = currentUser.name || 'Team Member';
    document.getElementById('user-role').textContent = 'Team Member';
    
    // Set current date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = new Date().toLocaleDateString(undefined, dateOptions);
    
    // Load all data
    loadUserData(currentUser.id);
    
    // Set up search functionality
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterTasks(searchTerm);
    });
    
    // Set up filter buttons functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Apply filter
            const filter = this.getAttribute('data-filter');
            filterTasksByStatus(filter);
        });
    });
    
    // Set up sort functionality
    document.getElementById('sort-tasks').addEventListener('change', function() {
        sortTasks(this.value);
    });
});

// Load user data (projects and tasks)
function loadUserData(userId) {
    // Load projects from sessionStorage
    const allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    
    // Filter projects for this user
    const userProjects = allProjects.filter(project => {
        return project.teamMembers && project.teamMembers.includes(userId);
    });
    
    // Load tasks from all projects for this user
    const userTasks = [];
    userProjects.forEach(project => {
        if (project.tasks) {
            project.tasks.forEach(task => {
                if (task.assignedTo === userId) {
                    // Add project info to task
                    userTasks.push({
                        ...task,
                        projectId: project.id,
                        projectTitle: project.title
                    });
                }
            });
        }
    });
    
    // Update dashboard stats
    updateDashboardStats(userProjects, userTasks);
    
    // Render projects and tasks
    renderProjects(userProjects);
    renderTasks(userTasks);
    
    // Store tasks in session storage for filtering later
    localStorage.setItem('userTasks', JSON.stringify(userTasks));
}

// Update dashboard statistics
function updateDashboardStats(projects, tasks) {
    document.getElementById('total-projects').textContent = projects.length;
    document.getElementById('total-tasks').textContent = tasks.length;
    
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    document.getElementById('in-progress-tasks').textContent = inProgressTasks;
    
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    document.getElementById('completed-tasks').textContent = completedTasks;
}

// Render projects to the container
function renderProjects(projects) {
    const projectsContainer = document.getElementById('projects-container');
}

