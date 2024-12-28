const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let scale = 20.0;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

let segments = [];
let polygon = []; // Вершины многоугольника
let errorTimeout = null; // Переменная для хранения идентификатора таймера ????


// Обработчики событий для панорамирования и масштабирования
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    canvas.style.cursor = 'grabbing';
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        offsetX += dx;
        offsetY += dy;
        redraw();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomIntensity = 0.05;
    const delta = e.deltaY < 0 ? 1 + zoomIntensity : 1 - zoomIntensity;
    const previousScale = scale;
    scale = Math.min(Math.max(5, scale * delta), 50);

    document.getElementById('scale').value = scale.toFixed(1);
    document.getElementById('scaleValue').textContent = `Масштаб: ${scale.toFixed(1)}`;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = scale / previousScale;
    offsetX = mouseX - zoomFactor * (mouseX - offsetX);
    offsetY = mouseY - zoomFactor * (mouseY - offsetY);

    redraw();
});

function updateScale() {
    scale = parseFloat(document.getElementById('scale').value);
    document.getElementById('scaleValue').textContent = `Масштаб: ${scale.toFixed(1)}`;
    redraw();
}

function switchMode() {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    if (mode === 'segments') {
        document.getElementById('segments-controls').style.display = 'block';
        document.getElementById('polygon-controls').style.display = 'none';
    } else {
        document.getElementById('segments-controls').style.display = 'none';
        document.getElementById('polygon-controls').style.display = 'block';
    }
    resetCanvas(); // Очистка канваса при переключении режима
}

function addSegment() {
    const segmentId = segments.length + 1;
    const segmentDiv = document.createElement('div');
    segmentDiv.innerHTML = `
        <div class="input-group">
            <label>Отрезок ${segmentId}:</label>
            <div>
                x1: <input type="number" class="x1" value="0">
                y1: <input type="number" class="y1" value="0">
                x2: <input type="number" class="x2" value="1">
                y2: <input type="number" class="y2" value="1">
                <button class="remove-segment">Удалить</button>
            </div>
        </div>
    `;
    document.getElementById('segments').appendChild(segmentDiv);

    // Сохраняем ссылку на элемент и данные
    const segmentData = { element: segmentDiv, data: { x1: 0, y1: 0, x2: 1, y2: 1 } };
    segments.push(segmentData);

    // Навешиваем обработчик на кнопку удаления
    segmentDiv.querySelector('.remove-segment').addEventListener('click', () => removeSegment(segmentData));

    redraw();
}

function removeSegment(segmentData) {
    // Удаляем элемент из DOM и из массива
    const index = segments.indexOf(segmentData);
    if (index !== -1) {
        segmentData.element.remove();
        segments.splice(index, 1);
    }
    updateSegmentNumbers();
    redraw();
}

function updateSegmentNumbers() {
    const segmentDivs = document.querySelectorAll('#segments .input-group');
    segmentDivs.forEach((div, index) => {
        div.querySelector('label').innerText = `Отрезок ${index + 1}:`;
    });
}

function getClipWindow() {
    return {
        xmin: parseFloat(document.getElementById('clipXmin').value),
        ymin: parseFloat(document.getElementById('clipYmin').value),
        xmax: parseFloat(document.getElementById('clipXmax').value),
        ymax: parseFloat(document.getElementById('clipYmax').value)
    };
}

// Координатный преобразователь
function mapToCanvas(x, y) {
    const centerX = canvas.width / 2 + offsetX;
    const centerY = canvas.height / 2 + offsetY;
    return {
        x: centerX + x * scale,
        y: centerY - y * scale
    };
}

// Рисование сетки
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2 + offsetX;
    const centerY = canvas.height / 2 + offsetY;

    let labelStep = 1;

    if (scale >= 20) {
        labelStep = 1;
    } else if (scale >= 10) {
        labelStep = 2;
    } else {
        labelStep = 5;
    }

    const gridStep = scale;

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();

    const startX = -Math.ceil(centerX / gridStep);
    const endX = Math.ceil((canvas.width - centerX) / gridStep);
    for (let i = startX; i <= endX; i++) {
        const x = centerX + i * gridStep;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }

    const startY = -Math.ceil(centerY / gridStep);
    const endY = Math.ceil((canvas.height - centerY) / gridStep);
    for (let i = startY; i <= endY; i++) {
        const y = centerY + i * gridStep;
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();

    ctx.font = `${Math.max(10, scale / 2)}px Arial`;
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let i = startX; i <= endX; i++) {
        if (i === 0) continue;
        const x = centerX + i * gridStep;
        if (i % labelStep === 0) {
            ctx.fillText(i, x, centerY + 5);
        }
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = startY; i <= endY; i++) {
        if (i === 0) continue;
        const y = centerY + i * gridStep;
        if (i % labelStep === 0) {
            ctx.fillText(-i, centerX - 5, y);
        }
    }
}
function liangBarsky(x1, y1, x2, y2, clip) {
    let t_in = 0.0, t_out = 1.0; 
    const dx = x2 - x1, dy = y2 - y1; 

    const clipTest = (S, Q) => {
        if (S > 0) { 
            t_out = Math.min(Q / S, t_out);
        } else if (S < 0) { 
            t_in = Math.max(Q / S, t_in);
        } else if (S === 0 && Q < 0) { 
            return false;
        }
        return t_in <= t_out; 
    };

    if (!clipTest(-dx, x1 - clip.xmin)) return { accept: false }; // Left boundary
    if (!clipTest(dx, clip.xmax - x1)) return { accept: false }; // Right boundary
    if (!clipTest(-dy, y1 - clip.ymin)) return { accept: false }; // Bottom boundary
    if (!clipTest(dy, clip.ymax - y1)) return { accept: false }; // Top boundary

    const nx1 = x1 + t_in * dx, ny1 = y1 + t_in * dy;
    const nx2 = x1 + t_out * dx, ny2 = y1 + t_out * dy;

    return { accept: true, x1: nx1, y1: ny1, x2: nx2, y2: ny2 };
}

// Алгоритм отсечения многоугольника Сазерленда-Ходжмана
function sutherlandHodgman(polygon, clip) {
    const clipEdges = [
        { // Левая граница
            inside: (p) => p.x >= clip.xmin,
            intersect: (p1, p2) => {
                const x = clip.xmin;
                const y = p1.y + (p2.y - p1.y) * (clip.xmin - p1.x) / (p2.x - p1.x);
                return {x, y};
            }
        },
        { // Правая граница
            inside: (p) => p.x <= clip.xmax,
            intersect: (p1, p2) => {
                const x = clip.xmax;
                const y = p1.y + (p2.y - p1.y) * (clip.xmax - p1.x) / (p2.x - p1.x);
                return {x, y};
            }
        },
        { // Нижняя граница
            inside: (p) => p.y >= clip.ymin,
            intersect: (p1, p2) => {
                const y = clip.ymin;
                const x = p1.x + (p2.x - p1.x) * (clip.ymin - p1.y) / (p2.y - p1.y);
                return {x, y};
            }
        },
        { // Верхняя граница
            inside: (p) => p.y <= clip.ymax,
            intersect: (p1, p2) => {
                const y = clip.ymax;
                const x = p1.x + (p2.x - p1.x) * (clip.ymax - p1.y) / (p2.y - p1.y);
                return {x, y};
            }
        }
    ];

    let output = polygon;
    clipEdges.forEach(edge => {
        const input = output;
        output = [];
        if (input.length === 0) return;
        let S = input[input.length - 1];
        input.forEach(E => {
            if (edge.inside(E)) {
                if (!edge.inside(S)) {
                    const I = edge.intersect(S, E);
                    if (I) output.push(I);
                }
                output.push(E);
            } else if (edge.inside(S)) {
                const I = edge.intersect(S, E);
                if (I) output.push(I);
            }
            S = E;
        });
    });
    return output;
}

// Проверка на выпуклость многоугольника
function isConvex(polygon) {
    if (polygon.length < 3) return false;
    let sign = null;
    const n = polygon.length;
    for (let i = 0; i < n; i++) {
        const dx1 = polygon[(i + 2) % n].x - polygon[(i + 1) % n].x;
        const dy1 = polygon[(i + 2) % n].y - polygon[(i + 1) % n].y;
        const dx2 = polygon[i].x - polygon[(i + 1) % n].x;
        const dy2 = polygon[i].y - polygon[(i + 1) % n].y;
        const zCrossProduct = dx1 * dy2 - dy1 * dx2;
        if (zCrossProduct !== 0) {
            if (sign === null) {
                sign = zCrossProduct > 0;
            } else if ((zCrossProduct > 0) !== sign) {
                return false;
            }
        }
    }
    return true;
}

// Генерация полей ввода для вершин многоугольника
function generatePolygonInputs() {
    const vertexCount = parseInt(document.getElementById('vertexCount').value);
    const container = document.getElementById('polygon-inputs');
    container.innerHTML = '';

    if (isNaN(vertexCount) || vertexCount < 3) {
        showError('Количество вершин должно быть числом не меньше 3.');
        return;
    }

    for (let i = 0; i < vertexCount; i++) {
        const vertexDiv = document.createElement('div');
        vertexDiv.className = 'input-group';
        vertexDiv.innerHTML = `
            <label>Вершина ${i + 1}:</label>
            x: <input type="number" class="px" value="0">
            y: <input type="number" class="py" value="0">
        `;
        container.appendChild(vertexDiv);
    }
}

// Read polygon data from inputs
function updatePolygon() {
    polygon = [];
    const xInputs = document.querySelectorAll('.vertex-x');
    const yInputs = document.querySelectorAll('.vertex-y');

    xInputs.forEach((xInput, index) => {
        const x = parseFloat(xInput.value);
        const y = parseFloat(yInputs[index].value);
        polygon.push({ x, y });
    });

    redraw();
}


function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.style.opacity = '1';

    if (errorTimeout !== null) {
        clearTimeout(errorTimeout);
    }

}
function hideError(){
    const errorDiv = document.getElementById('error-message');
    errorDiv.style.display = 'none';
    errorDiv.style.opacity = '0';
}


// Основная функция отсечения
function clip() {

    const mode = document.querySelector('input[name="mode"]:checked').value;
    const clipWindow = getClipWindow();
    drawGrid();

    // Рисуем отсекающее окно
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    const p1 = mapToCanvas(clipWindow.xmin, clipWindow.ymin);
    const p2 = mapToCanvas(clipWindow.xmax, clipWindow.ymax);
    ctx.strokeRect(p1.x, p2.y, p2.x - p1.x, p1.y - p2.y);

    if (mode === 'segments') {
        // Отсечение отрезков
        segments.forEach((segment) => {
            const inputs = segment.element.getElementsByTagName('input');
            const x1 = parseFloat(inputs[0].value);
            const y1 = parseFloat(inputs[1].value);
            const x2 = parseFloat(inputs[2].value);
            const y2 = parseFloat(inputs[3].value);

            // Рисуем исходный отрезок
            ctx.strokeStyle = 'gray';
            ctx.lineWidth = 1;
            const start = mapToCanvas(x1, y1);
            const end = mapToCanvas(x2, y2);
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            // Отсечение отрезка
            const clipped = liangBarsky(x1, y1, x2, y2, clipWindow);

            if (clipped.accept) {
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                const clippedStart = mapToCanvas(clipped.x1, clipped.y1);
                const clippedEnd = mapToCanvas(clipped.x2, clipped.y2);
                ctx.beginPath();
                ctx.moveTo(clippedStart.x, clippedStart.y);
                ctx.lineTo(clippedEnd.x, clippedEnd.y);
                ctx.stroke();
            }
        });
    } else if (mode === 'polygon') {
        // Получаем вершины многоугольника
        const vertexInputs = document.querySelectorAll('#polygon-inputs .input-group');
        const inputVertices = [];
        vertexInputs.forEach((group) => {
            const x = parseFloat(group.querySelector('.px').value);
            const y = parseFloat(group.querySelector('.py').value);
            inputVertices.push({x, y});
        });

        // Проверка на корректность ввода
        if (inputVertices.length < 3) {
            showError('Многоугольник должен иметь как минимум 3 вершины.');
            return;
        }

        // Рисуем исходный многоугольник
            ctx.strokeStyle = 'gray';
            ctx.lineWidth = 1;
            ctx.beginPath();
            const firstPoint = mapToCanvas(inputVertices[0].x, inputVertices[0].y);
            ctx.moveTo(firstPoint.x, firstPoint.y);
            for (let i = 1; i < inputVertices.length; i++) {
                const point = mapToCanvas(inputVertices[i].x, inputVertices[i].y);
                ctx.lineTo(point.x, point.y);
            }
            ctx.closePath();
            ctx.stroke();
        // Проверка на выпуклость
        if (!isConvex(inputVertices)) {
            showError('Многоугольник невыпуклый. Пожалуйста, введите выпуклый многоугольник.');
            return;
        }
        
        // Отсечение многоугольника
        const clippedPolygon = sutherlandHodgman(inputVertices, clipWindow);

        if (clippedPolygon.length > 0) {
            // Отрисовка отсеченного многоугольника
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.beginPath();
            const clippedStart = mapToCanvas(clippedPolygon[0].x, clippedPolygon[0].y);
            ctx.moveTo(clippedStart.x, clippedStart.y);
            for (let i = 1; i < clippedPolygon.length; i++) {
                const point = mapToCanvas(clippedPolygon[i].x, clippedPolygon[i].y);
                ctx.lineTo(point.x, point.y);
            }
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(clippedStart.x, clippedStart.y);
            for (let i = 1; i < clippedPolygon.length; i++) {
                const point = mapToCanvas(clippedPolygon[i].x, clippedPolygon[i].y);
                ctx.lineTo(point.x, point.y);
            }
            ctx.closePath();
            ctx.stroke();
        }
    }
hideError();
}

// Отрисовка сегментов и многоугольника без отсечения
function drawObjects() {
    const mode = document.querySelector('input[name="mode"]:checked').value;

    if (mode === 'segments') {
        segments.forEach((segment) => {
            const inputs = segment.element.getElementsByTagName('input');
            const x1 = parseFloat(inputs[0].value);
            const y1 = parseFloat(inputs[1].value);
            const x2 = parseFloat(inputs[2].value);
            const y2 = parseFloat(inputs[3].value);

            ctx.strokeStyle = 'gray';
            ctx.lineWidth = 1;
            const start = mapToCanvas(x1, y1);
            const end = mapToCanvas(x2, y2);
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        });
    } else if (mode === 'polygon') {
        // Получаем вершины многоугольника
        const vertexInputs = document.querySelectorAll('#polygon-inputs .input-group');
        const inputVertices = [];
        vertexInputs.forEach((group) => {
            const x = parseFloat(group.querySelector('.px').value);
            const y = parseFloat(group.querySelector('.py').value);
            inputVertices.push({x, y});
        });

        // Проверка на корректность ввода
        if (inputVertices.length < 3) {
            // Не рисуем ничего
            return;
        }

        // Рисуем исходный многоугольник
        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const firstPoint = mapToCanvas(inputVertices[0].x, inputVertices[0].y);
        ctx.moveTo(firstPoint.x, firstPoint.y);
        for (let i = 1; i < inputVertices.length; i++) {
            const point = mapToCanvas(inputVertices[i].x, inputVertices[i].y);
            ctx.lineTo(point.x, point.y);
        }
        ctx.closePath();
        ctx.stroke();
    }
    clip();
}

function redraw() {
    drawGrid();
    drawObjects();
}

function resetCanvas() {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    if (mode === 'segments') {
        segments = [];
        document.getElementById('segments').innerHTML = '';
    } else if (mode === 'polygon') {
        polygon = [];
        document.getElementById('polygon-inputs').innerHTML = '';
    }
    offsetX = 0;
    offsetY = 0;
    scale = 20;
    document.getElementById('scale').value = scale;
    document.getElementById('scaleValue').textContent = `Масштаб: ${scale.toFixed(1)}`;
    document.getElementById('error-message').style.display = 'none';
    if (errorTimeout !== null) {
        clearTimeout(errorTimeout);
        errorTimeout = null;
    }
    redraw();
}

// Инициализация
switchMode(); // Установить начальный режим
resetCanvas();

