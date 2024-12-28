# Line and Polygon Clipping Application

## Overview
This application provides an interactive interface to visualize line and polygon clipping algorithms. It includes support for:

- **Liang-Barsky Line Clipping Algorithm** for segments.
- **Sutherland-Hodgman Polygon Clipping Algorithm** for convex polygons.

The user can:
- Pan and zoom the canvas.
- Add and remove segments.
- Define polygons with adjustable vertices.
- Specify a clipping window.
- Visualize the result of the clipping process.

## Features
1. **Interactive Grid**: Users can pan and zoom the canvas to adjust their view.
2. **Segment Clipping**: Add, modify, and remove segments, then clip them against a defined clipping window.
3. **Polygon Clipping**: Input convex polygons and clip them against a clipping window using the Sutherland-Hodgman algorithm.
4. **Customizable Clipping Window**: Dynamically change the boundaries of the clipping region.
5. **Responsive Design**: The canvas dynamically updates to reflect changes in input and transformations.

## Setup

### Prerequisites
- A modern web browser (e.g., Chrome, Firefox, Edge).
- Basic HTML, CSS, and JavaScript setup.

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Open the project folder and launch the application:
   ```bash
   cd <project-folder>
   open index.html
   ```

   Alternatively, use a local server like Live Server in VS Code.

## Usage

### Canvas Interaction
- **Pan**: Click and drag anywhere on the canvas.
- **Zoom**: Use the mouse scroll wheel to zoom in or out. The scale factor is displayed dynamically.

### Modes
- **Segments Mode**:
  - Add segments using the **Add Segment** button.
  - Each segment has `x1, y1` (start point) and `x2, y2` (end point) coordinates.
  - Use the **Remove** button to delete a segment.
- **Polygon Mode**:
  - Define the number of vertices and input their coordinates.
  - Ensure the polygon is convex for proper clipping.

### Clipping Window
Define the clipping boundaries using the input fields for:
- `xmin`
- `ymin`
- `xmax`
- `ymax`

### Algorithms
1. **Liang-Barsky Line Clipping**:
   - Clips individual line segments to the defined clipping window.
2. **Sutherland-Hodgman Polygon Clipping**:
   - Clips convex polygons against the defined clipping window.

### Error Handling
- Non-convex polygons will show a warning.
- Invalid or incomplete input data will trigger error messages.

## Development

### File Structure
```
project-folder/
|-- index.html      # Main HTML file
|-- style.css       # Styling for the application
|-- script.js       # Main JavaScript logic
```

### Code Highlights
- `liangBarsky(x1, y1, x2, y2, clip)`: Implements the Liang-Barsky line clipping algorithm.
- `sutherlandHodgman(polygon, clip)`: Implements the Sutherland-Hodgman polygon clipping algorithm.
- `drawGrid()`: Dynamically renders the coordinate grid on the canvas.
- `mapToCanvas(x, y)`: Maps world coordinates to canvas coordinates.

### Extending Functionality
1. Add new clipping algorithms by defining additional functions and integrating them into the UI.
2. Support non-convex polygons using algorithms like Weiler-Atherton.

## Troubleshooting
- Ensure all input fields have valid numeric data.
- Refresh the page if the canvas does not update after significant modifications.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments
- Inspiration from computational geometry and graphics tutorials.
- [MDN Web Docs](https://developer.mozilla.org/) for references on HTML5 Canvas and JavaScript APIs.
