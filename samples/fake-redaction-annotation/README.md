# Creating a fake redaction annotation (easy)

This example shows how you could create a custom redcation annotation.

**Since PDF.js Express does not support redaction, this will just be a rectangle annotation that is all black.**

You could use this annotation + a 3rd party service on the server to create actual redactions.

For true redaction support, see our sister product, [PDFTron WebViewer](https://www.pdftron.com).

This demo demonstrates the following concepts:

- Extending existing annotations
- [Hiding UI elements](https://pdfjs.express/documentation/ui-customization/hiding-elements)
- [Changing default annotation styles](https://pdfjs.express/documentation/annotation/customizing-default-annotation-styles)