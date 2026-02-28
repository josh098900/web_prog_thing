import Globe from 'globe.gl';

// --- Coordinate Dictionary for 3D Arc Mapping ---
const cityCoordinates = {
    'DXB': { lat: 25.2532, lng: 55.3657 },
    'LHR': { lat: 51.4700, lng: -0.4543 },
    'CDG': { lat: 49.0097, lng: 2.5479 }, // Paris
    'JFK': { lat: 40.6413, lng: -73.7781 }, // New York
    'HND': { lat: 35.5494, lng: 139.7798 }, // Tokyo
    // Default fallback
    'DEFAULT': { lat: 0, lng: 0 }
};

export function initGlobe(containerId, originCode = 'DXB', destCode = 'LHR') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Default to DXB if missing
    const startCoord = cityCoordinates[originCode.toUpperCase()] || cityCoordinates['DXB'];
    const endCoord = cityCoordinates[destCode.toUpperCase()] || cityCoordinates['DEFAULT'];

    const arcData = [
        {
            startLat: startCoord.lat,
            startLng: startCoord.lng,
            endLat: endCoord.lat,
            endLng: endCoord.lng,
            color: '#cca450' // Jesko Jets Gold
        }
    ];

    // Initialize Globe
    const world = Globe()
        (container)
        .backgroundColor('rgba(0,0,0,0)') // Transparent background
        .showGlobe(true)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg') // Base dark map
        .arcsData(arcData)
        .arcColor('color')
        .arcDashLength(0.5)
        .arcDashGap(0.2)
        .arcDashAnimateTime(2000)
        .arcStroke(1);

    // Customize rendering loop
    // Auto-rotate the globe slowly
    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 0.5;

    // Disable zooming for a fixed UI widget feel
    world.controls().enableZoom = false;

    // Set initial camera position looking roughly at the flight path
    const midLat = (startCoord.lat + endCoord.lat) / 2;
    const midLng = (startCoord.lng + endCoord.lng) / 2;
    world.pointOfView({ lat: midLat, lng: midLng, altitude: 2 }, 1000);

    // Initial resize to fit the responsive container
    handleResize();

    // Responsive listening
    window.addEventListener('resize', handleResize);

    function handleResize() {
        const width = container.clientWidth;
        // Keep it roughly square or a fixed height depending on your layout
        const height = width * 0.8;
        world.width(width);
        world.height(height);
    }

    return world;
}
