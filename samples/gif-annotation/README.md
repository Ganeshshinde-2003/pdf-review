# GIF Annotation (Proof of concept) (Advanced)

This proof of concept example shows how you could create a random cat gif annotation.

**🚧 This annotation should not be used in a real application because GIF is not part of the PDF Spec and other PDF viewers will not be able to display it. 🚧**

This annotation extends the [`HTMLAnnotation`](https://pdfjs.express/api/Annotations.HTMLAnnotation.html), which is an annotation that uses DOM elements to render instead of drawing on a canvas. Using this type of annotation lets us do things like use images and videos as annotations.

This demo demonstrates the following concepts:

- Extending existing annotations
- Using selection models
- HTML annotations

