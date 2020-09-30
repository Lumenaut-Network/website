# THIS REPOSITORY IS OBSOLETE AND KEPT FOR REFERENCE PURPOSES ONLY

### Luminous website

Repository for the Luminous website.

You can visit the website here: https://lumenaut-network.github.io/website

### Observations

Some considerations taken while making the website:

- More than 13 words per line will weary the reader mentally (between 11 to 13 words per line is perfect);
- Icons in SVG because it is scalable, searched, indexed, scripted, and compressed;
- Non use 'width' or 'height', always use 'min-width' and 'min-height', or 'max-width' and 'max-height', and let the thing scale itself (it's more user friendly and a step forward for the template's mobile version);
- Always use the proper css classes instead of css shorthand to prevent browser's memory usage. For example, do not use 'background' if you want to set the background color, instead use the proper property "background-color". By using css shorthand you will make the browser to render all CSS classes for that shorthand property even if you don't need to use them, requiring more cpus memory from the end user;
- [not used yet] Maintain video's aspect ratio and prevent black bands, which happens when the browser's window is resized, by using the formula B/(A/100)=C;
- Use '%' in 'font-size' to allow the end user to control the font size with zoom in browser (for % to work here you need to first set 'font-size: 100%' hierarchy in the html);
- Does not require JavaScript to have standard functionality;
- No dependencies from frameworks;
- 100% markup and style sheet validation according to W3C standards.

### Validation

HTML5 validation:

https://validator.w3.org/nu/?doc=https%3A%2F%2Flumenaut-network.github.io%2Fwebsite%2F

CSS3 validation:

https://jigsaw.w3.org/css-validator/validator?uri=https%3A%2F%2Flumenaut-network.github.io%2Fwebsite%2F

### Dependencies

None.

_________________________

2019 @ Luminous
