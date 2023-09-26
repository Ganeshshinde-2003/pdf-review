const element = document.getElementById('viewer');

/**
 * The guide for the sample can be found at:
 * https://pdfjs.express/documentation/annotation/custom-annotations
 */

WebViewer({
  path: '/static/lib',
  initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf'
}, element).then(instance => {

  const { Annotations, Tools, docViewer, annotManager } = instance;

  /**
   * == CONTROL HANDLE CODE==
   * First, we create the annotations control handle. A control handle is the little dot
   * that lets you resize and reshape the annotation
   */
  const TriangleControlHandle = function (annotation, index) {
    this.annotation = annotation;
    // set the index of this control handle so that we know which vertex it corresponds to
    this.index = index;
  };
  
  TriangleControlHandle.prototype = new Annotations.ControlHandle();

  // Get the size and position of the control handle
  TriangleControlHandle.prototype.getDimensions = function (annotation, selectionBox, zoom) {
    let x = annotation.vertices[this.index].x;
    let y = annotation.vertices[this.index].y;
  
    // Use the default width and height
    const width = Annotations.ControlHandle.handleWidth / zoom;
    const height = Annotations.ControlHandle.handleHeight / zoom;
  
    // adjust for the control handle's own width and height
    x -= width * 0.5;
    y -= height * 0.5;
    return new Annotations.Rect(x, y, x + width, y + height);
  };


  // this function is called when the control handle is dragged
  // Here we are altering the annotations vertices to match up with the control handle position
  // After the annotation is resized, we recalculate the rect for the annotation
  TriangleControlHandle.prototype.move = function (annotation, deltaX, deltaY, fromPoint, toPoint) {
    // deltaX and deltaY represent how much the control handle moved
    annotation.vertices[this.index].x += deltaX;
    annotation.vertices[this.index].y += deltaY;

    // recalculate the X, Y, width and height of the annotation
    let minX = Number.MAX_VALUE;
    let maxX = -Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxY = -Number.MAX_VALUE;
    for (let i = 0; i < annotation.vertices.length; ++i) {
      const vertex = annotation.vertices[i];
      minX = Math.min(minX, vertex.x);
      maxX = Math.max(maxX, vertex.x);
      minY = Math.min(minY, vertex.y);
      maxY = Math.max(maxY, vertex.y);
    }

    const rect = new Annotations.Rect(minX, minY, maxX, maxY);
    annotation.setRect(rect);

    // return true if redraw is needed
    // in this case we always want to redraw
    return true;
  };


  // Now we create our selection model and add 3 of our control handles,
  // one for each point of the triangle
  const TriangleSelectionModel = function (annotation, canModify) {
    Annotations.SelectionModel.call(this, annotation, canModify);
    if (canModify) {
      const controlHandles = this.getControlHandles();
      // pass the vertex index to each control handle
      controlHandles.push(new TriangleControlHandle(annotation, 0));
      controlHandles.push(new TriangleControlHandle(annotation, 1));
      controlHandles.push(new TriangleControlHandle(annotation, 2));
    }
  };
  TriangleSelectionModel.prototype = new Annotations.SelectionModel();


  /**
   * == Custom annotation code==
   * Now we create our actual triangle annotation
   * We add 3 verticies to an array. Each one represents on point of the triangle
   */
  const TriangleAnnotation = function() {
    Annotations.MarkupAnnotation.call(this);
    this.Subject = 'Triangle';
    this.vertices = [];
    const numVertices = 3;
    for (let i = 0; i < numVertices; ++i) {
      this.vertices.push({
        x: 0,
        y: 0
      });
    }
  };
  TriangleAnnotation.prototype = new Annotations.MarkupAnnotation();
  TriangleAnnotation.prototype.elementName = 'triangle';

  // Assign the selection model we made above to this annotation
  TriangleAnnotation.prototype.selectionModel = TriangleSelectionModel;

  // overwrite the draw function to draw a trianlge
  TriangleAnnotation.prototype.draw = function(ctx, pageMatrix) {
    this.setStyles(ctx, pageMatrix);

    ctx.beginPath();
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    ctx.lineTo(this.vertices[1].x, this.vertices[1].y);
    ctx.lineTo(this.vertices[2].x, this.vertices[2].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // Whenever the annotation is moved, we need to adjust the verticies position by
  // how much the annotation moved
  TriangleAnnotation.prototype.resize = function (rect) {
    const annotRect = this.getRect();
    const deltaX = rect.x1 - annotRect.x1;
    const deltaY = rect.y1 - annotRect.y1;
  
    // shift the vertices by the amount the rect has shifted
    this.vertices = this.vertices.map((vertex) => {
      vertex.x += deltaX;
      vertex.y += deltaY;
      return vertex;
    });
    this.setRect(rect);
  };


  /**
   * == CUSTOM TOOL CODE ==
   * Now we are going to create a tool for our annotation. A tool is what is used to actually
   * draw the annotation. The tool is also what is displayed in the UI.
   */
  const TriangleCreateTool = function(docViewer) {
    // TriangleAnnotation is the constructor function for our annotation we defined previously
    Tools.GenericAnnotationCreateTool.call(this, docViewer, TriangleAnnotation);
  };
  TriangleCreateTool.prototype = new Tools.GenericAnnotationCreateTool();

  // This is called when the mouse is pressed down and dragged.
  // This is when we are creating the initial annotation.
  // Here we want to set our custom verticies to match the size of the annotation
  TriangleCreateTool.prototype.mouseMove = function (e) {
    // call the parent mouseMove first
    Tools.GenericAnnotationCreateTool.prototype.mouseMove.call(this, e);
    if (this.annotation) {
      this.annotation.vertices[0].x = this.annotation.X + this.annotation.Width / 2;
      this.annotation.vertices[0].y = this.annotation.Y;
      this.annotation.vertices[1].x = this.annotation.X + this.annotation.Width;
      this.annotation.vertices[1].y = this.annotation.Y + this.annotation.Height;
      this.annotation.vertices[2].x = this.annotation.X;
      this.annotation.vertices[2].y = this.annotation.Y + this.annotation.Height;
  
      // update the annotation appearance
      this.docViewer.getAnnotationManager().redrawAnnotation(this.annotation);
    }
  };

  /**
   * In this section, we register our tool with the UI and add a button to the header,
   * so the user can select our tool
   * See this guide for more info:
   * https://pdfjs.express/documentation/ui-customization/customizing-header
   */

  const triangleToolName = 'AnnotationCreateTriangle';

  // register the annotation type so that it can be saved to XFDF files
  annotManager.registerAnnotationType(TriangleAnnotation.prototype.elementName, TriangleAnnotation);
  
  const triangleTool = new TriangleCreateTool(docViewer);
  instance.registerTool({
    toolName: triangleToolName,
    toolObject: triangleTool,
    buttonImage: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">' +
      '<path d="M12 7.77L18.39 18H5.61L12 7.77M12 4L2 20h20L12 4z"/>' +
      '<path fill="none" d="M0 0h24v24H0V0z"/>' +
    '</svg>',
    buttonName: 'triangleToolButton',
    tooltip: 'Triangle'
  }, TriangleAnnotation);
  
  instance.setHeaderItems(header => {
    const triangleButton = {
      type: 'toolButton',
      toolName: triangleToolName
    };
    header.getHeader('toolbarGroup-Annotate').get('highlightToolGroupButton').insertBefore(triangleButton);
  });
  
  docViewer.on('documentLoaded', () => {
    // set the tool mode to our tool so that we can start using it right away
    instance.setToolMode(triangleToolName);
  });
})