// js/data.js - Load project data from JSON file
let projectsData = [];

// Load projects data from JSON file
async function loadProjectsData() {
    try {
        const response = await fetch('https://0xchamin.github.io/tech_ireland_v2/data/projects.json');
        const data = await response.json();
        projectsData = data;
        console.log('✅ Projects data loaded successfully:', projectsData.length, 'projects');
        return projectsData;
    } catch (error) {
        console.error('❌ Error loading projects data:', error);
        // Fallback to empty array
        projectsData = [];
        return projectsData;
    }
}

// Initialize data loading
loadProjectsData();

// Export for use in other files
window.projectsData = projectsData;
window.loadProjectsData = loadProjectsData;
