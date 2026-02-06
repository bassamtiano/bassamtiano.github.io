// Profile data will be loaded from profile.md
let profileData = {};
let blogPosts = [];

// Parse YAML frontmatter from markdown (supports nested objects and arrays)
function parseYAML(yamlString) {
    const result = {};
    const lines = yamlString.split('\n');
    const stack = [{ obj: result, indent: -1 }];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
            i++;
            continue;
        }

        const indent = line.match(/^(\s*)/)[1].length;

        // Pop stack until we find the right parent
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
            stack.pop();
        }

        const current = stack[stack.length - 1].obj;

        if (trimmed.startsWith('-')) {
            // Array item
            const itemContent = trimmed.substring(1).trim();
            const colonIndex = itemContent.indexOf(':');

            // Ensure current is an array
            let array = current;
            if (!Array.isArray(current)) {
                // Find the array in the parent
                if (stack.length > 1) {
                    const parent = stack[stack.length - 2].obj;
                    const parentKeys = Object.keys(parent);
                    const lastKey = parentKeys[parentKeys.length - 1];
                    if (lastKey && Array.isArray(parent[lastKey])) {
                        array = parent[lastKey];
                    }
                }
            }

            if (colonIndex > 0) {
                // Object in array - create new object
                const newItem = {};
                array.push(newItem);
                stack.push({ obj: newItem, indent: indent });

                // Parse the first key-value
                const key = itemContent.substring(0, colonIndex).trim();
                let value = itemContent.substring(colonIndex + 1).trim();
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                newItem[key] = value || null;
            } else {
                // Simple array value
                let value = itemContent;
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                array.push(value);
            }
        } else {
            // Regular key-value pair
            const colonIndex = trimmed.indexOf(':');
            if (colonIndex > 0) {
                const key = trimmed.substring(0, colonIndex).trim();
                let value = trimmed.substring(colonIndex + 1).trim();

                // Remove quotes
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                // Check if next line starts array or nested object
                if (i + 1 < lines.length) {
                    const nextLine = lines[i + 1];
                    const nextIndent = nextLine.match(/^(\s*)/)[1].length;
                    const nextTrimmed = nextLine.trim();

                    if (nextIndent > indent) {
                        if (nextTrimmed.startsWith('-')) {
                            // Array
                            current[key] = [];
                            stack.push({ obj: current[key], indent: indent });
                        } else {
                            // Nested object
                            current[key] = {};
                            stack.push({ obj: current[key], indent: indent });
                        }
                    } else {
                        // Simple value
                        if (value === '') {
                            current[key] = null;
                        } else if (value === 'true') {
                            current[key] = true;
                        } else if (value === 'false') {
                            current[key] = false;
                        } else if (!isNaN(value) && value.trim() !== '') {
                            current[key] = Number(value);
                        } else if (value.startsWith('[') && value.endsWith(']')) {
                            // Handle inline arrays: ["a", "b"]
                            const arrayContent = value.slice(1, -1);
                            if (arrayContent.trim() === '') {
                                current[key] = [];
                            } else {
                                current[key] = arrayContent.split(',').map(item => {
                                    item = item.trim();
                                    if ((item.startsWith('"') && item.endsWith('"')) ||
                                        (item.startsWith("'") && item.endsWith("'"))) {
                                        return item.slice(1, -1);
                                    }
                                    return item;
                                });
                            }
                        } else {
                            current[key] = value;
                        }
                    }
                } else {
                    // Last line, simple value
                    if (value === '') {
                        current[key] = null;
                    } else if (value === 'true') {
                        current[key] = true;
                    } else if (value === 'false') {
                        current[key] = false;
                    } else if (!isNaN(value) && value.trim() !== '') {
                        current[key] = Number(value);
                    } else if (value.startsWith('[') && value.endsWith(']')) {
                        // Handle inline arrays: ["a", "b"]
                        const arrayContent = value.slice(1, -1);
                        if (arrayContent.trim() === '') {
                            current[key] = [];
                        } else {
                            current[key] = arrayContent.split(',').map(item => {
                                item = item.trim();
                                if ((item.startsWith('"') && item.endsWith('"')) ||
                                    (item.startsWith("'") && item.endsWith("'"))) {
                                    return item.slice(1, -1);
                                }
                                return item;
                            });
                        }
                    } else {
                        current[key] = value;
                    }
                }
            }
        }

        i++;
    }

    return result;
}

// Parse YAML frontmatter from markdown
function parseFrontmatter(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
        return { metadata: {}, content: content };
    }

    const frontmatter = match[1];
    const markdownContent = match[2];
    const metadata = parseYAML(frontmatter);

    return { metadata, content: markdownContent };
}

// Load profile data from markdown file
async function loadProfileData() {
    try {
        const file = 'profile.md'; // Define file for error message and path resolution
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error(`Failed to load ${file}: ${response.statusText}`);
        }
        let text = await response.text();

        // Resolve relative image paths based on directory
        // For profile.md, the base path is the root directory
        const basePath = file.includes('/') ? file.substring(0, file.lastIndexOf('/')) + '/' : './';

        // Regex to replace relative image paths in markdown
        // Matches ![alt](src "title") or ![alt](src)
        text = text.replace(/!\[([^\]]*)\]\((?!http|\/|#|mailto:)([^)]+)\)/g, (match, alt, src) => {
            // Extract title if present
            const parts = src.split(' "');
            const url = parts[0];
            const title = parts.length > 1 ? ' "' + parts[1] : '';
            return `![${alt}](${basePath}${url}${title})`;
        });

        const { metadata } = parseFrontmatter(text);
        profileData = metadata;
        init();
        setupNavigation();
        loadBlogPosts();
    } catch (error) {
        console.error('Error loading profile data:', error);
        document.body.innerHTML = `
            <div style="padding: 2rem; text-align: center; font-family: sans-serif;">
                <h1>Error Loading Profile Data</h1>
                <p>Could not load profile.md. Please make sure the file exists.</p>
                <p style="color: #666; margin-top: 1rem;">Error: ${error.message}</p>
            </div>
        `;
    }
}

// Load blog posts from markdown files
async function loadBlogPosts() {
    try {
        // First, get the list of blog post files
        const indexResponse = await fetch('blog-index.json');
        if (!indexResponse.ok) {
            console.warn('Blog index file not found');
            return;
        }

        const blogFiles = await indexResponse.json();

        // Load each markdown file
        const posts = await Promise.all(
            blogFiles.map(async (filename) => {
                try {
                    const response = await fetch(`blog/${filename}`);
                    if (!response.ok) {
                        console.warn(`Could not load blog post: ${filename}`);
                        return null;
                    }

                    let text = await response.text();

                    // Resolve relative image paths based on directory
                    // If filename is "folder/index.md", base is "blog/folder/"
                    // Note: filename comes from blog-index.json, e.g. "test-image/index.md"
                    const folder = filename.includes('/') ? filename.substring(0, filename.lastIndexOf('/')) : '';
                    const basePath = folder ? `blog/${folder}/` : 'blog/';

                    // Regex to replace relative image paths in markdown
                    // Matches ![alt](src "title") or ![alt](src)
                    text = text.replace(/!\[([^\]]*)\]\((?!http|\/|#|mailto:)([^)]+)\)/g, (match, alt, src) => {
                        // Extract title if present
                        const parts = src.split(' "');
                        const url = parts[0];
                        const title = parts.length > 1 ? ' "' + parts[1] : '';
                        return `![${alt}](${basePath}${url}${title})`;
                    });

                    const { metadata, content } = parseFrontmatter(text);

                    return {
                        id: filename,
                        title: metadata.title || 'Untitled',
                        date: metadata.date || '',
                        tags: Array.isArray(metadata.tags) ? metadata.tags :
                            (metadata.tags ? [metadata.tags] : []),
                        summary: metadata.summary,
                        content: content
                    };
                } catch (error) {
                    console.warn(`Error loading ${filename}:`, error);
                    return null;
                }
            })
        );

        // Filter out null values and sort by date (newest first)
        blogPosts = posts
            .filter(post => post !== null)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        // If we're currently on the blog page, render the posts
        if (document.getElementById('blogPage').style.display !== 'none') {
            renderBlog();
        }

    } catch (error) {
        console.warn('Error loading blog posts:', error);
    }
}

// Setup navigation menu
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-button');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const page = button.getAttribute('data-page');
            if (page === 'blog') {
                window.location.hash = 'blog';
            } else {
                // Use history API to remove hash cleanly if possible, or just set to empty
                // Setting hash to '' leaves a '#' usually. 
                // Using pushState to clear it is cleaner but might not trigger hashchange if not careful.
                // Let's stick to simple hash assignment to trigger events reliably.
                window.location.hash = '';
            }
        });
    });

    // Handle hash changes for blog detail pages and main navigation
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check on initial load
}

// Handle URL hash changes for blog navigation
function handleHashChange() {
    const hash = window.location.hash;
    const cvPage = document.getElementById('cvPage');
    const blogPage = document.getElementById('blogPage');
    const blogDetailPage = document.getElementById('blogDetailPage');
    const navButtons = document.querySelectorAll('.nav-button');

    // Helper to update active nav button
    const updateNav = (pageName) => {
        navButtons.forEach(btn => {
            if (btn.getAttribute('data-page') === pageName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };

    if (hash && hash.startsWith('#blog/')) {
        // --- STATE: BLOG DETAIL ---
        const postId = hash.substring(6); // Remove '#blog/'
        cvPage.style.display = 'none';
        blogPage.style.display = 'none';
        blogDetailPage.style.display = 'block';

        updateNav('blog');
        showBlogDetail(postId);

    } else if (hash === '#blog') {
        // --- STATE: BLOG LIST ---
        cvPage.style.display = 'none';
        blogPage.style.display = 'block';
        blogDetailPage.style.display = 'none';

        updateNav('blog');
        renderBlog();

    } else {
        // --- STATE: PROFILE (DEFAULT) ---
        // Handles hash === '' or undefined or any unknown hash
        cvPage.style.display = 'block';
        blogPage.style.display = 'none';
        blogDetailPage.style.display = 'none';

        updateNav('cv');
        // No render function needed for CV as it is static HTML
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Extract excerpt from markdown content (first paragraph or first 300 characters)
// Extract excerpt from markdown content (first paragraph or first 300 characters)
function getExcerpt(post, maxLength = 300) {
    // 0. Use explicit summary if available
    if (post.summary) {
        return post.summary;
    }

    let content = post.content || '';

    // 1. Remove images (User requested plain text summary in list)
    // Matches ![alt](src "title") or ![alt](src) or <img ...>
    let text = content
        .replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '') // Remove markdown images
        .replace(/<img[^>]*>/g, ''); // Remove HTML images

    // 2. Remove markdown headers, code blocks, etc. for excerpt
    text = text
        .replace(/^#+\s+/gm, '') // Remove headers
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`[^`]+`/g, '') // Remove inline code
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert links to text
        .replace(/\*\*([^\*]+)\*\*/g, '$1') // Remove bold
        .replace(/\*([^\*]+)\*/g, '$1') // Remove italic
        .trim();

    // 3. Get first paragraph or first maxLength characters
    const paragraphs = text.split('\n\n');
    let firstParagraph = paragraphs[0] || text;

    // 4. Truncate if too long
    if (firstParagraph.length > maxLength) {
        return firstParagraph.substring(0, maxLength) + '...';
    }

    return firstParagraph;
}

// Pagination State
let currentPage = 1;
const itemsPerPage = 10;
let searchQuery = '';

// Handle Search
window.handleSearch = function (query) {
    searchQuery = query.toLowerCase().trim();
    currentPage = 1; // Reset to first page on search
    renderBlog();
};

// Render blog posts (list view with excerpts)
function renderBlog() {
    const container = document.getElementById('blogContainer');

    if (!blogPosts || blogPosts.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No blog posts yet. Check back soon!</p>';
        return;
    }

    // Filter posts based on search query
    const filteredPosts = blogPosts.filter(post => {
        if (!searchQuery) return true;

        const titleMatch = post.title.toLowerCase().includes(searchQuery);
        const summaryMatch = (post.summary || '').toLowerCase().includes(searchQuery);
        // Also search in tags
        const tagsMatch = post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchQuery));

        return titleMatch || summaryMatch || tagsMatch;
    });

    if (filteredPosts.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No posts found matching your search.</p>';
        renderPagination(0);
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedPosts = filteredPosts.slice(start, end);

    const postsHtml = paginatedPosts.map(post => {
        try {
            // Pass the whole post object to use summary if available
            const excerpt = getExcerpt(post);
            const excerptHtml = marked.parse(excerpt);
            const tagsHtml = post.tags ? post.tags.map(tag =>
                `<span class="blog-tag">${tag}</span>`
            ).join('') : '';

            return `
                <article class="blog-post-preview" data-post-id="${post.id}" onclick="navigateToBlogDetail('${post.id}')">
                    <div class="blog-post-header">
                        <h2 class="blog-post-title">${post.title}</h2>
                        <div class="blog-post-date">${formatDate(post.date)}</div>
                    </div>
                    ${tagsHtml ? `<div class="blog-tags">${tagsHtml}</div>` : ''}
                    <div class="blog-post-excerpt">${excerptHtml}</div>
                    <div class="blog-read-more">Read More →</div>
                </article>
            `;
        } catch (err) {
            console.error('Error rendering post:', post.title, err);
            return `<div class="error-post">Error loading post: ${post.title} <br><small>${err.toString()}</small></div>`;
        }
    }).join('');

    container.innerHTML = postsHtml;
    renderPagination(totalPages);
}

// Render pagination controls
function renderPagination(totalPages) {
    let paginationContainer = document.getElementById('blogPagination');

    // Create container if it doesn't exist
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'blogPagination';
        paginationContainer.className = 'blog-pagination';
        document.getElementById('blogPage').appendChild(paginationContainer);
    }

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let html = '';

    // Previous Button
    if (currentPage > 1) {
        html += `<button class="page-btn" onclick="changePage(${currentPage - 1})">← Previous</button>`;
    } else {
        html += `<button class="page-btn disabled" disabled>← Previous</button>`;
    }

    // Page Numbers (Optional, for now just prev/next as requested, effectively)
    // But let's add current page indicator
    html += `<span class="page-info">Page ${currentPage} of ${totalPages}</span>`;

    // Next Button
    if (currentPage < totalPages) {
        html += `<button class="page-btn" onclick="changePage(${currentPage + 1})">Next →</button>`;
    } else {
        html += `<button class="page-btn disabled" disabled>Next →</button>`;
    }

    paginationContainer.innerHTML = html;
}

// Handle page change
window.changePage = function (page) {
    currentPage = page;
    renderBlog();
    window.scrollTo(0, 0);
};

// Navigate to blog detail page
window.navigateToBlogDetail = function (postId) {
    window.location.hash = `blog/${postId}`;
};

// Show full blog post in detail page
function showBlogDetail(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) {
        // Post not found, go back to blog list
        window.location.hash = 'blog';
        return;
    }

    const titleEl = document.getElementById('blogDetailTitle');
    const dateEl = document.getElementById('blogDetailDate');
    const tagsEl = document.getElementById('blogDetailTags');
    const contentEl = document.getElementById('blogDetailContent');

    const tagsHtml = post.tags ? post.tags.map(tag =>
        `<span class="blog-tag">${tag}</span>`
    ).join('') : '';

    const fullContentHtml = marked.parse(post.content);

    if (titleEl) titleEl.textContent = post.title;
    if (dateEl) dateEl.textContent = formatDate(post.date);
    if (tagsEl) tagsEl.innerHTML = tagsHtml || '';
    if (contentEl) contentEl.innerHTML = fullContentHtml;

    // Scroll to top
    window.scrollTo(0, 0);
}

// Go back to blog list
window.goBackToBlog = function () {
    window.location.hash = 'blog';
};

// Initialize the page
function init() {
    updateProfile();
    renderEducation();
    renderExperience();
    renderPapers();
    renderAwards();
    renderTeaching();
    renderService();
    hideEmptySections();
}

// Update profile information
function updateProfile() {
    document.getElementById('profileName').textContent = profileData.name;
    document.getElementById('profileTitle').textContent = profileData.title;
    document.getElementById('aboutText').textContent = profileData.about;

    const contactInfo = document.getElementById('contactInfo');
    const contactLinks = [];

    if (profileData.contact.email) {
        contactLinks.push(`<a href="mailto:${profileData.contact.email}" class="contact-link" title="Email"><i class="fas fa-envelope"></i></a>`);
    }
    if (profileData.contact.website) {
        contactLinks.push(`<a href="${profileData.contact.website}" class="contact-link" target="_blank" title="Website"><i class="fas fa-globe"></i></a>`);
    }
    if (profileData.contact.github) {
        contactLinks.push(`<a href="${profileData.contact.github}" class="contact-link" target="_blank" title="GitHub"><i class="fab fa-github"></i></a>`);
    }
    if (profileData.contact.scholar) {
        contactLinks.push(`<a href="${profileData.contact.scholar}" class="contact-link" target="_blank" title="Google Scholar"><i class="fas fa-graduation-cap"></i></a>`);
    }
    if (profileData.contact.twitter) {
        contactLinks.push(`<a href="${profileData.contact.twitter}" class="contact-link" target="_blank" title="Twitter"><i class="fab fa-twitter"></i></a>`);
    }
    if (profileData.contact.linkedin) {
        contactLinks.push(`<a href="${profileData.contact.linkedin}" class="contact-link" target="_blank" title="LinkedIn"><i class="fab fa-linkedin"></i></a>`);
    }
    if (profileData.contact.bluesky) {
        contactLinks.push(`<a href="${profileData.contact.bluesky}" class="contact-link" target="_blank" title="Bluesky"><i class="fa-brands fa-bluesky"></i></a>`);
    }

    contactInfo.innerHTML = contactLinks.join('');
}

// Render papers
function renderPapers() {
    const container = document.getElementById('papersContainer');

    if (!profileData.papers || profileData.papers.length === 0) {
        return;
    }

    container.innerHTML = profileData.papers.map(paper => {
        const linksHtml = Object.entries(paper.links || {}).map(([type, url]) => {
            const labels = {
                pdf: 'PDF',
                arxiv: 'arXiv',
                code: 'Code',
                website: 'Website',
                video: 'Video',
                slides: 'Slides'
            };
            const isSecondary = type === 'code' || type === 'website' || type === 'video' || type === 'slides';
            return `<a href="${url}" class="paper-link ${isSecondary ? 'secondary' : ''}" target="_blank">${labels[type] || type}</a>`;
        }).join('');

        return `
            <div class="paper-item">
                <span class="paper-year">${paper.year}</span>
                <h3 class="paper-title">
                    ${paper.links?.pdf ? `<a href="${paper.links.pdf}" target="_blank">${paper.title}</a>` : paper.title}
                </h3>
                <p class="paper-authors">${paper.authors}</p>
                <p class="paper-venue">${paper.venue}</p>
                ${linksHtml ? `<div class="paper-links">${linksHtml}</div>` : ''}
            </div>
        `;
    }).join('');
}

// Render education
function renderEducation() {
    const container = document.getElementById('educationContainer');

    if (!profileData.education || profileData.education.length === 0) {
        return;
    }

    container.innerHTML = profileData.education.map(edu => {
        let html = `
        <div class="education-item">
            <div class="education-degree">${edu.degree}</div>
                <div class="education-institution">${edu.institution}${edu.location ? `, ${edu.location}` : ''}</div>
            <div class="education-year">${edu.year}</div>
        `;
        if (edu.thesis) {
            html += `<div class="education-thesis">Thesis: ${edu.thesis}</div>`;
        }
        if (edu.advisor) {
            html += `<div class="education-advisor">Advisor: ${edu.advisor}</div>`;
        }
        html += `</div>`;
        return html;
    }).join('');
}

// Render experience
function renderExperience() {
    const container = document.getElementById('experienceContainer');

    if (!profileData.experience || profileData.experience.length === 0) {
        return;
    }

    container.innerHTML = profileData.experience.map(exp => `
        <div class="experience-item">
            <div class="experience-header">
                <div class="experience-position">${exp.position}</div>
                <div class="experience-year">${exp.year}</div>
            </div>
            <div class="experience-institution">${exp.institution}${exp.location ? `, ${exp.location}` : ''}</div>
            ${exp.description ? `<div class="experience-description">${exp.description}</div>` : ''}
        </div>
    `).join('');
}

// Render awards
function renderAwards() {
    const container = document.getElementById('awardsContainer');

    if (!profileData.awards || profileData.awards.length === 0) {
        return;
    }

    container.innerHTML = profileData.awards.map(award => `
        <div class="award-item">
            <div class="award-header">
                <div class="award-title">${award.title}</div>
                <div class="award-year">${award.year}</div>
            </div>
            <div class="award-organization">${award.organization}</div>
            ${award.description ? `<div class="award-description">${award.description}</div>` : ''}
        </div>
    `).join('');
}

// Render teaching
function renderTeaching() {
    const container = document.getElementById('teachingContainer');

    if (!profileData.teaching || profileData.teaching.length === 0) {
        return;
    }

    container.innerHTML = profileData.teaching.map(teaching => `
        <div class="teaching-item">
            <div class="teaching-header">
                <div class="teaching-course">${teaching.course}</div>
                <div class="teaching-year">${teaching.year}</div>
            </div>
            <div class="teaching-role">${teaching.role}${teaching.institution ? `, ${teaching.institution}` : ''}</div>
            ${teaching.description ? `<div class="teaching-description">${teaching.description}</div>` : ''}
        </div>
    `).join('');
}

// Render service
function renderService() {
    const container = document.getElementById('serviceContainer');

    if (!profileData.service || profileData.service.length === 0) {
        return;
    }

    container.innerHTML = profileData.service.map(service => `
        <div class="service-item">
            <div class="service-header">
                <div class="service-role">${service.role}</div>
                <div class="service-year">${service.year}</div>
            </div>
            <div class="service-organization">${service.organization}</div>
            ${service.description ? `<div class="service-description">${service.description}</div>` : ''}
        </div>
    `).join('');
}

// Hide sections that have no content
function hideEmptySections() {
    const sections = [
        { id: 'educationSection', container: 'educationContainer' },
        { id: 'experienceSection', container: 'experienceContainer' },
        { id: 'papersSection', container: 'papersContainer' },
        { id: 'awardsSection', container: 'awardsContainer' },
        { id: 'teachingSection', container: 'teachingContainer' },
        { id: 'serviceSection', container: 'serviceContainer' }
    ];

    sections.forEach(({ id, container }) => {
        const section = document.getElementById(id);
        const containerEl = document.getElementById(container);
        if (containerEl && containerEl.innerHTML.trim() === '') {
            section.style.display = 'none';
        }
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadProfileData);

