let selectedCard = null;
let mode = 'create';
let connections = [];
let gridSize = 20; // Größe der Rasterzellen in Pixeln

const canvas = document.getElementById('connectionCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Verbindungseinstellungen
let lineColor = "#0000ff";
let lineStyle = "solid";
let lineWidth = 2;

// Funktion zum Zeichnen des Rasters
function drawGrid() {
    ctx.save();
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;

    // Vertikale Linien
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Horizontale Linien
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    ctx.restore();
}

// Funktion zum Einrasten in das Raster
function snapToGrid(value) {
    return Math.round(value / gridSize) * gridSize;
}

// Toggle Lock-Status
function toggleLock(lockIcon) {
    const card = lockIcon.parentElement;
    if (card.classList.toggle('locked')) {
        lockIcon.style.filter = 'none'; // Original schwarzes Icon
    } else {
        lockIcon.style.filter = 'opacity(0.5)'; // Transparentes Icon für entriegelt
    }
}

// Karten hinzufügen
function addCard() {
    const frontText = document.getElementById('frontText').value;
    const backText = document.getElementById('backText').value;
    const cardContainer = document.getElementById('cardContainer');

    if (frontText && backText) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.style.top = '50px';
        card.style.left = '50px';
        card.innerHTML = `
            <div class="card-front"><h2>${frontText}</h2></div>
            <div class="card-back"><p>${backText}</p></div>
            <img src="https://sharonmabel.github.io/MindMaps/Black%20Lock%20Icon.png" class="lock-icon" onclick="toggleLock(this)">
        `;

        cardContainer.appendChild(card);
        card.addEventListener('click', () => handleCardClick(card));
        makeCardDraggable(card);

        // Initial Lock-Icon transparent setzen
        card.querySelector('.lock-icon').style.filter = 'opacity(0.5)';

        document.getElementById('frontText').value = '';
        document.getElementById('backText').value = '';
    }
}

// Karte verschiebbar machen
function makeCardDraggable(card) {
    card.addEventListener('mousedown', startDragging);

    function startDragging(e) {
        // Wenn die Karte gesperrt ist oder das Click-Event vom Lock-Icon kommt, nicht verschieben
        if (card.classList.contains('locked') || e.target.classList.contains('lock-icon')) {
            return;
        }

        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = card.offsetLeft;
        const startTop = card.offsetTop;

        function dragMove(e) {
            const newLeft = startLeft + (e.clientX - startX);
            const newTop = startTop + (e.clientY - startY);
            
            // Während des Ziehens noch keine Rasterfunktion
            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`;
            redrawConnections();
        }

        function dragEnd() {
            // Beim Loslassen in Raster einrasten
            const finalLeft = snapToGrid(card.offsetLeft);
            const finalTop = snapToGrid(card.offsetTop);
            
            // Sanfte Animation zum Rasterpunkt
            card.style.transition = 'all 0.2s ease';
            card.style.left = `${finalLeft}px`;
            card.style.top = `${finalTop}px`;
            
            // Transition nach Animation zurücksetzen
            setTimeout(() => {
                card.style.transition = '';
            }, 200);

            redrawConnections();
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
        }

        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
    }
}

// Verbindungen neu zeichnen mit Raster
function redrawConnections() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(); // Zuerst das Raster zeichnen
    
    connections.forEach(conn => {
        const rect1 = conn.card1.getBoundingClientRect();
        const rect2 = conn.card2.getBoundingClientRect();
        const startX = rect1.left + rect1.width / 2;
        const startY = rect1.top + rect1.height / 2;
        const endX = rect2.left + rect2.width / 2;
        const endY = rect2.top + rect2.height / 2;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.setLineDash(lineStyle === 'dashed' ? [5, 5] : lineStyle === 'dotted' ? [2, 2] : []);
        ctx.stroke();
    });
    ctx.setLineDash([]);
}

// Füge auch etwas CSS hinzu
const style = document.createElement('style');
style.textContent = `
.card {
    position: absolute;
    transition: transform 0.3s ease;
}

.lock-icon {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 20px;
    height: 20px;
    cursor: pointer;
    z-index: 1000;
}

.locked {
    cursor: not-allowed;
}
`;
document.head.appendChild(style);

// Initial das Raster zeichnen
drawGrid();

// Event Listener für Fenstergrößenänderungen
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redrawConnections();
});