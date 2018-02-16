# LUMENAUT WEBSITE

Repository for the Lumenaut website.

You can visit the website here: https://lumenaut-network.github.io/website

# OBSERVATIONS

Some considerations taken while making the website:

- More than 13 words per line will weary the reader mentally (between 11 to 13 words per line is perfect);
- Icons in SVG because it is scalable, searched, indexed, scripted, and compressed;
- Non use 'width' or 'height', always use 'min-width' and 'min-height', or 'max-width' and 'max-height', and let the thing scale itself (it's more user friendly and a step forward for the template's mobile version);
- Always use the proper css classes instead of css shorthand to prevent browser's memory usage. For example, do not use 'background' if you want to set the background color, instead use the proper property "background-color". By using css shorthand you will make the browser to render all CSS classes for that shorthand property even if you don't need to use them, requiring more cpu memory from the end user;
- [not used yet] Maintain video's aspect ratio and prevent black bands, which happens when the browser's window is resized, by using the formula B/(A/100)=C;
- Use '%' in 'font-size' to allow the end user to control the font size with zoom in browser (for % to work here you need to first set 'font-size: 100%' hierarchyly in the html);
- Does not require Javascript to have standard functionality;
- 100% markup and stylesheet validation according to W3C standards.

# VALIDATION

HTML5 validation:

https://validator.w3.org/nu/?doc=https%3A%2F%2Flumenaut-network.github.io%2Fwebsite%2F

CSS3 validation:

https://jigsaw.w3.org/css-validator/validator?uri=https%3A%2F%2Flumenaut-network.github.io%2Fwebsite%2F

# DEPENDENCIES

None.

_________________________

2018 @ Lumenaut
