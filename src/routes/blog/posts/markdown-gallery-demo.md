---
title: Markdown Image Gallery Demo
description: A demonstration of the new markdown image gallery features
date: '2025-07-18'
categories:
  - tutorial
  - features
published: true
---

# Markdown Image Gallery Demo

This post demonstrates the new markdown image gallery features available in our content system.

## Standard Images

Here's a standard markdown image:

![A standard markdown image](/images/placeholder.jpg)

## Modal Images

Click on this image to open it in a full-screen modal:

![Beautiful landscape view{modal}](/images/placeholder.jpg)

## Image Galleries

### Basic 3-Column Gallery

![Nature Gallery](/images/placeholder.jpg, /images/placeholder.jpg, /images/placeholder.jpg){gallery}

### Custom 2-Column Gallery

![Travel Photos](/images/placeholder.jpg, /images/placeholder.jpg, /images/placeholder.jpg, /images/placeholder.jpg){gallery:2}

### Custom 4-Column Gallery

![Project Screenshots](/images/placeholder.jpg, /images/placeholder.jpg, /images/placeholder.jpg, /images/placeholder.jpg, /images/placeholder.jpg, /images/placeholder.jpg, /images/placeholder.jpg, /images/placeholder.jpg){gallery:4}

## How It Works

The markdown parser has been extended to support special syntax for modal images and galleries:

1. For modal images, add `{modal}` to the alt text
2. For galleries, provide multiple image URLs separated by commas, and add `{gallery}` to the alt text
3. To customize gallery columns, use `{gallery:N}` where N is the number of columns

For more details, check out the [markdown image gallery documentation](/docs/markdown-image-gallery).
