# Markdown Image Gallery Documentation

This document explains how to use the enhanced markdown image features in your content.

## Basic Usage

The standard markdown image syntax still works as expected:

```markdown
![Alt text for the image](/path/to/image.jpg)
```

## Modal Images

To make an image open in a full-screen modal when clicked, add `{modal}` to the alt text:

```markdown
![Image description{modal}](/path/to/image.jpg)
```

This will render the image at a reasonable size on the page, but when clicked, it will open in a full-screen modal view.

## Image Galleries

You can group multiple images into a gallery grid using the gallery shortcode:

```markdown
![Gallery Title](/path/to/image1.jpg, /path/to/image2.jpg, /path/to/image3.jpg){gallery}
```

This will display the images in a 3-column grid by default.

### Customizing Gallery Columns

You can specify the number of columns for your gallery:

```markdown
![Gallery Title](/path/to/image1.jpg, /path/to/image2.jpg, /path/to/image3.jpg, /path/to/image4.jpg){gallery:4}
```

This will display the images in a 4-column grid.

## Best Practices

1. **Image Sizes**:
   - For regular content images: 800-1200px wide
   - For gallery thumbnails: 400-600px wide
   - Keep file sizes reasonable (under 200KB if possible)

2. **Alt Text**:
   - Always provide descriptive alt text for accessibility
   - When using modal or gallery features, the alt text will be displayed in the modal view

3. **File Paths**:
   - Use absolute paths starting with `/` for images in the static folder
   - Example: `/images/blog/my-image.jpg`
   - For S3-hosted images, use the full URL

## Examples

### Single Modal Image

```markdown
![A beautiful sunset over the mountains{modal}](/images/blog/sunset.jpg)
```

### Simple Gallery

```markdown
![Travel Photos](/images/travel/paris.jpg, /images/travel/rome.jpg, /images/travel/tokyo.jpg){gallery}
```

### Gallery with Custom Columns

```markdown
![Project Screenshots](/images/projects/dashboard.jpg, /images/projects/login.jpg, /images/projects/profile.jpg, /images/projects/settings.jpg){gallery:2}
```

This will display the images in a 2-column grid.

## Technical Notes

- All gallery images will open in a modal when clicked
- Images are lazy-loaded for better performance
- The gallery uses CSS grid for responsive layout
- The modal is keyboard accessible (can be closed with Escape key)
