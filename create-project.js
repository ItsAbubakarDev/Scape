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
    
    // Initialize date fields with current date
    const today = new Date().toISOString().substr(0, 10);
    document.getElementById('start-date').value = today;
    
    // Set end date default to 30 days from now
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    document.getElementById('end-date').value = thirtyDaysFromNow.toISOString().substr(0, 10);
    document.getElementById('task-deadline-1').value = thirtyDaysFromNow.toISOString().substr(0, 10);
    
    // Load team members
    loadTeamMembers();
    
    // Add event listeners
    document.getElementById('add-task-btn').addEventListener('click', addNewTask);
    document.getElementById('cancel-btn').addEventListener('click', function() {
        window.location.href = 'manager-dashboard.html';
    });
    document.getElementById('create-project-form').addEventListener('submit', handleFormSubmit);
});

// Sample team members data (for demo purposes)
// In a real app, this would come from your backend API
const teamMembers = [
    { id: 1, name: 'John Doe', role: 'Developer', avatar: 'https://via.placeholder.com/40' },
    { id: 2, name: 'Jane Smith', role: 'Designer', avatar: 'https://via.placeholder.com/40' },
    { id: 3, name: 'Robert Johnson', role: 'QA Tester', avatar: 'https://via.placeholder.com/40' },
    { id: 4, name: 'Lisa Brown', role: 'Developer', avatar: 'https://via.placeholder.com/40' },
    { id: 5, name: 'Michael Wilson', role: 'UI/UX Designer', avatar: 'https://via.placeholder.com/40' },
    { id: 6, name: 'Emily Davis', role: 'Business Analyst', avatar: 'https://via.placeholder.com/40' }
];

// Load team members into the selection container
function loadTeamMembers() {
    const container = document.getElementById('team-members-container');
    container.innerHTML = ''; // Clear loading message
    
    const template = document.getElementById('team-member-template');
    
    teamMembers.forEach(member => {
        const clone = template.content.cloneNode(true);
        
        const checkbox = clone.querySelector('.team-member-checkbox');
        checkbox.value = member.id;
        checkbox.id = `team-member-${member.id}`;
        checkbox.name = `teamMembers`;
        
        clone.querySelector('.team-member-avatar').src = member.avatar;
        clone.querySelector('.team-member-name').textContent = member.name;
        clone.querySelector('.team-member-role').textContent = member.role;
        
        container.appendChild(clone);
    });
    
    // Also populate the assignee dropdown for the first task
    populateAssigneeDropdown(document.getElementById('task-assignee-1'));
}

// Populate the assignee dropdown with team members
function populateAssigneeDropdown(selectElement) {
    // Clear existing options except the first one
    const firstOption = selectElement.options[0];
    selectElement.innerHTML = '';
    selectElement.appendChild(firstOption);
    
    // Add team members as options
    teamMembers.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = member.name;
        selectElement.appendChild(option);
    });
}

// Add a new task input section
function addNewTask() {
    const taskTemplate = document.getElementById('task-template');
    const tasksContainer = document.getElementById('tasks-container');
    const clone = taskTemplate.content.cloneNode(true);
    
    // Set unique IDs and names for form fields
    const taskCount = tasksContainer.querySelectorAll('.task-item').length;
    const newIndex = taskCount;
    
    const titleInput = clone.querySelector('.task-title');
    titleInput.id = `task-title-${newIndex + 1}`;
    titleInput.name = `tasks[${newIndex}][title]`;
    
    const prioritySelect = clone.querySelector('.task-priority');
    prioritySelect.id = `task-priority-${newIndex + 1}`;
    prioritySelect.name = `tasks[${newIndex}][priority]`;
    
    const assigneeSelect = clone.querySelector('.task-assignee');
    assigneeSelect.id = `task-assignee-${newIndex + 1}`;
    assigneeSelect.name = `tasks[${newIndex}][assignee]`;
    
    const deadlineInput = clone.querySelector('.task-deadline');
    deadlineInput.id = `task-deadline-${newIndex + 1}`;
    deadlineInput.name = `tasks[${newIndex}][deadline]`;
    
    const descriptionTextarea = clone.querySelector('.task-description');
    descriptionTextarea.id = `task-description-${newIndex + 1}`;
    descriptionTextarea.name = `tasks[${newIndex}][description]`;
    
    // Set default deadline (same as project end date)
    deadlineInput.value = document.getElementById('end-date').value;
    
    // Populate the assignee dropdown
    populateAssigneeDropdown(assigneeSelect);
    
    // Add remove button event listener
    clone.querySelector('.remove-task-btn').addEventListener('click', function(event) {
        const taskItem = event.target.closest('.task-item');
        tasksContainer.removeChild(taskItem);
    });
    
    tasksContainer.appendChild(clone);
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Collect form data
    const formData = new FormData(event.target);
    const projectData = {
        title: formData.get('title'),
        description: formData.get('description'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        priority: formData.get('priority'),
        teamMembers: Array.from(formData.getAll('teamMembers')),
        tasks: []
    };
    
    // Collect task data
    const taskElements = document.querySelectorAll('.task-item');
    taskElements.forEach((taskElement, index) => {
        let taskPrefix = `tasks[${index}]`;
        
        // For the first task, we use IDs
        if (index === 0) {
            projectData.tasks.push({
                title: document.getElementById('task-title-1').value,
                priority: document.getElementById('task-priority-1').value,
                assignee: document.getElementById('task-assignee-1').value,
                deadline: document.getElementById('task-deadline-1').value,
                description: document.getElementById('task-description-1').value
            });
        } else {
            // For dynamically added tasks, we use class names
            projectData.tasks.push({
                title: taskElement.querySelector('.task-title').value,
                priority: taskElement.querySelector('.task-priority').value,
                assignee: taskElement.querySelector('.task-assignee').value,
                deadline: taskElement.querySelector('.task-deadline').value,
                description: taskElement.querySelector('.task-description').value
            });
        }
    });
    
    // In a real app, you would send this data to your backend API
    console.log('Project Data:', projectData);
    
    // For demo purposes, save to sessionStorage
    const projects = JSON.parse(sessionStorage.getItem('projects') || '[]');
    projectData.id = projects.length + 1;
    projectData.status = 'pending';
    projectData.progress = 0;
    projectData.createdAt = new Date().toISOString();
    projects.push(projectData);
    sessionStorage.setItem('projects', JSON.stringify(projects));
    
    // Show success message
    alert('Project created successfully!');
    
    // Redirect back to dashboard
    window.location.href = 'manager-dashboard.html';
}