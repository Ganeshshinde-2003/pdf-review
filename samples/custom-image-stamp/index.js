const element = document.getElementById('viewer');

WebViewer({
  path: '/static/lib',
  initialDoc: '/static/docs/form-example.pdf'
}, element).then(instance => {

  const { Annotations, annotManager, docViewer } = instance;

  // Create a function to draw text annots on the document
  const drawImageAnnot = (imageSrc, x, y, size) => {
    const stampAnnot = new Annotations.StampAnnotation();
    stampAnnot.PageNumber = 1;
    stampAnnot.X = x;
    stampAnnot.Y = y;
    stampAnnot.Width = size;
    stampAnnot.Height = size;
  
    // create a canvas in memory to draw your text to
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');

    // Create an image object. This is not attached to the DOM and is not part of the page.
    var image = new Image();

    // When the image has loaded, draw it to the canvas and add the annot to annotation manager
    image.onload = function()
    {
      context.drawImage(image, 0, 0, size, size);
    
      // convert your canvas to a data URL
      const dataURL = canvas.toDataURL(); 
  
      // put your data URL here
      stampAnnot.ImageData = dataURL;
      annotManager.addAnnotation(stampAnnot);
      annotManager.redrawAnnotation(stampAnnot);
    }

    // set width and height of the image and set the source.
    image.width = size;
    image.height = size;
    image.src = imageSrc;
  }

  // Wait for annotations to be loaded
  docViewer.on('annotationsLoaded', () => {
    const fieldManager = annotManager.getFieldManager();

    // loop over each form field in the document
    fieldManager.forEachField(field => {
      const { widgets } = field;
      if (widgets) {
        const widget = widgets[0];

        // Only draw image for text boxes
        if (widget.defaultValue === '' && widget.appearance !== 'Off' && widget.appearance !== 'On') {
          const { X, Y } = widget;
          drawImageAnnot('/static/img/finger-point.png', X-30, Y, 25)
        }
      }
    });
  })
})