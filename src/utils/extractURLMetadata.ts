type URLMetadata = {
  description?: string;
  favicon?: string;
  image?: string;
  siteName?: string;
  title?: string;
}

// Real metadata extractor that actually scrapes websites - React Native version
class MetadataExtractor {
  private static cache = new Map<string, { data: URLMetadata; timestamp: number }>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // React Native doesn't have CORS issues, so we can fetch directly
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
          const html = await response.text();
          if (html && html.length > 100) {
            // Debug: check if HTML contains meta description
            if (url.includes('youtube.com')) {
              const hasMetaDesc = html.includes('<meta name="description"');
              const hasOgTitle = html.includes('og:title');
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

  private static async fetchDirectly(url: string): Promise<null | Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => { controller.abort(); }, 8000);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return response;
      }
    } catch {
    }

    return null;
  }

  private static async getFavicon(url: string): Promise<string> {
    try {
      // React Native's URL doesn't have hostname property, extract it manually
      const urlMatch = /^https?:\/\/([^/]+)/.exec(url);
      const domain = urlMatch ? urlMatch[1] : 'unknown';
      
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
      if (url.includes('youtube.com') && (!description || description === 'Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.')) {
          
          // Try multiple patterns to extract video description
          const descriptionPatterns = [
            /"shortdescription":"([^"]+)"/i,
            /"description":{"simpletext":"([^"]+)"}/i,
            /"videodetails":[^}]*"shortdescription":"([^"]+)"/i,
            /"content":"([^"]+)"[^}]*"videoprimaryinforenderer"/i,
            /"expandeddescriptionbodytext":[^}]*"simpletext":"([^"]+)"/i,
            /"attributeddescriptionbodytext":[^}]*"content":"([^"]+)"/i
          ];
          
          for (const pattern of descriptionPatterns) {
            const match = html.match(pattern);
            if (match && match[1] && match[1].trim() && match[1].length > 10) {
              description = match[1]
                .replaceAll(String.raw`\n`, '\n')
                .replaceAll(String.raw`\"`, '"')
                .replaceAll('\\\\', '\\')
                .replaceAll(/\\u\w{4}/gi, '')
                .trim();
              
              // Limit length for mobile display
              if (description.length > 200) {
                description = description.slice(0, 197) + '...';
              }
              
              break;
            }
          }
        }

      // If no description found in meta tags, try to extract from main content
      if (!description) {
        // Try to find main content
        const mainContentMatch = (/<main[^>]*>([^]*?)<\/main>/i.exec(html)) ||
          (/<article[^>]*>([^]*?)<\/article>/i.exec(html)) ||
          (/<div[^>]*?(?:class|id)=["'](?:main|content|article)[^>]*>([^]*?)<\/div>/i.exec(html));

        if (mainContentMatch) {
          // Extract text from the first paragraph or div
          const firstParagraph = (/<p[^>]*>([^<]+)<\/p>/i.exec(mainContentMatch[1])) ||
            (/<div[^>]*>([^<]+)<\/div>/i.exec(mainContentMatch[1]));
          
          if (firstParagraph) {
            description = firstParagraph[1].trim();
            // Limit description length
            if (description.length > 200) {
              description = description.slice(0, 197) + '...';
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
      const urlMatch = /^https?:\/\/([^/]+)/.exec(url);
      const hostname = urlMatch ? urlMatch[1] : 'unknown';
      
      const siteName =
        getMetaContent(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i) ||
        getMetaContent(/<meta\s+content=["']([^"']+)["']\s+property=["']og:site_name["']/i) ||
        hostname.replace("www.", "") ||
        undefined;

      // Clean up title and description
      let cleanTitle = title;
      let cleanDescription = description;

      if (cleanTitle) {
        cleanTitle = cleanTitle.replace(/\s*[|–\-]\s*[^|–\-]*$/, "").trim();
        cleanTitle = cleanTitle
          .replaceAll('&amp;', "&")
          .replaceAll('&lt;', "<")
          .replaceAll('&gt;', ">")
          .replaceAll('&quot;', '"')
          .replaceAll('&#39;', "'")
          .replaceAll('&#x27;', "'")
          .replaceAll('&nbsp;', " ")
          .replaceAll('&hellip;', "...")
          .replaceAll('&mdash;', "—")
          .replaceAll('&ndash;', "–");
      }

      if (cleanDescription) {
        cleanDescription = cleanDescription
          .replaceAll('&amp;', "&")
          .replaceAll('&lt;', "<")
          .replaceAll('&gt;', ">")
          .replaceAll('&quot;', '"')
          .replaceAll('&#39;', "'")
          .replaceAll('&#x27;', "'")
          .replaceAll('&nbsp;', " ")
          .replaceAll('&hellip;', "...")
          .replaceAll('&mdash;', "—")
          .replaceAll('&ndash;', "–");
      }

      // Get favicon with new method
      const favicon = await this.getFavicon(url);

      const result = {
        description: cleanDescription || undefined,
        favicon,
        image: image || undefined,
        siteName: siteName || undefined,
        title: cleanTitle || undefined,
      };

      return result;
    } catch (error) {
      console.warn('HTML parsing failed:', error);
      return this.generateFallback(url);
    }
  }

  // Generate fallback only when extraction completely fails
  static clearCache(): void {
    this.cache.clear();
  }

  private static generateFallback(url: string): URLMetadata {
    try {
      // React Native's URL doesn't have hostname property, extract it manually
      const urlMatch = /^https?:\/\/([^/]+)/.exec(url);
      const hostname = urlMatch ? urlMatch[1] : 'unknown';
      const domain = hostname.replace('www.', '');

      // Smart fallbacks for known domains
      const domainDescriptions: Record<string, string> = {
        'amazon.com': 'Amazon product page',
        'apple.com': 'Apple product or service',
        'bbc.com': 'News article from BBC',
        'clockandzones.com': 'Clock and Zones - World time zones',
        'cnn.com': 'News article from CNN',
        'edition.cnn.com': 'News article from CNN',
        'facebook.com': 'Facebook page or post',
        'github.com': 'GitHub repository or page',
        'google.com': 'Google search or service',
        'instagram.com': 'Instagram post',
        'linkedin.com': 'LinkedIn profile or post',
        'linklibrary.ai': 'LinkLibrary - Organize and manage your links',
        'medium.com': 'Medium article',
        'microsoft.com': 'Microsoft product or service',
        'netflix.com': 'Netflix content',
        'netlify.com': 'Netlify deployment or service',
        'nytimes.com': 'Article from The New York Times',
        'playwright.dev': 'Fast and reliable end-to-end testing for modern web apps',
        'reddit.com': 'Reddit post or discussion',
        'spotify.com': 'Spotify music or podcast',
        'stackoverflow.com': 'Stack Overflow question or answer',
        'tiktok.com': 'TikTok video',
        'twitter.com': 'Twitter post',
        'vercel.com': 'Vercel deployment or service',
        'wikipedia.org': 'Wikipedia article',
        'x.com': 'X (Twitter) post',
        'youtu.be': 'YouTube video',
        'youtube.com': 'YouTube video',
      };

      const description = domainDescriptions[domain] || `Website from ${domain}`;
      const siteName = domain.split('.')[0];

      // Special title fallbacks for known domains
      const domainTitles: Record<string, string> = {
        'playwright.dev': 'Fast and reliable end-to-end testing for modern web apps',
      };

      const title = domainTitles[domain] || siteName.charAt(0).toUpperCase() + siteName.slice(1).replaceAll(/[_-]/g, ' ');

      return {
        description: description,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        siteName: siteName,
        title: title,
      };
    } catch {
      return {
        description: 'External website',
        favicon: 'https://www.google.com/s2/favicons?domain=unknown&sz=32',
        siteName: 'Unknown',
        title: 'External Link',
      };
    }
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