// Enhanced main.js - Premium interactive features
let currentProject = null;
let likedProjects = new Set();
let searchTimeout = null;

// Initialize main functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadLikedProjects();
    initializeAnimations();
    
    // Load data and initialize components
    loadProjectsData().then(() => {
        populateTeamList();
        createAnalytics();
        initSearch();
        initializeIntersectionObserver();
    });
});

// Set up event listeners with enhanced interactions
function initializeEventListeners() {
    const closeBtn = document.getElementById('closePopup');
    const likeBtn = document.getElementById('likeBtn');
    const popup = document.getElementById('projectPopup');

    closeBtn.addEventListener('click', hideProjectPopup);
    likeBtn.addEventListener('click', toggleLike);
    
    // Enhanced popup interactions
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            hideProjectPopup();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popup.style.display === 'flex') {
            hideProjectPopup();
        }
    });

    // Search enhancements
    const searchInput = document.getElementById('searchTeams');
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        searchInput.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    }
}

// Enhanced project popup with smooth animations
function showProjectPopup(project) {
    currentProject = project;
    
    // Update content
    document.getElementById('projectTitle').textContent = project.team;
    document.getElementById('projectTheme').textContent = project.theme;
    document.getElementById('projectDescription').textContent = project.project;
    document.getElementById('projectOutcome').textContent = project.outcome;
    document.getElementById('projectLocation').textContent = project.location;
    document.getElementById('likeCount').textContent = project.likes || 0;
    
    
    // Add contact information
    document.getElementById('contactName').textContent = project.contact_name || 'Not specified';
    document.getElementById('contactEmail').textContent = project.contact_email || 'Not provided';

    // Update like button state
    updateLikeButton(project.team);
    
    // Generate AI image placeholder with loading animation
    generateProjectImage(project);
    
    // Show popup with animation
    const popup = document.getElementById('projectPopup');
    popup.style.display = 'flex';
    popup.style.opacity = '0';
    
    // Smooth fade in
    requestAnimationFrame(() => {
        popup.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        popup.style.opacity = '1';
    });
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

// Enhanced popup hiding
function hideProjectPopup() {
    const popup = document.getElementById('projectPopup');
    popup.style.transition = 'opacity 0.3s ease';
    popup.style.opacity = '0';
    
    setTimeout(() => {
        popup.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
    
    currentProject = null;
}

// Enhanced like functionality with animations
function toggleLike() {
    if (!currentProject) return;
    
    const projectId = currentProject.team;
    const isLiked = likedProjects.has(projectId);
    const likeBtn = document.getElementById('likeBtn');
    
    // Add click animation
    likeBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        likeBtn.style.transform = 'scale(1)';
    }, 150);
    
    if (isLiked) {
        likedProjects.delete(projectId);
        currentProject.likes = Math.max(0, (currentProject.likes || 0) - 1);
    } else {
        likedProjects.add(projectId);
        currentProject.likes = (currentProject.likes || 0) + 1;
        
        // Heart animation
        const heart = likeBtn.querySelector('.heart');
        heart.style.animation = 'heartBeat 0.6s ease';
        setTimeout(() => {
            heart.style.animation = '';
        }, 600);
    }
    
    updateLikeButton(projectId);
    
    // Animate counter update
    const likeCount = document.getElementById('likeCount');
    likeCount.style.transform = 'scale(1.3)';
    likeCount.textContent = currentProject.likes;
    setTimeout(() => {
        likeCount.style.transform = 'scale(1)';
    }, 200);
    
    saveLikedProjects();
}

// Enhanced like button appearance
function updateLikeButton(projectId) {
    const likeBtn = document.getElementById('likeBtn');
    const heart = likeBtn.querySelector('.heart');
    const isLiked = likedProjects.has(projectId);
    
    if (isLiked) {
        likeBtn.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
        heart.textContent = '❤️';
        likeBtn.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
    } else {
        likeBtn.style.background = 'linear-gradient(135deg, #3B82F6, #1D4ED8)';
        heart.textContent = '🤍';
        likeBtn.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
    }
}

// Enhanced AI image generation with loading states
function generateProjectImage(project) {
    const imageContainer = document.getElementById('projectImage');
    
    // Show loading state
    imageContainer.innerHTML = `
        <div class="loading-state" style="
            color: #CBD5E1; 
            text-align: center; 
            padding: 3rem;
            animation: pulse 1.5s infinite;
        ">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🤖</div>
            <p style="margin-bottom: 0.5rem;">Generating AI Image...</p>
            <p style="font-size: 0.9rem; opacity: 0.7;">${project.theme}</p>
            <div style="
                width: 40px;
                height: 4px;
                background: linear-gradient(90deg, #3B82F6, #F7E7B4);
                border-radius: 2px;
                margin: 1rem auto;
                animation: loading 1.5s infinite;
            "></div>
        </div>
    `;
    
    // Simulate API call delay
    setTimeout(() => {
        imageContainer.innerHTML = `
            <div style="
                color: #E2E8F0; 
                text-align: center; 
                padding: 3rem;
                background: linear-gradient(135deg, ${getThemeColor(project.theme)}20, transparent);
                border-radius: 12px;
            ">
                <div style="font-size: 4rem; margin-bottom: 1rem;">${getThemeIcon(project.theme)}</div>
                <p style="font-weight: 600; margin-bottom: 0.5rem;">AI-Generated Concept</p>
                <p style="font-size: 0.9rem; opacity: 0.8;">${project.theme} Innovation</p>
                <div style="
                    display: inline-block;
                    background: ${getThemeColor(project.theme)};
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    margin-top: 1rem;
                ">Ready for Demo</div>
            </div>
        `;
    }, 2000);
}

// Enhanced team list with filtering and animations
function populateTeamList() {
    const container = document.getElementById('teamsList');
    container.innerHTML = '';
    
    projectsData.forEach((project, index) => {
        const teamItem = document.createElement('div');
        teamItem.className = 'team-item';
        teamItem.style.animationDelay = `${index * 0.1}s`;
        
        teamItem.innerHTML = `
            <div class="team-name">${project.team}</div>
            <div class="team-theme">${project.theme}</div>
            <div class="team-location">📍 ${project.county}</div>
            <div class="team-likes">❤️ ${project.likes || 0}</div>
        `;
        
        // Enhanced click interaction
        teamItem.addEventListener('click', () => {
            showProjectPopup(project);
            focusOnProject(project.team);
        });
        
        // Add hover sound effect (visual feedback)
        teamItem.addEventListener('mouseenter', () => {
            teamItem.style.transform = 'translateY(-4px) scale(1.02)';
        });
        
        teamItem.addEventListener('mouseleave', () => {
            teamItem.style.transform = 'translateY(0) scale(1)';
        });
        
        container.appendChild(teamItem);
    });
}

// Enhanced search with debouncing and highlighting
function initSearch() {
    const searchInput = document.getElementById('searchTeams');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = e.target.value.toLowerCase().trim();
            filterTeams(query);
        }, 300);
    });
}

function filterTeams(query) {
    const items = document.querySelectorAll('.team-item');
    let visibleCount = 0;
    
    items.forEach((item, index) => {
        const text = item.textContent.toLowerCase();
        const isVisible = !query || text.includes(query);
        
        if (isVisible) {
            item.style.display = 'block';
            item.style.animationDelay = `${visibleCount * 0.05}s`;
            item.classList.add('fade-in');
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Update results count
    const resultsText = query ? `${visibleCount} results for "${query}"` : `${visibleCount} projects`;
    updateSearchResults(resultsText);
}

function updateSearchResults(text) {
    const sidebar = document.querySelector('.sidebar h3');
    if (sidebar) {
        sidebar.textContent = `Projects (${text.split(' ')[0]})`;
    }
}

// Enhanced analytics with interactive charts
function createAnalytics() {
    createCountyChart();
    createThemeChart();
}

function createCountyChart() {
    const counties = {};
    projectsData.forEach(p => {
        counties[p.county] = (counties[p.county] || 0) + 1;
    });
    
    const ctx = document.getElementById('countyChart');
    if (ctx) {
        const maxCount = Math.max(...Object.values(counties));
        ctx.innerHTML = Object.entries(counties)
            .sort(([,a], [,b]) => b - a)
            .map(([county, count]) => 
                `<div class="stat-item" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem;
                    margin-bottom: 0.5rem;
                    background: var(--secondary);
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                " onmouseover="this.style.background='var(--accent-blue)'; this.style.transform='translateX(5px)'" 
                   onmouseout="this.style.background='var(--secondary)'; this.style.transform='translateX(0)'">
                    <span style="color: var(--text-primary); font-weight: 500;">${county}</span>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="
                            width: ${(count/maxCount)*60}px;
                            height: 4px;
                            background: var(--accent-gold);
                            border-radius: 2px;
                            min-width: 8px;
                        "></div>
                        <span style="color: var(--accent-gold); font-weight: 600; min-width: 20px;">${count}</span>
                    </div>
                </div>`
            ).join('');
    }
}

function createThemeChart() {
    const themes = {};
    projectsData.forEach(p => {
        themes[p.theme] = (themes[p.theme] || 0) + 1;
    });
    
    const ctx = document.getElementById('themeChart');
    if (ctx) {
        ctx.innerHTML = Object.entries(themes)
            .sort(([,a], [,b]) => b - a)
            .map(([theme, count]) => 
                `<div class="theme-item" style="
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem;
                    margin-bottom: 0.5rem;
                    background: var(--secondary);
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                " onmouseover="this.style.background='${getThemeColor(theme)}20'" 
                   onmouseout="this.style.background='var(--secondary)'">
                    <div style="
                        width: 12px;
                        height: 12px;
                        background: ${getThemeColor(theme)};
                        border-radius: 50%;
                        box-shadow: 0 0 8px ${getThemeColor(theme)}40;
                    "></div>
                    <span style="color: var(--text-primary); flex: 1;">${theme}</span>
                    <span style="color: ${getThemeColor(theme)}; font-weight: 600;">${count}</span>
                </div>`
            ).join('');
    }
}

// Animation initialization
function initializeAnimations() {
    // Add entrance animations to main sections
    const animatedElements = document.querySelectorAll('.map-section, .sidebar, .analytics-section');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.animationDelay = `${index * 0.2}s`;
        
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 200 + 300);
    });
}

// Intersection Observer for scroll animations
function initializeIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.team-item, .stat-item, .theme-item').forEach(el => {
        observer.observe(el);
    });
}

// Utility functions
function saveLikedProjects() {
    localStorage.setItem('likedProjects', JSON.stringify([...likedProjects]));
}

function loadLikedProjects() {
    const saved = localStorage.getItem('likedProjects');
    if (saved) {
        likedProjects = new Set(JSON.parse(saved));
    }
}

// Theme utilities (shared with map.js)
function getThemeColor(theme) {
    const colors = {
        'CleanTech': '#10B981',
        'HealthTech': '#3B82F6',
        'Enterprise': '#F59E0B',
        'Education': '#8B5CF6',
        'Language': '#EF4444',
        'MediaTech': '#EC4899'
    };
    return colors[theme] || '#6B7280';
}

function getThemeIcon(theme) {
    const icons = {
        'CleanTech': '🌱',
        'HealthTech': '🏥',
        'Enterprise': '🏢',
        'Education': '🎓',
        'Language': '💬',
        'MediaTech': '🎬'
    };
    return icons[theme] || '🤖';
}

// Initialize view toggle functionality
function initViewToggle() {
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const teamsContainer = document.getElementById('teamsList');
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            toggleBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const view = btn.dataset.view;
            if (view === 'list') {
                teamsContainer.classList.add('list-view');
                teamsContainer.classList.remove('grid-view');
            } else {
                teamsContainer.classList.add('grid-view');
                teamsContainer.classList.remove('list-view');
            }
        });
    });
}
