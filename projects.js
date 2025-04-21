document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Update user info in sidebar
    document.getElementById('user-name').textContent = currentUser.name || 'Manager';
    
    // Set current date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = new Date().toLocaleDateString(undefined, dateOptions);
    
    // Load projects from sessionStorage
    let projects = JSON.parse(localStorage.getItem('projects') || '[]');
    
    // Initial rendering of projects
    renderProjects(projects);
    
    // Set up search functionality
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredProjects = projects.filter(project => 
            project.title.toLowerCase().includes(searchTerm) || 
            (project.description && project.description.toLowerCase().includes(searchTerm))
        );
        renderProjects(filteredProjects);
    });
    
    // Set up status filter functionality
    const statusFilter = document.getElementById('status-filter');
    statusFilter.addEventListener('change', function() {
        const selectedStatus = this.value;
        
        if (selectedStatus === 'all') {
            renderProjects(projects);
        } else {
            const filteredProjects = projects.filter(project => 
                project.status === selectedStatus
            );
            renderProjects(filteredProjects);
        }
    });
    
    // Add event listeners for the "Add New Project" button
    document.getElementById('add-project-btn').addEventListener('click', function() {
        window.location.href = 'create-project.html';
    });
    
    // If we have an empty state button, add listener to it
    const createFirstProjectBtn = document.getElementById('create-first-project-btn');
    if (createFirstProjectBtn) {
        createFirstProjectBtn.addEventListener('click', function() {
            window.location.href = 'create-project.html';
        });
    }
});

// Render projects to the container
function renderProjects(projects) {
    const projectsContainer = document.getElementById('projects-container');
    projectsContainer.innerHTML = '';
    
    if (projects.length === 0) {
        // Show empty state
        const template = document.getElementById('empty-state-template');
        const clone = template.content.cloneNode(true);
        projectsContainer.appendChild(clone);
        
        // Add event listener to the create button in empty state
        const createFirstProjectBtn = document.getElementById('create-first-project-btn');
        if (createFirstProjectBtn) {
            createFirstProjectBtn.addEventListener('click', function() {
                window.location.href = 'create-project.html';
            });
        }
    } else {
        // Show project cards
        const template = document.getElementById('project-card-template');
        
        projects.forEach(project => {
            const clone = template.content.cloneNode(true);
            
            // Set project data
            clone.querySelector('.project-title').textContent = project.title;
            
            // Format status from project data
            let status = project.status || 'pending';
            const statusElement = clone.querySelector('.project-status');
            statusElement.textContent = capitalizeFirstLetter(status);
            statusElement.classList.add(`status-${status}`);
            
            // Format the deadline display
            if (project.endDate) {
                const deadlineDate = new Date(project.endDate);
                const formattedDeadline = deadlineDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                });
                clone.querySelector('.deadline').textContent = formattedDeadline;
            } else {
                clone.querySelector('.deadline').textContent = 'No deadline set';
            }
            
            // Display task count
            const taskCount = project.tasks ? project.tasks.length : 0;
            const completedTasks = project.tasks ? project.tasks.filter(task => task.status === 'completed').length : 0;
            clone.querySelector('.tasks').textContent = `${completedTasks}/${taskCount} tasks`;
            
            // Display team member count
            const memberCount = project.teamMembers ? project.teamMembers.length : 0;
            clone.querySelector('.members').textContent = `${memberCount} members`;
            
            // Calculate and display progress
            const progress = project.progress || calculateProgress(project);
            clone.querySelector('.progress-percentage').textContent = `${progress}%`;
            clone.querySelector('.progress-fill').style.width = `${progress}%`;
            
            // Set color based on progress
            const progressFill = clone.querySelector('.progress-fill');
            if (progress < 25) {
                progressFill.style.backgroundColor = '#ff4d4d'; // Red for early stage
            } else if (progress < 75) {
                progressFill.style.backgroundColor = '#ffaa00'; // Orange for mid progress
            } else {
                progressFill.style.backgroundColor = '#00cc66'; // Green for near completion
            }
            
            // Add event listeners to buttons
            clone.querySelector('.view-btn').addEventListener('click', function() {
                viewProject(project.id);
            });
            
            clone.querySelector('.edit-btn').addEventListener('click', function() {
                editProject(project.id);
            });
            
            projectsContainer.appendChild(clone);
        });
    }
}

// Calculate project progress based on task status
function calculateProgress(project) {
    if (!project.tasks || project.tasks.length === 0) {
        return 0;
    }
    
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
}

// View project details
function viewProject(projectId) {
    // In a real app, you would navigate to a project details page
    window.location.href = `project-details.html?id=${projectId}`;
}

// Edit project
function editProject(projectId) {
    // Navigate to the project edit page with the project ID
    window.location.href = `edit-project.html?id=${projectId}`;
}

// Helper function to capitalize the first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}