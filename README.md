# Academic CV Profile - GitHub Pages

A comprehensive, modern academic CV profile page to showcase your research, publications, education, experience, and more. Perfect for researchers, academics, and graduate students. Hosted on GitHub Pages with zero dependencies.

## Features

- 📄 **Research Papers**: Display publications with links to PDFs, arXiv, code repositories, project websites, videos, and slides
- 🎓 **Education**: Showcase your academic degrees with institutions, locations, thesis titles, and advisors
- 💼 **Experience**: Highlight your professional and research positions
- 🏆 **Awards & Honors**: Display your achievements and recognitions
- 📚 **Teaching**: List courses you've taught or assisted with
- 🤝 **Service**: Showcase your academic service (reviewing, committees, etc.)
- 📝 **Microblogging**: Blog section that reads markdown files from the `blog/` folder
- 📱 **Responsive Design**: Works beautifully on all devices (desktop, tablet, mobile)
- 🎨 **Modern Styling**: Clean, professional design with smooth animations
- ⚡ **Fast & Lightweight**: Pure HTML, CSS, and JavaScript - no frameworks or dependencies
- 🔍 **SEO Friendly**: Proper meta tags and semantic HTML

## Quick Start

### 1. Update Your Information

Edit the `script.js` file and update the `profileData` object with your information:

```javascript
const profileData = {
    name: "Your Name",
    title: "Researcher | Academic",
    contact: {
        email: "your.email@example.com",
        github: "https://github.com/yourusername",
        scholar: "https://scholar.google.com/citations?user=...",
        twitter: "https://twitter.com/yourusername",  // Optional
        linkedin: "https://linkedin.com/in/yourusername",  // Optional
        website: "https://yourwebsite.com"  // Optional
    },
    about: "Your research interests and background...",
    // ... add your data here
};
```

### 2. Enable GitHub Pages

1. **Push to GitHub**: 
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Academic CV profile"
   git remote add origin https://github.com/yourusername/profile.git
   git push -u origin main
   ```

2. **Enable Pages**:
   - Go to your repository on GitHub
   - Click on **Settings** → **Pages** (in the left sidebar)
   - Under **Source**, select your branch (usually `main` or `master`)
   - Click **Save**
   - Your site will be available at `https://yourusername.github.io/profile/` (or `https://yourusername.github.io/repository-name/`)

   ⚠️ **Note**: It may take a few minutes for the site to be available after enabling.

### 3. Custom Domain (Optional)

If you want to use a custom domain (e.g., `yourname.com`):

1. Create a `CNAME` file in the root directory:
   ```
   yourname.com
   ```

2. Configure your DNS settings:
   - Add a CNAME record pointing `yourname.com` to `yourusername.github.io`
   - Or add A records pointing to GitHub's IP addresses (see [GitHub Pages docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site))

## Data Structure Guide

### Education

```javascript
education: [
    {
        degree: "Ph.D. in Computer Science",
        institution: "University Name",
        location: "City, Country",  // Optional
        year: "2020 - 2024",
        thesis: "Thesis Title",  // Optional
        advisor: "Advisor Name"  // Optional
    }
]
```

### Experience

```javascript
experience: [
    {
        position: "Postdoctoral Researcher",
        institution: "University Name",
        location: "City, Country",  // Optional
        year: "2024 - Present",
        description: "Brief description of your role..."  // Optional
    }
]
```

### Research Papers

```javascript
papers: [
    {
        title: "Paper Title",
        authors: "Your Name, Co-Author 1, Co-Author 2",
        venue: "Conference/Journal Name",
        year: 2024,
        links: {
            pdf: "https://example.com/paper.pdf",
            arxiv: "https://arxiv.org/abs/xxxx.xxxxx",
            code: "https://github.com/yourusername/project",
            website: "https://example.com/project",
            video: "https://youtube.com/watch?v=...",  // Optional
            slides: "https://example.com/slides.pdf"  // Optional
        }
    }
]
```

**Available link types**: `pdf`, `arxiv`, `code`, `website`, `video`, `slides`

### Awards

```javascript
awards: [
    {
        title: "Best Paper Award",
        organization: "Conference Name",
        year: 2024,
        description: "Optional description"  // Optional
    }
]
```

### Teaching

```javascript
teaching: [
    {
        course: "Introduction to Machine Learning",
        role: "Teaching Assistant",
        institution: "University Name",  // Optional
        year: "Fall 2023",
        description: "Optional description"  // Optional
    }
]
```

### Service

```javascript
service: [
    {
        role: "Program Committee Member",
        organization: "Conference Name",
        year: "2024",
        description: "Optional description"  // Optional
    }
]
```

## Customization

### Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #2563eb;      /* Main accent color */
    --primary-dark: #1e40af;       /* Darker shade for hover */
    --text-primary: #1f2937;       /* Main text color */
    --text-secondary: #6b7280;     /* Secondary text color */
    --bg-color: #ffffff;           /* Background color */
    --bg-light: #f9fafb;           /* Light background for cards */
    --border-color: #e5e7eb;       /* Border color */
}
```

### Fonts

Change the Google Fonts import in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### Layout

- Modify the HTML structure in `index.html`
- Adjust section order by rearranging the `<section>` elements
- Sections with no data are automatically hidden

## File Structure

```
profile/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── script.js           # Profile data and rendering logic
├── .nojekyll          # Prevents Jekyll processing (for GitHub Pages)
└── README.md          # This file
```

## Blog Posts

The blog feature reads markdown files from the `blog/` folder. To add a new blog post:

1. **Create a markdown file** in the `blog/` folder with a date prefix:
   ```
   blog/2024-01-20-my-post-title.md
   ```

2. **Add frontmatter** at the top of the file:
   ```markdown
   ---
   title: "Your Post Title"
   date: "2024-01-20"
   tags: ["research", "updates"]
   ---
   
   # Your Post Title
   
   Your markdown content here...
   ```

3. **Add the filename** to `blog-index.json`:
   ```json
   [
       "2024-01-20-my-post-title.md",
       "2024-01-15-another-post.md"
   ]
   ```

4. **Write your content** using markdown (headers, lists, links, code blocks, etc.)

The blog posts are automatically sorted by date (newest first). See `blog/TEMPLATE.md` for a template.

## Tips

- **Keep it updated**: Regularly update your publications and achievements
- **Use relative links**: For local PDFs, use relative paths (e.g., `papers/paper.pdf`)
- **Optimize images**: If you add a profile photo, compress it for web
- **Test locally**: Open `index.html` in a browser to preview before pushing
- **Mobile-friendly**: The design is responsive, but test on different devices
- **Blog posts**: Use descriptive filenames with dates for easy organization

## Troubleshooting

### Site not loading on GitHub Pages
- Check that you've enabled Pages in repository settings
- Ensure your branch is named `main` or `master`
- Wait a few minutes after enabling - it takes time to build
- Check the Actions tab for any build errors

### Sections not showing
- Make sure you've added data to the arrays in `script.js`
- Check the browser console for JavaScript errors
- Empty sections are automatically hidden

### Styling issues
- Clear your browser cache
- Check that `styles.css` is properly linked in `index.html`

## License

Feel free to use this template for your own academic CV profile! No attribution required, but a link back is always appreciated.

## Contributing

Found a bug or have a feature request? Feel free to open an issue or submit a pull request!

---

**Made with ❤️ for the academic community**

