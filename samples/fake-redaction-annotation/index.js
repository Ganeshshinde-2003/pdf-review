
const element = document.getElementById('viewer');

WebViewer({
  path: '/static/lib',
  initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf'
}, element).then(instance => {

  const { Annotations, Tools, docViewer, annotManager } = instance;

  // Create a new RedactionAnnotation that extends the rectangle annotation.
  // We'll set the elementName to `redaction` so we can differentiate it from rectangles in the XFDF
  const RedactionAnnotation = function() {
    Annotations.RectangleAnnotation.call(this);
  };
  RedactionAnnotation.prototype = new Annotations.RectangleAnnotation();
  RedactionAnnotation.prototype.elementName = 'redaction';

  // Create a new tool to draw our redactions. We'll extend the GenericAnnotationCreateTool
  // We'll call `setStyles` and make the FillColor and StrokeColor of the annotation to black
  const RedactionCreateTool = function(docViewer) {
    // RedactionAnnotation is the constructor function for our annotation we defined previously
    Tools.GenericAnnotationCreateTool.call(this, docViewer, RedactionAnnotation);

    this.setStyles({
      FillColor: new Annotations.Color(0,0,0),
      StrokeColor: new Annotations.Color(0,0,0)
    })
  };
  RedactionCreateTool.prototype = new Tools.GenericAnnotationCreateTool();

  // The code below registers the new tool with the UI and adds it to the header
  const redactionTool = new RedactionCreateTool(docViewer);
  instance.registerTool({
    toolName: 'redactionTool',
    toolObject: redactionTool,
    buttonImage: `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" >
        <rect width='20' height='20' style='fill:rgb(0,0,0)' />
      </svg>
    `.trim(),
    buttonName: 'redactionToolButton',
    tooltip: 'Redaction'
  }, RedactionAnnotation);

  // This code will hide the style button when the annotation is selected.
  // This makes it so the user cannot change the color of the annotation
  annotManager.on('annotationSelected', (list) => {
    if (list) {
      const [annot] = list;
      if(annot instanceof RedactionAnnotation) {
        instance.disableElements(['annotationStyleEditButton']);
    } else {
        instance.enableElements(['annotationStyleEditButton']);
      }
    }
  })
  
  instance.setHeaderItems(header => {
    const triangleButton = {
      type: 'toolButton',
      toolName: 'redactionTool'
    };
    header.getHeader('toolbarGroup-Annotate').get('highlightToolGroupButton').insertBefore(triangleButton);
  });

  docViewer.on('documentLoaded', () => {
    // set the tool mode to our tool so that we can start using it right away
    instance.setToolMode('redactionTool');
  });

})