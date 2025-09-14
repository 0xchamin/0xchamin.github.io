// Enhanced Map.js - Premium Leaflet implementation
let map;
let markers = [];
let currentHoverPopup = null;

// Initialize the map with premium styling
function initMap() {
    // Create map centered on Ireland with smooth animations
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([53.1424, -7.6921], 7);

    // Add custom zoom control with premium styling
    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    // Add premium dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Load projects and add markers
    loadProjectsData().then(() => {
        addProjectMarkers();
        createMarkerClusters();
    });
}

// Create premium custom markers
function createCustomMarker(project) {
    const themeColor = getThemeColor(project.theme);
    const markerHtml = `
        <div class="premium-marker" style="
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, ${themeColor}CC, ${themeColor});
            border: 3px solid #F7E7B4;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 25px ${themeColor}40, 0 0 0 0 ${themeColor}40;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        ">
            <div style="
                color: white;
                font-size: 18px;
                font-weight: 600;
                z-index: 2;
            ">${getThemeIcon(project.theme)}</div>
            <div class="marker-pulse" style="
                position: absolute;
                top: 50%;
                left: 50%;
                width: 100%;
                height: 100%;
                background: ${themeColor};
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: pulse 2s infinite;
                opacity: 0.3;
            "></div>
        </div>
    `;

    return L.divIcon({
        className: 'premium-marker-container',
        html: markerHtml,
        iconSize: [50, 50],
        iconAnchor: [25, 25],
        popupAnchor: [0, -25]
    });
}

// Add project markers with enhanced interactions
function addProjectMarkers() {
    projectsData.forEach((project, index) => {
        if (project.lat && project.lng) {
            const customIcon = createCustomMarker(project);
            
            const marker = L.marker([project.lat, project.lng], {
                icon: customIcon,
                riseOnHover: true
            }).addTo(map);

            // Enhanced hover effects
            marker.on('mouseover', function(e) {
                // Scale animation
                const markerElement = e.target._icon.querySelector('.premium-marker');
                if (markerElement) {
                    markerElement.style.transform = 'scale(1.2)';
                    markerElement.style.boxShadow = `0 12px 35px ${getThemeColor(project.theme)}60, 0 0 0 8px ${getThemeColor(project.theme)}20`;
                }
                
                // Show preview popup
                showProjectPreview(project, e.latlng, marker);
            });

            marker.on('mouseout', function(e) {
                // Reset scale
                const markerElement = e.target._icon.querySelector('.premium-marker');
                if (markerElement) {
                    markerElement.style.transform = 'scale(1)';
                    markerElement.style.boxShadow = `0 8px 25px ${getThemeColor(project.theme)}40, 0 0 0 0 ${getThemeColor(project.theme)}40`;
                }
                
                // Hide preview popup
                hideProjectPreview();
            });

            // Click handler for full popup
            marker.on('click', function(e) {
                hideProjectPreview();
                showProjectPopup(project);
                
                // Smooth zoom to marker
                map.flyTo([project.lat, project.lng], Math.max(map.getZoom(), 8), {
                    duration: 1
                });
            });

            markers.push(marker);
        }
    });
}

// Enhanced preview popup
function showProjectPreview(project, latlng, marker) {
    hideProjectPreview();
    
    const previewHtml = `
        <div class="preview-popup">
            <div class="preview-header">
                <h4>${project.team}</h4>
                <span class="preview-theme">${project.theme}</span>
            </div>
            <p class="preview-location">${project.county}</p>
            <div class="preview-stats">
                <span class="like-count">❤️ ${project.likes || 0}</span>
            </div>
        </div>
    `;

    currentHoverPopup = L.popup({
        closeButton: false,
        className: 'premium-preview-popup',
        offset: [0, -10]
    })
    .setLatLng(latlng)
    .setContent(previewHtml)
    .openOn(map);
}

function hideProjectPreview() {
    if (currentHoverPopup) {
        map.closePopup(currentHoverPopup);
        currentHoverPopup = null;
    }
}

// Get theme-based colors with expanded palette
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

// Get theme-based icons
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

// Create marker clusters for better organization
function createMarkerClusters() {
    // Group markers by county for better visual organization
    const countyGroups = {};
    
    projectsData.forEach(project => {
        if (!countyGroups[project.county]) {
            countyGroups[project.county] = [];
        }
        countyGroups[project.county].push(project);
    });

    // Add county labels
    Object.entries(countyGroups).forEach(([county, projects]) => {
        if (projects.length > 1) {
            // Calculate center point
            const avgLat = projects.reduce((sum, p) => sum + p.lat, 0) / projects.length;
            const avgLng = projects.reduce((sum, p) => sum + p.lng, 0) / projects.length;
            
            // Add county label
            const countyLabel = L.divIcon({
                className: 'county-label',
                html: `<div style="
                    background: rgba(30, 41, 59, 0.9);
                    color: #F7E7B4;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    border: 1px solid rgba(247, 231, 180, 0.3);
                    text-align: center;
                    backdrop-filter: blur(10px);
                ">${county} (${projects.length})</div>`,
                iconSize: [80, 24],
                iconAnchor: [40, 12]
            });
            
            L.marker([avgLat + 0.05, avgLng], { 
                icon: countyLabel,
                interactive: false,
                zIndexOffset: -100
            }).addTo(map);
        }
    });
}

// Focus on specific project (called from sidebar)
function focusOnProject(projectTeam) {
    const project = projectsData.find(p => p.team === projectTeam);
    if (project && project.lat && project.lng) {
        map.flyTo([project.lat, project.lng], 10, {
            duration: 1.5
        });
        
        // Highlight the marker temporarily
        const marker = markers.find(m => {
            const markerLat = m.getLatLng().lat;
            const markerLng = m.getLatLng().lng;
            return Math.abs(markerLat - project.lat) < 0.001 && 
                   Math.abs(markerLng - project.lng) < 0.001;
        });
        
        if (marker) {
            // Pulse effect
            const markerElement = marker._icon.querySelector('.premium-marker');
            if (markerElement) {
                markerElement.style.animation = 'pulse 0.5s ease-in-out 3';
            }
        }
    }
}

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initMap();
});

// Add CSS for marker animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); box-shadow: 0 8px 25px var(--accent-blue)40; }
        50% { transform: scale(1.1); box-shadow: 0 12px 35px var(--accent-blue)60; }
        100% { transform: scale(1); box-shadow: 0 8px 25px var(--accent-blue)40; }
    }
    
    .premium-preview-popup .leaflet-popup-content-wrapper {
        background: rgba(30, 41, 59, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(247, 231, 180, 0.2);
        border-radius: 16px;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
    }
    
    .premium-preview-popup .leaflet-popup-content {
        margin: 0;
        padding: 16px;
        color: #F8FAFC;
    }
    
    .preview-popup h4 {
        margin: 0 0 8px 0;
        color: #F7E7B4;
        font-size: 16px;
        font-weight: 600;
    }
    
    .preview-theme {
        background: linear-gradient(135deg, #3B82F6, #1D4ED8);
        color: white;
        padding: 2px 8px;
        border-radius: 8px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .preview-location {
        margin: 8px 0;
        color: #CBD5E1;
        font-size: 14px;
    }
    
    .preview-stats {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;
    }
    
    .like-count {
        font-size: 12px;
        color: #10B981;
    }
    
    .premium-preview-popup .leaflet-popup-tip {
        background: rgba(30, 41, 59, 0.95);
        border: 1px solid rgba(247, 231, 180, 0.2);
    }
`;
document.head.appendChild(style);