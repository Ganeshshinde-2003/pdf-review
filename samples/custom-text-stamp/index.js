const element = document.getElementById('viewer');

WebViewer({
  path: '/static/lib',
  initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf'
}, element).then(instance => {

  const { Annotations, annotManager, docViewer } = instance;

  // Create a function to draw text annots on the document
  const drawTextAnnot = (color, text, x, y) => {
    const stampAnnot = new Annotations.StampAnnotation();
    stampAnnot.PageNumber = 1;
    stampAnnot.X = x;
    stampAnnot.Y = y;
    stampAnnot.Width = 275;
    stampAnnot.Height = 40;
  
    // create a canvas in memory to draw your text to
    const canvas = document.createElement('canvas');
    canvas.width = 275;
    canvas.height = 40;
    const context = canvas.getContext('2d');
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.textBaseline = 'middle';
    context.font = "26px Arial";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.fillText(text,canvas.width/2,canvas.height/2);
    
    // convert your canvas to a data URL
    const dataURL = canvas.toDataURL(); 
  
    // put your data URL here
    stampAnnot.ImageData = dataURL;
    annotManager.addAnnotation(stampAnnot);
    annotManager.redrawAnnotation(stampAnnot);
  }


  docViewer.on('documentLoaded', () => {
    drawTextAnnot('#FF822D', 'Express', 100, 100)
    drawTextAnnot('red', 'Invalid', 300, 600)
  })
})