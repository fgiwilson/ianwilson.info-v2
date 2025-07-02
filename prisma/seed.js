/**
 * Prisma seed file for initial database setup
 * Creates admin user and sample content for the portfolio site
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('UxGexV42', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'ian@wilsonsdesigns.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
    },
  });
  
  console.log(`Created admin user: ${admin.email}`);

  // Create tags for blog posts
  const webDevTag = await prisma.tag.upsert({
    where: { slug: 'web-development' },
    update: {},
    create: {
      name: 'Web Development',
      slug: 'web-development',
    },
  });

  const designTag = await prisma.tag.upsert({
    where: { slug: 'design' },
    update: {},
    create: {
      name: 'Design',
      slug: 'design',
    },
  });

  const techTag = await prisma.tag.upsert({
    where: { slug: 'technology' },
    update: {},
    create: {
      name: 'Technology',
      slug: 'technology',
    },
  });

  console.log('Created tags for blog posts');

  // Create categories for projects
  const webDevCategory = await prisma.category.upsert({
    where: { slug: 'web-development' },
    update: {},
    create: {
      name: 'Web Development',
      slug: 'web-development',
    },
  });

  const uiUxCategory = await prisma.category.upsert({
    where: { slug: 'ui-ux-design' },
    update: {},
    create: {
      name: 'UI/UX Design',
      slug: 'ui-ux-design',
    },
  });

  console.log('Created categories for projects');

  // Create sample blog posts
  const blogPost1 = await prisma.blogPost.upsert({
    where: { slug: 'getting-started-with-sveltekit' },
    update: {},
    create: {
      title: 'Getting Started with SvelteKit',
      slug: 'getting-started-with-sveltekit',
      content: `
# Getting Started with SvelteKit

SvelteKit is a framework for building web applications of all sizes, with a beautiful development experience and flexible filesystem-based routing.

## Why SvelteKit?

* **Less code**: Build boilerplate-free components using languages you already know — HTML, CSS and JavaScript
* **No virtual DOM**: Svelte compiles your code to tiny, framework-less vanilla JS
* **Truly reactive**: No more complex state management libraries — Svelte brings reactivity to JavaScript itself

## Setting up a new project

Getting started with SvelteKit is as simple as running the following command:

\`\`\`bash
npm create svelte@latest my-app
\`\`\`

This will create a new SvelteKit project in the \`my-app\` directory, asking you if you'd like to set up additional options like TypeScript and testing.

## Project Structure

A typical SvelteKit project looks like this:

\`\`\`
my-app/
├ src/
│ ├ lib/
│ │ └ ... # Your components and utility functions
│ ├ routes/
│ │ └ ... # Your pages and API routes
│ ├ app.html # The HTML template for your app
│ └ hooks.server.js # Optional server hooks
├ static/
│ └ ... # Static assets like images, fonts, etc.
├ tests/
│ └ ... # Your tests
├ package.json
├ svelte.config.js
├ tsconfig.json # If using TypeScript
└ vite.config.js
\`\`\`

## Conclusion

SvelteKit provides an excellent developer experience with its intuitive API and blazing-fast development server. Give it a try for your next project!
      `,
      excerpt: 'Learn how to get started with SvelteKit, the framework for building high-performance web applications with a great developer experience.',
      publishedAt: new Date(),
      featured: true,
      authorId: admin.id,
      tags: {
        connect: [
          { id: webDevTag.id },
          { id: techTag.id }
        ]
      }
    },
  });

  const blogPost2 = await prisma.blogPost.upsert({
    where: { slug: 'modern-css-techniques' },
    update: {},
    create: {
      title: 'Modern CSS Techniques Every Developer Should Know',
      slug: 'modern-css-techniques',
      content: `
# Modern CSS Techniques Every Developer Should Know

CSS has evolved significantly over the years, and there are now many powerful features that make styling websites easier and more efficient.

## CSS Grid

CSS Grid Layout is a two-dimensional layout system designed for the web. It lets you lay out items in rows and columns, and has many features that make building complex layouts straightforward.

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-gap: 20px;
}
\`\`\`

## CSS Custom Properties (Variables)

CSS now has native variables, known as custom properties:

\`\`\`css
:root {
  --primary-color: #2D5A5C;
  --accent-color: #FF8C00;
}

.button {
  background-color: var(--primary-color);
  color: white;
}

.button:hover {
  background-color: var(--accent-color);
}
\`\`\`

## Container Queries

Container queries allow you to apply styles based on the size of a containing element rather than the viewport:

\`\`\`css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 2fr 1fr;
  }
}
\`\`\`

## Conclusion

These modern CSS techniques can significantly improve your workflow and the quality of your websites. By leveraging these features, you can create more maintainable, responsive, and visually appealing designs.
      `,
      excerpt: 'Explore modern CSS techniques including Grid, Custom Properties, and Container Queries that will level up your web development skills.',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      authorId: admin.id,
      tags: {
        connect: [
          { id: webDevTag.id },
          { id: designTag.id }
        ]
      }
    },
  });

  console.log('Created sample blog posts');

  // Create sample projects
  const project1 = await prisma.project.upsert({
    where: { slug: 'portfolio-website' },
    update: {},
    create: {
      title: 'Portfolio Website',
      slug: 'portfolio-website',
      description: 'A modern portfolio website built with SvelteKit and TailwindCSS',
      content: `
# Portfolio Website

## Overview

This project is a modern portfolio website built with SvelteKit and TailwindCSS. It features a responsive design, blog system, and project showcase.

## Technologies Used

- SvelteKit
- TailwindCSS
- PostgreSQL
- Prisma ORM
- TypeScript

## Features

- Responsive design that works on all devices
- Blog system with markdown support
- Project showcase with case studies
- Contact form with email integration
- Admin dashboard for content management

## Development Process

The development process involved several key phases:

1. **Planning and Design**: Created wireframes and mockups using Figma
2. **Frontend Development**: Built the UI components using SvelteKit and TailwindCSS
3. **Backend Integration**: Set up PostgreSQL database and Prisma ORM
4. **CMS Implementation**: Created an admin dashboard for content management
5. **Deployment**: Deployed the site to a production environment

## Conclusion

This portfolio website serves as a showcase for my skills and projects, while also providing a platform for sharing knowledge through the blog system.
      `,
      featured: true,
      authorId: admin.id,
      order: 1,
      categories: {
        connect: [
          { id: webDevCategory.id },
          { id: uiUxCategory.id }
        ]
      }
    },
  });

  const project2 = await prisma.project.upsert({
    where: { slug: 'e-commerce-platform' },
    update: {},
    create: {
      title: 'E-Commerce Platform',
      slug: 'e-commerce-platform',
      description: 'A full-featured e-commerce platform with product management, cart functionality, and payment processing',
      content: `
# E-Commerce Platform

## Overview

This project is a full-featured e-commerce platform that allows businesses to sell products online. It includes product management, shopping cart functionality, and secure payment processing.

## Technologies Used

- React
- Node.js
- Express
- MongoDB
- Stripe API
- AWS S3 for image storage

## Features

- Product catalog with categories and filters
- User authentication and account management
- Shopping cart and checkout process
- Payment processing with Stripe
- Order history and tracking
- Admin dashboard for product and order management

## Development Process

The development process was divided into several phases:

1. **Requirements Gathering**: Worked with the client to understand their specific needs
2. **System Design**: Created database schema and API specifications
3. **Frontend Development**: Built the user interface using React
4. **Backend Development**: Implemented the API using Node.js and Express
5. **Integration**: Connected the frontend with the backend and integrated third-party services
6. **Testing and Deployment**: Conducted thorough testing and deployed to production

## Challenges and Solutions

One of the main challenges was implementing a secure and efficient payment processing system. This was solved by integrating with Stripe API and implementing proper error handling and transaction management.

## Results

The platform has successfully processed over 1,000 orders in its first month of operation, with a conversion rate of 3.5%.
      `,
      featured: false,
      authorId: admin.id,
      order: 2,
      categories: {
        connect: [
          { id: webDevCategory.id }
        ]
      }
    },
  });

  console.log('Created sample projects');

  // Create resume sections and items
  const summarySection = await prisma.resumeSection.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      title: 'Professional Summary',
      type: 'summary',
      content: 'Experienced web developer with a strong background in frontend and backend technologies. Passionate about creating intuitive, accessible, and performant web applications.',
      order: 1
    }
  });

  const workSection = await prisma.resumeSection.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      title: 'Work Experience',
      type: 'work',
      order: 2,
      items: {
        create: [
          {
            title: 'Senior Web Developer',
            subtitle: 'Tech Solutions Inc.',
            location: 'San Francisco, CA',
            startDate: new Date('2020-01-01'),
            endDate: null,
            current: true,
            description: '- Led development of multiple client projects using modern web technologies\n- Mentored junior developers and conducted code reviews\n- Implemented CI/CD pipelines to improve deployment efficiency\n- Reduced page load times by 40% through performance optimizations',
            order: 1
          },
          {
            title: 'Web Developer',
            subtitle: 'Digital Agency',
            location: 'Portland, OR',
            startDate: new Date('2017-03-01'),
            endDate: new Date('2019-12-31'),
            current: false,
            description: '- Developed responsive websites for various clients\n- Collaborated with designers to implement UI/UX improvements\n- Built custom WordPress themes and plugins\n- Maintained and updated existing client websites',
            order: 2
          }
        ]
      }
    }
  });

  const educationSection = await prisma.resumeSection.upsert({
    where: { id: '3' },
    update: {},
    create: {
      id: '3',
      title: 'Education',
      type: 'education',
      order: 3,
      items: {
        create: [
          {
            title: 'Bachelor of Science in Computer Science',
            subtitle: 'University of Washington',
            location: 'Seattle, WA',
            startDate: new Date('2013-09-01'),
            endDate: new Date('2017-06-01'),
            current: false,
            description: '- Graduated with honors\n- Specialized in web development and software engineering\n- Relevant coursework: Data Structures, Algorithms, Database Systems, Web Development',
            order: 1
          }
        ]
      }
    }
  });

  const skillsSection = await prisma.resumeSection.upsert({
    where: { id: '4' },
    update: {},
    create: {
      id: '4',
      title: 'Skills',
      type: 'skills',
      order: 4,
      items: {
        create: [
          {
            title: 'Frontend Development',
            description: '- JavaScript/TypeScript\n- React, Svelte, Vue\n- HTML5, CSS3, SASS\n- TailwindCSS, Bootstrap\n- Responsive Design\n- Web Accessibility',
            order: 1
          },
          {
            title: 'Backend Development',
            description: '- Node.js, Express\n- PostgreSQL, MongoDB\n- RESTful APIs\n- GraphQL\n- Authentication & Authorization\n- Performance Optimization',
            order: 2
          },
          {
            title: 'Tools & Practices',
            description: '- Git, GitHub\n- Docker\n- CI/CD (GitHub Actions, Jenkins)\n- Agile/Scrum\n- Test-Driven Development\n- Technical Documentation',
            order: 3
          }
        ]
      }
    }
  });

  console.log('Created resume sections and items');

  console.log('Database seed completed successfully!');
  console.log('Admin login credentials:');
  console.log('Email: admin@example.com');
  console.log('Password: admin123');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
