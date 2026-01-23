# Google Search Console Setup Guide for PicLoreAI

## Step 1: Create/Access Google Search Console

1. Go to https://search.google.com/search-console
2. Sign in with your Google account (preferably the one you use for Google Analytics)
3. If first time, you'll be prompted to add a property

## Step 2: Add Your Property

### Option A: Domain Property (Recommended)
- Select "Domain" when prompted
- Enter: `picloreai.com` (no https://, no www)
- Click "Continue"
- You'll need to verify via DNS record (instructions below)

### Option B: URL Prefix Property
- Select "URL prefix"
- Enter: `https://picloreai.com` (include https://)
- Click "Continue"
- Multiple verification options available

### DNS Verification (For Domain Property)
1. Google will provide a TXT record that looks like: `google-site-verification=xxxxxxxxxxxxx`
2. Go to your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.)
3. Add a TXT record to your DNS:
   - Type: TXT
   - Host/Name: @ (or leave blank)
   - Value: The code Google provided
   - TTL: 3600 (or default)
4. Wait 5-60 minutes for DNS propagation
5. Return to Google Search Console and click "Verify"

## Step 3: Submit Your Sitemap

### First, Ensure You Have a Sitemap
For Next.js sites, add to your `next.config.js` or use a package like `next-sitemap`.

Your sitemap should be accessible at: `https://picloreai.com/sitemap.xml`

### Submit to GSC:
1. In GSC, go to "Sitemaps" in the left sidebar
2. Enter `sitemap.xml` in the "Add a new sitemap" field
3. Click "Submit"
4. Status should show "Success" after Google processes it

## Step 4: Initial Configuration

### Request Indexing of Important Pages
1. Go to "URL Inspection" in the left sidebar
2. Enter your homepage URL: `https://picloreai.com`
3. Click "Request Indexing"
4. Repeat for key pages:
   - `/pricing`
   - `/features` (if you have it)
   - `/blog` (once you publish blogs)

### Set Geographic Target (Optional)
1. Go to "Settings" > "International Targeting"
2. If your audience is primarily one country, select it
3. For global audience, leave it unset

## Step 5: Weekly Monitoring Tasks

### Check Performance
1. Go to "Performance" in the left sidebar
2. Set date range to "Last 28 days"
3. Review:
   - **Total clicks** - People who visited from Google
   - **Total impressions** - Times you appeared in search results
   - **Average CTR** - Click-through rate (aim for 2%+)
   - **Average position** - Your ranking (lower is better)

### Review Queries
1. In "Performance", click the "Queries" tab
2. See what keywords you're ranking for
3. **Action items:**
   - Keywords ranking 11-20: Create more content targeting these
   - High impressions, low CTR: Improve title tags and meta descriptions
   - New keywords appearing: Validate your content is matching intent

### Check Pages
1. In "Performance", click the "Pages" tab
2. See which pages get the most traffic
3. Identify pages with high impressions but low clicks

## Step 6: Fix Issues (Coverage/Indexing)

### Check Indexing Status
1. Go to "Pages" (formerly "Coverage") in the left sidebar
2. Review the chart showing:
   - **Indexed** - Pages Google has successfully indexed
   - **Not indexed** - Pages Google knows about but hasn't indexed

### Common Issues and Fixes

**"Discovered - currently not indexed"**
- Google found the page but hasn't crawled it yet
- Action: Wait, or request indexing manually for important pages

**"Crawled - currently not indexed"**
- Google crawled but decided not to index
- Action: Improve content quality, ensure it's not thin/duplicate

**"Duplicate without user-selected canonical"**
- Google sees duplicate content
- Action: Set canonical tags properly

**"Blocked by robots.txt"**
- Your robots.txt is blocking Google
- Action: Review and update robots.txt

**"404 Not Found"**
- Broken links
- Action: Fix links or set up redirects

## Step 7: Core Web Vitals

1. Go to "Core Web Vitals" in the left sidebar
2. Review mobile and desktop scores
3. Key metrics:
   - **LCP (Largest Contentful Paint)** - Should be <2.5s
   - **FID (First Input Delay)** - Should be <100ms
   - **CLS (Cumulative Layout Shift)** - Should be <0.1

### If You Have Issues:
- Click on specific issues to see affected URLs
- Use PageSpeed Insights for detailed recommendations
- Common fixes: optimize images, reduce JavaScript, preload fonts

## Step 8: Mobile Usability

1. Go to "Mobile Usability" in the left sidebar
2. Check for any errors
3. Common issues:
   - Content wider than screen
   - Clickable elements too close together
   - Text too small to read

## Step 9: Security Issues

1. Go to "Security & Manual Actions" in the left sidebar
2. Check "Security issues" - should show "No issues detected"
3. Check "Manual actions" - should show "No issues detected"

If issues exist, Google will provide specific guidance.

## Step 10: Set Up Email Notifications

1. Go to "Settings" (gear icon in the top right)
2. Under "Email preferences", enable notifications for:
   - Coverage issues
   - Performance changes
   - Security issues

This ensures you're notified of problems immediately.

---

## Monthly SEO Tasks

### 1. Content Audit (Monthly)
- Check which blog posts are getting traffic
- Update underperforming content
- Identify new keyword opportunities

### 2. Position Tracking (Monthly)
- Export your top 50 keywords
- Track position changes month-over-month
- Celebrate improvements, investigate drops

### 3. Backlink Check (Monthly)
- Go to "Links" in the left sidebar
- See which sites link to you
- Identify opportunities for more backlinks

### 4. Technical Check (Monthly)
- Review Coverage for new issues
- Check Core Web Vitals
- Ensure sitemap is up to date

---

## Blog Publishing Workflow

When you publish each blog post:

1. **Publish the blog** on your site
2. **Submit URL** in Google Search Console:
   - Go to "URL Inspection"
   - Enter the new blog URL
   - Click "Request Indexing"
3. **Update sitemap** if not automatic
4. **Share on social media** (social signals help)
5. **Wait 1-2 weeks** for indexing
6. **Check performance** in GSC

---

## Quick Reference: Key Metrics to Track

| Metric | Target | Check Frequency |
|--------|--------|-----------------|
| Total indexed pages | All important pages | Weekly |
| Organic clicks | Growing | Weekly |
| Average position | <20 for target keywords | Weekly |
| Core Web Vitals | All "Good" | Monthly |
| Coverage errors | 0 critical | Weekly |

---

## Troubleshooting Common Problems

### "My site isn't showing up in Google"
1. Check if indexed: `site:picloreai.com` in Google
2. If not indexed, verify GSC setup is complete
3. Submit sitemap
4. Request indexing for homepage
5. Wait 1-2 weeks

### "My rankings dropped suddenly"
1. Check "Manual Actions" for penalties
2. Review "Coverage" for crawling issues
3. Check if algorithm update occurred
4. Review recent site changes

### "New pages aren't being indexed"
1. Check they're in your sitemap
2. Request indexing manually
3. Check for noindex tags
4. Ensure internal links point to them
5. Check robots.txt isn't blocking

### "CTR is very low"
1. Review title tags (make them compelling)
2. Review meta descriptions (include call to action)
3. Check if rich snippets are possible
4. Compare your result to competitors

---

## Timeline to 500 Weekly Visitors

With the 20 blog posts and proper GSC setup:

**Month 1:**
- Set up GSC ✓
- Publish 8 blog posts
- Submit all URLs for indexing
- Expected traffic: 25-50/week

**Month 2:**
- Publish remaining 12 blog posts
- Monitor initial rankings
- Optimize underperforming posts
- Expected traffic: 75-150/week

**Month 3:**
- Continue monitoring
- Build backlinks
- Update existing content
- Expected traffic: 150-300/week

**Month 4-6:**
- Content starts compounding
- Rankings improve
- Expected traffic: 300-600/week

**Key success factors:**
1. Consistent publishing (2 posts/week)
2. Quality over quantity
3. Regular GSC monitoring
4. Quick fixes for issues
5. Patience (SEO takes time)

---

## Need Help?

- GSC Documentation: https://support.google.com/webmasters
- Search Central Blog: https://developers.google.com/search/blog
- Search Central YouTube: https://www.youtube.com/c/GoogleSearchCentral
