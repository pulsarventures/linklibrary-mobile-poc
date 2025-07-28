interface URLMetadata {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  siteName?: string;
}

// Real metadata extractor that actually scrapes websites - React Native version
class MetadataExtractor {
  private static cache = new Map<string, { data: URLMetadata; timestamp: number }>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // React Native doesn't have CORS issues, so we can fetch directly
  private static async fetchDirectly(url: string): Promise<Response | null> {
    try {
      console.log(`Trying direct fetch for ${url}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => { controller.abort(); }, 8000);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.log('Direct fetch failed:', error);
    }

    return null;
  }

  public static async extract(url: string): Promise<URLMetadata> {
    try {
      // Check cache first
      const cached = this.cache.get(url);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      // Try to fetch metadata directly (React Native advantage)
      const response = await this.fetchDirectly(url);
      
      if (response) {
        try {
          let html = await response.text();
          if (html && html.length > 100) {
            // Debug: check if HTML contains meta description
            if (url.includes('youtube.com')) {
              const hasMetaDesc = html.includes('<meta name="description"');
              const hasOgTitle = html.includes('og:title');
              console.log(`YouTube debug - Meta desc: ${hasMetaDesc}, OG title: ${hasOgTitle}`);
            }
            const metadata = await this.extractFromHTML(html, url);
            if (metadata.title) {
              this.cache.set(url, { data: metadata, timestamp: Date.now() });
            }
            return metadata;
          }
        } catch (error) {
          console.warn('Failed to parse HTML:', error);
        }
      }

      // If all else fails, generate fallback
      return this.generateFallback(url);
    } catch (error) {
      console.error('Metadata extraction failed:', error);
      return this.generateFallback(url);
    }
  }

  private static async getFavicon(url: string): Promise<string> {
    try {
      const domain = new URL(url).hostname;
      // Use Google's favicon service - it always returns a default icon if none found
      const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
      return googleFaviconUrl;
    } catch (error) {
      console.warn('Failed to get favicon:', error);
      return 'https://www.google.com/s2/favicons?domain=unknown&sz=32'; // Fallback
    }
  }

  // Extract metadata from HTML - same logic as web app
  private static async extractFromHTML(html: string, url: string): Promise<URLMetadata> {
    try {
      // Helper functions for extraction with more robust patterns
      const getMetaContent = (pattern: RegExp): string | undefined => {
        const match = html.match(pattern);
        return match?.[1]?.trim() || undefined;
      };

      const getText = (pattern: RegExp): string | undefined => {
        const match = html.match(pattern);
        return match?.[1]?.trim() || undefined;
      };

      // Extract title with multiple fallbacks
      const title =
        getMetaContent(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
        getMetaContent(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i) ||
        getMetaContent(/<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i) ||
        getMetaContent(/<meta\s+content=["']([^"']+)["']\s+name=["']twitter:title["']/i) ||
        getText(/<title[^>]*>([^<]+)<\/title>/i) ||
        getText(/<h1[^>]*>([^<]+)<\/h1>/i) ||
        undefined;

      // Extract description with multiple fallbacks including main content
      let description =
        getMetaContent(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
        getMetaContent(/<meta\s+name=["']twitter:description["']\s+content=["']([^"']+)["']/i) ||
        getMetaContent(/<meta\s+name=["']description["']\s+content=["']([^"']*?)["']/i) ||
        getMetaContent(/<meta\s+content=["']([^"']+)["']\s+property=["']og:description["']/i) ||
        getMetaContent(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);

      // For YouTube specifically, try to extract video description from JSON data
      if (url.includes('youtube.com')) {
        if (!description || description === 'Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.') {
          console.log('Extracting YouTube video description from page data...');
          
          // Try multiple patterns to extract video description
          const descriptionPatterns = [
            /"shortDescription":"([^"]+)"/i,
            /"description":{"simpleText":"([^"]+)"}/i,
            /"videoDetails":[^}]*"shortDescription":"([^"]+)"/i,
            /"content":"([^"]+)"[^}]*"videoPrimaryInfoRenderer"/i,
            /"expandedDescriptionBodyText":[^}]*"simpleText":"([^"]+)"/i,
            /"attributedDescriptionBodyText":[^}]*"content":"([^"]+)"/i
          ];
          
          for (const pattern of descriptionPatterns) {
            const match = html.match(pattern);
            if (match && match[1] && match[1].trim() && match[1].length > 10) {
              description = match[1]
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\')
                .replace(/\\u[\d\w]{4}/gi, '')
                .trim();
              
              // Limit length for mobile display
              if (description.length > 200) {
                description = description.substring(0, 197) + '...';
              }
              
              console.log('Found YouTube description:', description.substring(0, 100) + '...');
              break;
            }
          }
        }
      }

      // If no description found in meta tags, try to extract from main content
      if (!description) {
        // Try to find main content
        const mainContentMatch = html.match(/<main[^>]*>([^]*?)<\/main>/i) ||
          html.match(/<article[^>]*>([^]*?)<\/article>/i) ||
          html.match(/<div[^>]*?(?:class|id)=["'](?:main|content|article)[^>]*>([^]*?)<\/div>/i);

        if (mainContentMatch) {
          // Extract text from the first paragraph or div
          const firstParagraph = mainContentMatch[1].match(/<p[^>]*>([^<]+)<\/p>/i) ||
            mainContentMatch[1].match(/<div[^>]*>([^<]+)<\/div>/i);
          
          if (firstParagraph) {
            description = firstParagraph[1].trim();
            // Limit description length
            if (description.length > 200) {
              description = description.substring(0, 197) + '...';
            }
          }
        }
      }

      // Extract image with more robust patterns
      const image =
        getMetaContent(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
        getMetaContent(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i) ||
        getMetaContent(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i) ||
        undefined;

      // Extract site name
      const siteName =
        getMetaContent(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i) ||
        getMetaContent(/<meta\s+content=["']([^"']+)["']\s+property=["']og:site_name["']/i) ||
        new URL(url).hostname.replace("www.", "") ||
        undefined;

      // Clean up title and description
      let cleanTitle = title;
      let cleanDescription = description;

      if (cleanTitle) {
        cleanTitle = cleanTitle.replace(/\s*[|\-–]\s*[^|\-–]*$/, "").trim();
        cleanTitle = cleanTitle
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&#x27;/g, "'")
          .replace(/&nbsp;/g, " ")
          .replace(/&hellip;/g, "...")
          .replace(/&mdash;/g, "—")
          .replace(/&ndash;/g, "–");
      }

      if (cleanDescription) {
        cleanDescription = cleanDescription
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&#x27;/g, "'")
          .replace(/&nbsp;/g, " ")
          .replace(/&hellip;/g, "...")
          .replace(/&mdash;/g, "—")
          .replace(/&ndash;/g, "–");
      }

      // Get favicon with new method
      const favicon = await this.getFavicon(url);

      const result = {
        title: cleanTitle || undefined,
        description: cleanDescription || undefined,
        image: image || undefined,
        siteName: siteName || undefined,
        favicon,
      };

      console.log(`Extracted metadata for ${url}:`, result);
      return result;
    } catch (error) {
      console.warn('HTML parsing failed:', error);
      return this.generateFallback(url);
    }
  }

  // Generate fallback only when extraction completely fails
  private static generateFallback(url: string): URLMetadata {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');

      // Smart fallbacks for known domains
      const domainDescriptions: Record<string, string> = {
        'cnn.com': 'News article from CNN',
        'edition.cnn.com': 'News article from CNN',
        'bbc.com': 'News article from BBC',
        'nytimes.com': 'Article from The New York Times',
        'github.com': 'GitHub repository or page',
        'stackoverflow.com': 'Stack Overflow question or answer',
        'reddit.com': 'Reddit post or discussion',
        'twitter.com': 'Twitter post',
        'x.com': 'X (Twitter) post',
        'linkedin.com': 'LinkedIn profile or post',
        'medium.com': 'Medium article',
        'youtube.com': 'YouTube video',
        'youtu.be': 'YouTube video',
        'wikipedia.org': 'Wikipedia article',
        'amazon.com': 'Amazon product page',
        'google.com': 'Google search or service',
        'facebook.com': 'Facebook page or post',
        'instagram.com': 'Instagram post',
        'tiktok.com': 'TikTok video',
        'netflix.com': 'Netflix content',
        'spotify.com': 'Spotify music or podcast',
        'apple.com': 'Apple product or service',
        'microsoft.com': 'Microsoft product or service',
        'vercel.com': 'Vercel deployment or service',
        'netlify.com': 'Netlify deployment or service',
        'linklibrary.ai': 'LinkLibrary - Organize and manage your links',
        'clockandzones.com': 'Clock and Zones - World time zones',
        'playwright.dev': 'Fast and reliable end-to-end testing for modern web apps',
      };

      const description = domainDescriptions[domain] || `Website from ${domain}`;
      const siteName = domain.split('.')[0];

      // Special title fallbacks for known domains
      const domainTitles: Record<string, string> = {
        'playwright.dev': 'Fast and reliable end-to-end testing for modern web apps',
      };

      const title = domainTitles[domain] || siteName.charAt(0).toUpperCase() + siteName.slice(1).replace(/[-_]/g, ' ');

      return {
        title: title,
        description: description,
        siteName: siteName,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      };
    } catch {
      return {
        title: 'External Link',
        description: 'External website',
        siteName: 'Unknown',
        favicon: 'https://www.google.com/s2/favicons?domain=unknown&sz=32',
      };
    }
  }

  static clearCache(): void {
    this.cache.clear();
  }
}

// Main export function
export async function extractURLMetadata(url: string): Promise<URLMetadata> {
  return MetadataExtractor.extract(url);
}

// Export utilities
export function clearMetadataCache(): void {
  MetadataExtractor.clearCache();
}

// Export types
export type { URLMetadata };