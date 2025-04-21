document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
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
    
    // Load projects and team members from sessionStorage
    const projects = JSON.parse(sessionStorage.getItem('projects') || '[]');
    
    // Extract all unique team members from projects
    const teamMembers = extractTeamMembers(projects);
    
    // Update dashboard stats for team members
    updateTeamMemberStats(teamMembers, projects);
    
    // Render team members
    renderTeamMembers(teamMembers, projects);
    
    // Set up search functionality
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredMembers = teamMembers.filter(member => 
            member.name.toLowerCase().includes(searchTerm) || 
            member.role.toLowerCase().includes(searchTerm) ||
            member.email.toLowerCase().includes(searchTerm)
        );
        renderTeamMembers(filteredMembers, projects);
    });
    
    // Add event listeners for the "Add New Member" button
    document.getElementById('add-member-btn').addEventListener('click', function() {
        showAddMemberModal();
    });
    
    // If we have an empty state button, add listener to it
    const addFirstMemberBtn = document.getElementById('add-first-member-btn');
    if (addFirstMemberBtn) {
        addFirstMemberBtn.addEventListener('click', function() {
            showAddMemberModal();
        });
    }
});

// Extract unique team members from all projects
function extractTeamMembers(projects) {
    // Create a map to store unique team members by ID
    const memberMap = new Map();
    
    projects.forEach(project => {
        if (project.teamMembers && Array.isArray(project.teamMembers)) {
            project.teamMembers.forEach(member => {
                // If this is a new member or has more info than we already have
                if (!memberMap.has(member.id) || Object.keys(member).length > Object.keys(memberMap.get(member.id)).length) {
                    // Create a copy to avoid reference issues
                    const memberCopy = { ...member };
                    
                    // Initialize tracking properties if they don't exist
                    if (!memberCopy.projects) memberCopy.projects = [];
                    if (!memberCopy.projects.includes(project.id)) {
                        memberCopy.projects.push(project.id);
                    }
                    
                    memberMap.set(member.id, memberCopy);
                } else {
                    // Just add the project to existing member's projects list
                    const existingMember = memberMap.get(member.id);
                    if (!existingMember.projects.includes(project.id)) {
                        existingMember.projects.push(project.id);
                    }
                }
            });
        }
    });
    
    // If no team members were found in projects, create some sample data
    if (memberMap.size === 0) {
        const sampleMembers = createSampleTeamMembers();
        sampleMembers.forEach(member => {
            memberMap.set(member.id, member);
        });
    }
    
    // Calculate productivity and tasks for each member
    memberMap.forEach((member, id) => {
        member.tasks = countMemberTasks(member, projects);
        member.completedTasks = countMemberCompletedTasks(member, projects);
        member.productivity = calculateMemberProductivity(member);
    });
    
    return Array.from(memberMap.values());
}

// Create sample team members data for demonstration
function createSampleTeamMembers() {
    return [
        {
            id: 'tm1',
            name: 'Alex Johnson',
            role: 'Frontend Developer',
            email: 'alex@example.com',
            status: 'active',
            projects: ['p1', 'p2'],
            tasks: 12,
            completedTasks: 8,
            productivity: 67
        },
        {
            id: 'tm2',
            name: 'Samantha Lee',
            role: 'UX Designer',
            email: 'samantha@example.com',
            status: 'active',
            projects: ['p1', 'p3'],
            tasks: 15,
            completedTasks: 12,
            productivity: 80
        },
        {
            id: 'tm3',
            name: 'Miguel Rodriguez',
            role: 'Backend Developer',
            email: 'miguel@example.com',
            status: 'away',
            projects: ['p2'],
            tasks: 8,
            completedTasks: 5,
            productivity: 63
        },
        {
            id: 'tm4',
            name: 'Emma Wilson',
            role: 'Project Manager',
            email: 'emma@example.com',
            status: 'active',
            projects: ['p1', 'p2', 'p3'],
            tasks: 20,
            completedTasks: 18,
            productivity: 90
        }
    ];
}

// Count the tasks assigned to a team member across all projects
function countMemberTasks(member, projects) {
    let taskCount = 0;
    
    projects.forEach(project => {
        if (project.tasks && Array.isArray(project.tasks)) {
            project.tasks.forEach(task => {
                if (task.assignedTo === member.id) {
                    taskCount++;
                }
            });
        }
    });
    
    return taskCount || member.tasks || Math.floor(Math.random() * 15) + 5; // Return existing value or random number if no tasks found
}

// Count the completed tasks for a team member
function countMemberCompletedTasks(member, projects) {
    let completedCount = 0;
    
    projects.forEach(project => {
        if (project.tasks && Array.isArray(project.tasks)) {
            project.tasks.forEach(task => {
                if (task.assignedTo === member.id && task.status === 'completed') {
                    completedCount++;
                }
            });
        }
    });
    
    return completedCount || member.completedTasks || Math.floor(Math.random() * member.tasks); // Return existing value or random number if no completed tasks found
}

// Calculate productivity percentage for a team member
function calculateMemberProductivity(member) {
    if (!member.tasks || member.tasks === 0) {
        return member.productivity || Math.floor(Math.random() * 30) + 60; // Return existing or random productivity between 60-90%
    }
    
    return Math.round((member.completedTasks / member.tasks) * 100);
}

// Update dashboard statistics for team members
function updateTeamMemberStats(teamMembers, projects) {
    document.getElementById('total-members').textContent = teamMembers.length;
    
    const activeMembers = teamMembers.filter(m => m.status === 'active').length;
    document.getElementById('active-members').textContent = activeMembers;
    
    // Calculate average productivity
    const totalProductivity = teamMembers.reduce((sum, member) => sum + member.productivity, 0);
    const avgProductivity = teamMembers.length > 0 ? Math.round(totalProductivity / teamMembers.length) : 0;
    document.getElementById('avg-productivity').textContent = `${avgProductivity}%`;
    
    // Get count of projects that have team members
    const projectsWithMembers = new Set();
    teamMembers.forEach(member => {
        if (member.projects && Array.isArray(member.projects)) {
            member.projects.forEach(projectId => projectsWithMembers.add(projectId));
        }
    });
    
    document.getElementById('projects-involved').textContent = projectsWithMembers.size;
}

// Render team members to the container
function renderTeamMembers(teamMembers, projects) {
    const membersContainer = document.getElementById('members-container');
    membersContainer.innerHTML = '';
    
    if (teamMembers.length === 0) {
        // Show empty state
        const template = document.getElementById('empty-state-template');
        const clone = template.content.cloneNode(true);
        membersContainer.appendChild(clone);
        
        // Add event listener to the add button in empty state
        const addFirstMemberBtn = document.getElementById('add-first-member-btn');
        if (addFirstMemberBtn) {
            addFirstMemberBtn.addEventListener('click', function() {
                showAddMemberModal();
            });
        }
    } else {
        // Show member cards
        const template = document.getElementById('member-card-template');
        
        teamMembers.forEach(member => {
            const clone = template.content.cloneNode(true);
            
            // Set member data
            clone.querySelector('.member-name').textContent = member.name;
            clone.querySelector('.member-role').textContent = member.role;
            clone.querySelector('.member-email').textContent = member.email;
            
            // Set member status
            const statusElement = clone.querySelector('.member-status');
            const status = member.status || 'offline';
            statusElement.textContent = capitalizeFirstLetter(status);
            statusElement.classList.add(`status-${status}`);
            
            // Set member stats
            clone.querySelector('.projects-count').textContent = member.projects ? member.projects.length : 0;
            clone.querySelector('.tasks-count').textContent = member.tasks || 0;
            clone.querySelector('.completed-count').textContent = member.completedTasks || 0;
            
            // Set productivity
            const productivity = member.productivity || 0;
            clone.querySelector('.progress-percentage').textContent = `${productivity}%`;
            clone.querySelector('.progress-fill').style.width = `${productivity}%`;
            
            // Set color based on productivity
            const progressFill = clone.querySelector('.progress-fill');
            if (productivity < 40) {
                progressFill.style.backgroundColor = '#ff4d4d'; // Red for low productivity
            } else if (productivity < 70) {
                progressFill.style.backgroundColor = '#ffaa00'; // Orange for medium productivity
            } else {
                progressFill.style.backgroundColor = '#00cc66'; // Green for high productivity
            }
            
            // Add project badges
            const projectBadgesContainer = clone.querySelector('.project-badges');
            
            if (member.projects && member.projects.length > 0) {
                member.projects.forEach(projectId => {
                    const project = projects.find(p => p.id === projectId);
                    if (project) {
                        const badge = document.createElement('span');
                        badge.className = 'project-badge';
                        badge.textContent = project.title;
                        projectBadgesContainer.appendChild(badge);
                    }
                });
            } else {
                const noBadge = document.createElement('span');
                noBadge.className = 'project-badge';
                noBadge.textContent = 'No projects';
                noBadge.style.backgroundColor = '#edf2f7';
                noBadge.style.color = '#718096';
                projectBadgesContainer.appendChild(noBadge);
            }
            
            // Add event listeners to buttons
            clone.querySelector('.view-btn').addEventListener('click', function() {
                viewMemberProfile(member.id);
            });
            
            clone.querySelector('.edit-btn').addEventListener('click', function() {
                editMember(member.id);
            });
            
            membersContainer.appendChild(clone);
        });
    }
}

// Show the add member modal (placeholder function)
function showAddMemberModal() {
    alert("Add team member functionality would open a modal here in a real application.");
    // In a real application, this would show a modal dialog for adding a new team member
}

// View member profile (placeholder function)
function viewMemberProfile(memberId) {
    alert(`Viewing profile for team member ID: ${memberId}`);
    // In a real app, this would navigate to a member profile page or show a detailed modal
}

// Edit member information (placeholder function)
function editMember(memberId) {
    alert(`Edit team member with ID: ${memberId}`);
    // In a real app, this would open an edit form or modal
}

// Helper function to capitalize the first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}