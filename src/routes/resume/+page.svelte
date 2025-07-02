<script lang="ts">
  import { marked } from 'marked';
  import { generateSeoTags } from '$lib/utils/seo';
  import ResumeLayout from '$lib/layouts/ResumeLayout.svelte';
  import type { PageData } from './$types';

  // Define interfaces based on Prisma schema
  interface ResumeItem {
    id: string;
    title: string;
    subtitle: string | null;
    location: string | null;
    startDate: Date | string | null;
    endDate: Date | string | null;
    current: boolean;
    description: string;
    order: number;
    sectionId: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  interface ResumeSection {
    id: string;
    title: string;
    type: string;
    content: string | null;
    order: number;
    items: ResumeItem[];
    createdAt?: Date;
    updatedAt?: Date;
  }

  // Get data from the loader
  let { data } = $props<{ data: PageData }>();

  // Format date function
  function formatDate(dateString: string | Date | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }

  // Render section based on its type
  function renderSectionItems(section: ResumeSection) {
    switch (section.type) {
      case 'skills':
        return renderSkillsSection(section);
      case 'summary':
        return renderSummarySection(section);
      case 'work':
        return renderWorkSection(section);
      case 'education':
        return renderEducationSection(section);
      case 'certifications':
        return renderCertificationsSection(section);
      case 'custom':
      default:
        return renderDefaultSection(section);
    }
  }

  // Render skills section (grid layout)
  function renderSkillsSection(section: ResumeSection) {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${section.items.map(item => `
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-xl font-bold mb-2">${item.title}</h3>
            ${marked(item.description)}
          </div>
        `).join('')}
      </div>
    `;
  }

  // Render summary section (simple content)
  function renderSummarySection(section: ResumeSection) {
    return `
      <div class="prose prose-lg max-w-none mb-6">
        ${section.content ? marked(section.content) : ''}
        ${section.items.map(item => `
          <div class="mb-4">
            ${marked(item.description)}
          </div>
        `).join('')}
      </div>
    `;
  }

  // Render work experience section
  function renderWorkSection(section: ResumeSection) {
    return `
      <div class="space-y-8">
        ${section.items.map(item => `
          <div class="resume-item">
            <div class="flex flex-col md:flex-row md:justify-between mb-2">
              <div>
                <h3 class="text-xl font-bold">${item.title}</h3>
                ${item.subtitle ? `<p class="text-lg text-text-light">${item.subtitle}</p>` : ''}
              </div>
              <div class="text-text-light">
                ${getDateRange(item)}
              </div>
            </div>
            
            ${item.location ? `
              <div class="mb-2">
                ${item.location ? `<span>${item.location}</span>` : ''}
              </div>
            ` : ''}
            
            ${`<div class="prose prose-lg max-w-none">${marked(item.description)}</div>`}
          </div>
        `).join('')}
      </div>
    `;
  }

  // Render education section
  function renderEducationSection(section: ResumeSection) {
    return `
      <div class="space-y-8">
        ${section.items.map(item => `
          <div class="resume-item">
            <div class="flex flex-col md:flex-row md:justify-between mb-2">
              <div>
                <h3 class="text-xl font-bold">${item.title}</h3>
                ${item.subtitle ? `<p class="text-lg text-text-light">${item.subtitle}</p>` : ''}
              </div>
              <div class="text-text-light">
                ${getDateRange(item)}
              </div>
            </div>
            
            ${item.location ? `
              <div class="mb-2">
                ${item.location ? `<span>${item.location}</span>` : ''}
              </div>
            ` : ''}
            
            ${`<div class="prose prose-lg max-w-none">${marked(item.description)}</div>`}
          </div>
        `).join('')}
      </div>
    `;
  }

  // Render certifications section
  function renderCertificationsSection(section: ResumeSection) {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${section.items.map(item => `
          <div class="bg-white shadow-sm rounded-lg p-4 border border-gray-100">
            <h3 class="text-xl font-bold mb-1">${item.title}</h3>
            ${item.subtitle ? `<p class="text-text-light mb-2">${item.subtitle}</p>` : ''}
            ${`<div class="prose prose-md">${marked(item.description)}</div>`}
            ${item.startDate ? `<p class="text-sm text-text-light mt-2">Issued: ${formatDate(item.startDate)}</p>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  // Render default section
  function renderDefaultSection(section: ResumeSection) {
    return `
      ${section.content ? `<div class="prose prose-lg max-w-none mb-6">${marked(section.content)}</div>` : ''}
      
      ${section.items.length > 0 ? `
        <div class="space-y-8">
          ${section.items.map(item => `
            <div class="resume-item">
              <div class="flex flex-col md:flex-row md:justify-between mb-2">
                <div>
                  <h3 class="text-xl font-bold">${item.title}</h3>
                  ${item.subtitle ? `<p class="text-lg text-text-light">${item.subtitle}</p>` : ''}
                </div>
                <div class="text-text-light">
                  ${getDateRange(item)}
                </div>
              </div>
              
              ${item.location ? `
                <div class="mb-2">
                  ${item.location ? `<span>${item.location}</span>` : ''}
                </div>
              ` : ''}
              
              ${`<div class="prose prose-lg max-w-none">${marked(item.description)}</div>`}
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  }

  // Generate date range string
  function getDateRange(item: ResumeItem): string {
    const startDate = item.startDate ? formatDate(item.startDate) : '';
    const endDate = item.current ? 'Present' : (item.endDate ? formatDate(item.endDate) : '');
    
    if (startDate && endDate) {
      return `${startDate} - ${endDate}`;
    } else if (startDate) {
      return `${startDate}`;
    }
    return '';
  }
</script>

<svelte:head>
  {@html generateSeoTags({
    title: 'Resume | Ian Wilson',
    description: 'Professional experience, skills, and qualifications of Ian Wilson.',
    url: data.url
  })}
</svelte:head>

<ResumeLayout
  title="Resume"
  description="Professional experience and qualifications"
  personalInfo={data.personalInfo}
  skills={data.skills}
  stats={data.stats}
>
  <div class="space-y-12">
    {#each data.sections as section}
      <section class="resume-section">
        <h2 class="text-2xl md:text-3xl font-bold text-primary mb-6">{section.title}</h2>
        {@html renderSectionItems(section)}
      </section>
    {/each}
    
    {#if data.sections.length === 0}
      <div class="text-center py-12">
        <p class="text-xl text-text-light">Resume content is being updated. Please check back soon.</p>
      </div>
    {/if}
  </div>
</ResumeLayout>