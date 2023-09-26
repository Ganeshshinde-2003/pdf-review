const element = document.getElementById('viewer');

WebViewer({
  path: '/static/lib',
  initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf'
}, element).then(instance => {

  const { Annotations, Tools, docViewer, annotManager } = instance;

  // First we create a new Annotation class, extending the HTMLAnnotation class
  // HTMLAnnotations use DOM elements to render instead of canvas
  // We'll also fetch a random cat image from giphy and set it as the annotations 'source'
  const GIFAnnotation = function () {
    Annotations.HTMLAnnotation.call(this);
    const endpoint = 'https://api.giphy.com/v1/gifs/random?api_key=DbW97cqvCJ79payb1Ewtk1uoaazNKSYX&tag=cat';
    this.sourcePromise = fetch(endpoint).then(resp => resp.json()).then((json) => {
      this.source = json.data.fixed_width_downsampled_url;
    })
  }
  GIFAnnotation.prototype = new Annotations.HTMLAnnotation();
  GIFAnnotation.prototype.elementName = 'gif';

  // Since HTMLAnnotations do not have selectin models by default, we'll assign one here
  GIFAnnotation.prototype.selectionModel = Annotations.BoxSelectionModel;

  // This function is used to get the HTML contents for the annotation.
  // For our GIF annotation, we'll just return an image and set its source
  // to our random cat gif we fetch in the constructor.
  GIFAnnotation.prototype.createInnerElement = function () {
    const img = document.createElement('img');
    this.sourcePromise.then(() => { 
      img.src = this.source;
    })
    img.width = '100%';
    img.height = '100%';
    return img;
  }

  // Since 'source' isn't a standard PDF attribute, we'll have to tell WebViewer how to serialize/deserialize it
  GIFAnnotation.prototype.serialize = function (element, pageMatrix) {
    const el = Annotations.HTMLAnnotation.prototype.serialize.call(this, element, pageMatrix);
    el.setAttribute('source', this.source);
    return el;
  }
  GIFAnnotation.prototype.deserialize = function (element, pageMatrix) {
    Annotations.HTMLAnnotation.prototype.deserialize.call(this, element, pageMatrix);
    this.source = element.getAttribute('source');
  }

  // Now we create a tool to draw our new annotation
  const GIFCreateTool = function(docViewer) {
    // GIFAnnotation is the constructor function for our annotation we defined previously
    Tools.GenericAnnotationCreateTool.call(this, docViewer, GIFAnnotation);
  };
  GIFCreateTool.prototype = new Tools.GenericAnnotationCreateTool();

  // Since HTML annotations aren't refreshed by default, we need to manually refresh it once its created
  GIFCreateTool.prototype.mouseLeftUp = function () {
    Tools.GenericAnnotationCreateTool.prototype.mouseLeftUp.call(this);
    const annot = new GIFAnnotation();
    annotManager.addAnnotation(annot);
    annotManager.drawAnnotations({ pageNumber: annot.PageNumber, majorRedraw: true })
  }

  // Now lets register the tool and add it to the UI!
  const gifToolName = 'AnnotationCreateGIF';
  annotManager.registerAnnotationType(GIFAnnotation.prototype.elementName, GIFAnnotation);

  const gifTool = new GIFCreateTool(docViewer);
  instance.registerTool({
    toolName: gifToolName,
    toolObject: gifTool,
    buttonImage: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">' +
      '<text x="0" y="16" fill="#8c8c8c">GIF</text>' +
    '</svg>',
    buttonName: 'gifToolButton',
    tooltip: 'GIF'
  }, GIFAnnotation);
  
  instance.setHeaderItems(header => {
    const gifButton = {
      type: 'toolButton',
      toolName: gifToolName
    };
    header.getHeader('toolbarGroup-Annotate').get('highlightToolGroupButton').insertBefore(gifButton);
  });


})