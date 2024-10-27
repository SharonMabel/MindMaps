let selectedCard = null;
let mode = 'create';
let connections = [];
let selectedConnection = null;

// Styles für Verbindungslinien
const lineStyles = {
    solid: [],
    dashed: [5, 5],
    dotted: [2, 2],
    dashedLong: [10, 5]
};

// Funktion zum Speichern des aktuellen Zustands
function saveMindmap() {
    const cards = Array.from(document.querySelectorAll('.card')).map(card => ({
        id: card.id,
        frontText: card.querySelector('.card-front h2').textContent,
        backText: card.querySelector('.card-back p').textContent,
        position: {
            left: card.style.left,
            top: card.style.top
        },
        style: {
            width: card.style.width,
            height: card.style.height,
            fontFamily: card.style.fontFamily,
            color: card.style.color,
            fontWeight: card.style.fontWeight
        }
    }));

    const savedConnections = connections.map(conn => ({
        card1Id: conn.card1.id,
        card2Id: conn.card2.id,
        style: conn.style || {
            color: 'blue',
            width: 2,
            lineStyle: 'solid'
        }
    }));

    const mindmapData = {
        cards: cards,
        connections: savedConnections,
        lastModified: new Date().toISOString()
    };

    // Speichern in localStorage
    localStorage.setItem('mindmap', JSON.stringify(mindmapData));
    
    // Optional: Speichern auf einem Server
    // saveMindmapToServer(mindmapData);
}

// Funktion zum Laden einer gespeicherten Mindmap
function loadMindmap() {
    const savedData = localStorage.getItem('mindmap');
    if (!savedData) return;

    const mindmapData = JSON.parse(savedData);
    
    // Bestehende Karten und Verbindungen löschen
    cardContainer.innerHTML = '';
    connections = [];
    
    // Karten wiederherstellen
    mindmapData.cards.forEach(cardData => {
        const card = createCard(cardData.frontText, cardData.backText);
        card.id = cardData.id;
        card.style.left = cardData.position.left;
        card.style.top = cardData.position.top;
        Object.assign(card.style, cardData.style);
        cardContainer.appendChild(card);
    });
    
    // Verbindungen wiederherstellen
    mindmapData.connections.forEach(conn => {
        const card1 = document.getElementById(conn.card1Id);
        const card2 = document.getElementById(conn.card2Id);
        if (card1 && card2) {
            connections.push({
                card1: card1,
                card2: card2,
                style: conn.style
            });
        }
    });
    
    redrawConnections();
}

// Verbindungsmanagement-Panel erstellen
function createConnectionPanel() {
    const panel = document.createElement('div');
    panel.id = 'connectionPanel';
    panel.style.cssText = `
        position: fixed;
        left: 10px;
        top: 10px;
        background: white;
        border: 1px solid #ccc;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;

    panel.innerHTML = `
        <h3>Verbindungseinstellungen</h3>
        <div>
            <label>Linienfarbe:</label>
            <input type="color" id="lineColor" value="#0000ff">
        </div>
        <div>
            <label>Linienstärke:</label>
            <input type="range" id="lineWidth" min="1" max="10" value="2">
        </div>
        <div>
            <label>Linienstil:</label>
            <select id="lineStyle">
                <option value="solid">Durchgezogen</option>
                <option value="dashed">Gestrichelt</option>
                <option value="dotted">Gepunktet</option>
                <option value="dashedLong">Lang gestrichelt</option>
            </select>
        </div>
        <button id="deleteConnection">Verbindung löschen</button>
        <button id="saveButton">Mindmap speichern</button>
        <button id="loadButton">Mindmap laden</button>
    `;

    document.body.appendChild(panel);

    // Event Listener für die Verbindungseinstellungen
    document.getElementById('lineColor').addEventListener('change', updateConnectionStyle);
    document.getElementById('lineWidth').addEventListener('change', updateConnectionStyle);
    document.getElementById('lineStyle').addEventListener('change', updateConnectionStyle);
    document.getElementById('deleteConnection').addEventListener('click', deleteSelectedConnection);
    document.getElementById('saveButton').addEventListener('click', saveMindmap);
    document.getElementById('loadButton').addEventListener('click', loadMindmap);
}

function updateConnectionStyle() {
    if (!selectedConnection) return;

    selectedConnection.style = {
        color: document.getElementById('lineColor').value,
        width: document.getElementById('lineWidth').value,
        lineStyle: document.getElementById('lineStyle').value
    };
    redrawConnections();
}

function deleteSelectedConnection() {
    if (!selectedConnection) return;
    connections = connections.filter(conn => conn !== selectedConnection);
    selectedConnection = null;
    redrawConnections();
}

// Verbesserte drawConnection Funktion
function drawConnection(card1, card2, style = null) {
    const rect1 = card1.getBoundingClientRect();
    const rect2 = card2.getBoundingClientRect();
    
    const startX = rect1.left + rect1.width / 2;
    const startY = rect1.top + rect1.height / 2;
    const endX = rect2.left + rect2.width / 2;
    const endY = rect2.top + rect2.height / 2;

    ctx.beginPath();
    ctx.setLineDash(lineStyles[style?.lineStyle || 'solid']);
    ctx.strokeStyle = style?.color || 'blue';
    ctx.lineWidth = style?.width || 2;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash style
}

// Verbesserte redrawConnections Funktion
function redrawConnections() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    connections.forEach(conn => {
        drawConnection(conn.card1, conn.card2, conn.style);
    });
}

// Event Listener für Verbindungsauswahl
canvas.addEventListener('click', (e) => {
    if (mode !== 'connect') return;

    const clickX = e.clientX;
    const clickY = e.clientY;
    
    // Finde die angeklickte Verbindung
    selectedConnection = connections.find(conn => {
        const rect1 = conn.card1.getBoundingClientRect();
        const rect2 = conn.card2.getBoundingClientRect();
        
        const x1 = rect1.left + rect1.width / 2;
        const y1 = rect1.top + rect1.height / 2;
        const x2 = rect2.left + rect2.width / 2;
        const y2 = rect2.top + rect2.height / 2;
        
        // Berechne Abstand des Klickpunkts zur Linie
        const distance = distanceToLine(clickX, clickY, x1, y1, x2, y2);
        return distance < 10; // 10px Toleranz
    });

    redrawConnections();
});

// Hilfsfunktion zur Berechnung des Abstands eines Punktes zu einer Linie
function distanceToLine(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

// Funktion zum Erstellen einer neuen Karte mit eindeutiger ID
function createCard(frontText, backText) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.id = 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    card.style.top = "50px";
    card.style.left = "50px";
    card.innerHTML = `
        <div class="card-front"><h2>${frontText}</h2></div>
        <div class="card-back"><p>${backText}</p></div>
    `;
    makeCardDraggable(card);
    return card;
}

// Kartengrößen-Steuerung
function addCardSizeControls() {
    const sizeControls = document.createElement('div');
    sizeControls.id = 'sizeControls';
    sizeControls.style.cssText = `
        position: fixed;
        right: 10px;
        bottom: 10px;
        background: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    
    sizeControls.innerHTML = `
        <button id="decreaseSize">-</button>
        <button id="resetSize">Reset</button>
        <button id="increaseSize">+</button>
    `;
    
    document.body.appendChild(sizeControls);
    
    document.getElementById('decreaseSize').onclick = () => scaleSelectedCard(0.9);
    document.getElementById('resetSize').onclick = () => resetCardSize();
    document.getElementById('increaseSize').onclick = () => scaleSelectedCard(1.1);
}

function scaleSelectedCard(factor) {
    if (!selectedCard) return;
    
    const currentWidth = parseInt(getComputedStyle(selectedCard).width);
    const currentHeight = parseInt(getComputedStyle(selectedCard).height);
    
    selectedCard.style.width = `${currentWidth * factor}px`;
    selectedCard.style.height = `${currentHeight * factor}px`;
    
    redrawConnections();
}

function resetCardSize() {
    if (!selectedCard) return;
    selectedCard.style.width = '200px';  // oder deine Standard-Kartengröße
    selectedCard.style.height = '120px';
    redrawConnections();
}

// Initialisierung
createConnectionPanel();
addCardSizeControls();