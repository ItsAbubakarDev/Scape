document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const messageDiv = document.getElementById('message');
    const togglePasswordElements = document.querySelectorAll('.toggle-password');
    
    // Function to show message
    function showMessage(type, text) {
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        messageDiv.classList.remove('hidden');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    }
    
    // Store users in localStorage
    function saveUser(user) {
        // Get existing users or initialize empty array
        const users = JSON.parse(localStorage.getItem('collabSphereUsers') || '[]');
        
        // Check if user already exists
        const existingUser = users.find(u => u.email === user.email);
        if (existingUser) {
            return false; // User already exists
        }
        
        // Add new user
        users.push(user);
        
        // Save back to localStorage
        localStorage.setItem('collabSphereUsers', JSON.stringify(users));
        return true;
    }
    
    // Verify login credentials
    function verifyLogin(email, password) {
        const users = JSON.parse(localStorage.getItem('collabSphereUsers') || '[]');
        return users.find(user => user.email === email && user.password === password);
    }
    
    // Set up toggle password visibility
    togglePasswordElements.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            
            if (input.type === 'password') {
                input.type = 'text';
                this.textContent = 'Hide';
            } else {
                input.type = 'password';
                this.textContent = 'Show';
            }
        });
    });
    
    // Tab switching functions
    function switchToLogin() {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
    }
    
    function switchToSignup() {
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
    }
    
    // Event listeners for tab switching
    loginTab.addEventListener('click', switchToLogin);
    signupTab.addEventListener('click', switchToSignup);
    
    // Link event listeners
    if (showSignup) {
        showSignup.addEventListener('click', function(e) {
            e.preventDefault();
            switchToSignup();
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            switchToLogin();
        });
    }
    
    // Login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const role = document.querySelector('input[name="login-role"]:checked').value;
        
        const user = verifyLogin(email, password);
        
        if (user) {
            // Check if role matches
            if (user.role === role) {
                showMessage('success', `Successfully logged in as ${role}`);
                
                // Store login state
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                
                // Redirect after delay
                setTimeout(() => {
                    window.location.href = role === 'manager' ? 'manager-dashboard.html' : 'team-dashboard.html';
                }, 1500);
            } else {
                showMessage('error', `Invalid role selected. You registered as a ${user.role}.`);
            }
        } else {
            // For demo purposes, also check hardcoded credentials
            if (email === 'demo@collabsphere.com' && password === 'password123') {
                showMessage('success', `Successfully logged in as ${role}`);
                
                // Store login state
                sessionStorage.setItem('currentUser', JSON.stringify({
                    name: 'Demo User',
                    email: email,
                    role: role
                }));
                
                // Redirect after delay
                setTimeout(() => {
                    window.location.href = role === 'manager' ? 'manager-dashboard.html' : 'team-dashboard.html';
                }, 1500);
            } else {
                showMessage('error', 'Invalid email or password');
            }
        }
    });
    
    // Signup form submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const role = document.querySelector('input[name="signup-role"]:checked').value;
        const terms = document.getElementById('terms').checked;
        
        // Basic validation
        if (password !== confirmPassword) {
            showMessage('error', 'Passwords do not match');
            return;
        }
        
        if (!terms) {
            showMessage('error', 'You must agree to the Terms & Conditions');
            return;
        }
        
        // Save user
        const newUser = { name, email, password, role };
        if (saveUser(newUser)) {
            showMessage('success', `Account created successfully as ${role}`);
            signupForm.reset();
            setTimeout(switchToLogin, 2000);
        } else {
            showMessage('error', 'Email already registered');
        }
    });
    
    // For the demo - pre-filled login (optional)
    document.getElementById('login-email').value = 'demo@collabsphere.com';
    document.getElementById('login-password').value = 'password123';
});