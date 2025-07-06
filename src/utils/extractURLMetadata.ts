interface URLMetadata {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  siteName?: string;
}

// Real metadata extractor for React Native
class MetadataExtractor {
  private static cache = new Map<string, { data: URLMetadata; timestamp: number }>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static async extractMetadata(url: string): Promise<URLMetadata> {
    // Check cache first
    const cached = this.cache.get(url);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Validate URL
      if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
        return this.generateFallback(url);
      }

      // Handle YouTube specially (reliable API)
      const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^"&?/\s]{11})/i);
      if (youtubeMatch) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          
          const response = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeMatch[1]}&format=json`,
            { signal: controller.signal }
          );
          
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const metadata = {
              title: data.title || 'YouTube Video',
              description: `YouTube video by ${data.author_name || 'Unknown'}`,
              image: data.thumbnail_url?.replace('hqdefault', 'maxresdefault'),
              siteName: 'YouTube',
              favicon: 'https://www.youtube.com/favicon.ico',
            };
            this.cache.set(url, { data: metadata, timestamp: Date.now() });
            return metadata;
          }
        } catch (error) {
          console.warn('YouTube extraction failed:', error);
        }
      }

      // Handle GitHub specially (reliable API)
      if (url.includes('github.com')) {
        try {
          const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
          if (match) {
            const [, owner, repo] = match;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
              headers: { Accept: 'application/vnd.github.v3+json' },
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              const metadata = {
                title: data.full_name || `${owner}/${repo}`,
                description: data.description || 'GitHub repository',
                siteName: 'GitHub',
                favicon: 'https://github.com/favicon.ico',
              };
              this.cache.set(url, { data: metadata, timestamp: Date.now() });
              return metadata;
            }
          }
        } catch (error) {
          console.warn('GitHub extraction failed:', error);
        }
      }

      // Handle special platforms with better fallbacks
      if (url.includes('twitter.com') || url.includes('x.com')) {
        try {
          const tweetId = url.match(/status\/(\d+)/)?.[1];
          if (tweetId) {
            const metadata = {
              title: 'X (Twitter) Post',
              description: 'Social media post from X (formerly Twitter)',
              siteName: 'X',
              favicon: 'https://www.google.com/s2/favicons?domain=x.com&sz=32',
            };
            this.cache.set(url, { data: metadata, timestamp: Date.now() });
            return metadata;
          }
        } catch (error) {
          console.warn('X/Twitter extraction failed:', error);
        }
      }

      // Handle Reddit with better fallbacks
      if (url.includes('reddit.com')) {
        try {
          const subredditMatch = url.match(/\/r\/([^\/]+)/);
          const postMatch = url.match(/comments\/[^\/]+\/([^\/]+)/);
          
          let title = 'Reddit Post';
          let description = 'Discussion on Reddit';
          
          if (subredditMatch) {
            const subreddit = subredditMatch[1];
            title = `r/${subreddit} - Reddit`;
            description = `Discussion in r/${subreddit} community`;
          }
          
          if (postMatch) {
            const postTitle = postMatch[1].replace(/_/g, ' ');
            title = postTitle.charAt(0).toUpperCase() + postTitle.slice(1);
          }

          const metadata = {
            title,
            description,
            siteName: 'Reddit',
            favicon: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=32',
          };
          this.cache.set(url, { data: metadata, timestamp: Date.now() });
          return metadata;
        } catch (error) {
          console.warn('Reddit extraction failed:', error);
        }
      }

      // Handle Instagram with better fallbacks
      if (url.includes('instagram.com')) {
        try {
          const usernameMatch = url.match(/instagram\.com\/([^\/]+)/);
          let title = 'Instagram Post';
          let description = 'Photo or video shared on Instagram';
          
          if (usernameMatch && usernameMatch[1] !== 'p') {
            const username = usernameMatch[1];
            title = `@${username} on Instagram`;
            description = `Content shared by @${username} on Instagram`;
          }

          const metadata = {
            title,
            description,
            siteName: 'Instagram',
            favicon: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=32',
          };
          this.cache.set(url, { data: metadata, timestamp: Date.now() });
          return metadata;
        } catch (error) {
          console.warn('Instagram extraction failed:', error);
        }
      }

      // Handle Facebook with better fallbacks
      if (url.includes('facebook.com')) {
        try {
          let title = 'Facebook Post';
          let description = 'Content shared on Facebook';
          
          const usernameMatch = url.match(/facebook\.com\/([^\/]+)/);
          if (usernameMatch) {
            const username = usernameMatch[1];
            title = `${username} on Facebook`;
            description = `Content shared by ${username} on Facebook`;
          }

          const metadata = {
            title,
            description,
            siteName: 'Facebook',
            favicon: 'https://www.google.com/s2/favicons?domain=facebook.com&sz=32',
          };
          this.cache.set(url, { data: metadata, timestamp: Date.now() });
          return metadata;
        } catch (error) {
          console.warn('Facebook extraction failed:', error);
        }
      }

      // Handle LinkedIn with better fallbacks
      if (url.includes('linkedin.com')) {
        try {
          let title = 'LinkedIn Post';
          let description = 'Professional content shared on LinkedIn';
          
          if (url.includes('/in/')) {
            const profileName = url.split('/in/')[1]?.split(/[/?#]/)[0] || '';
            const formattedName = profileName
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            title = `${formattedName} | LinkedIn`;
            description = `Professional profile of ${formattedName} on LinkedIn`;
          } else if (url.includes('/company/')) {
            const companyName = url.split('/company/')[1]?.split(/[/?#]/)[0] || '';
            const formattedCompany = companyName
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            title = `${formattedCompany} | LinkedIn`;
            description = `${formattedCompany} company page on LinkedIn`;
          }

          const metadata = {
            title,
            description,
            siteName: 'LinkedIn',
            favicon: 'https://www.google.com/s2/favicons?domain=linkedin.com&sz=32',
          };
          this.cache.set(url, { data: metadata, timestamp: Date.now() });
          return metadata;
        } catch (error) {
          console.warn('LinkedIn extraction failed:', error);
        }
      }

      // Handle TikTok with better fallbacks
      if (url.includes('tiktok.com')) {
        try {
          const usernameMatch = url.match(/tiktok\.com\/@([^\/]+)/);
          let title = 'TikTok Video';
          let description = 'Short video content on TikTok';
          
          if (usernameMatch) {
            const username = usernameMatch[1];
            title = `@${username} on TikTok`;
            description = `Video by @${username} on TikTok`;
          }

          const metadata = {
            title,
            description,
            siteName: 'TikTok',
            favicon: 'https://www.google.com/s2/favicons?domain=tiktok.com&sz=32',
          };
          this.cache.set(url, { data: metadata, timestamp: Date.now() });
          return metadata;
        } catch (error) {
          console.warn('TikTok extraction failed:', error);
        }
      }

      // For other URLs, try direct fetch (React Native doesn't have CORS issues)
      let metadata: URLMetadata | undefined;
      try {
        console.log(`Trying direct fetch for ${url}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(url, { 
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LinkLibrary/1.0)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const html = await response.text();
          if (html && html.length > 100) {
            metadata = this.extractFromHTML(html, url);
            if (metadata.title) {
              this.cache.set(url, { data: metadata, timestamp: Date.now() });
              return metadata;
            }
          }
        }
      } catch (error) {
        console.log(`Direct fetch failed for ${url}:`, error);
      }

      // If direct fetch fails or no title, try Microlink API as fallback
      try {
        console.log(`Trying Microlink API for ${url}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
        const response = await fetch(microlinkUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (response.ok) {
          const { data } = await response.json();
          if (data && (data.title || data.description)) {
            const microlinkMetadata: URLMetadata = {
              title: data.title || undefined,
              description: data.description || undefined,
              image: data.image?.url || undefined,
              favicon: data.logo?.url || data.logo || undefined,
              siteName: data.publisher || data.source || undefined,
            };
            this.cache.set(url, { data: microlinkMetadata, timestamp: Date.now() });
            return microlinkMetadata;
          }
        }
      } catch (error) {
        console.log(`Microlink API failed for ${url}:`, error);
      }

      // If all else fails, return fallback
      const fallback = this.generateFallback(url);
      this.cache.set(url, { data: fallback, timestamp: Date.now() });
      return fallback;

    } catch (error) {
      console.warn('Metadata extraction failed:', error);
      const fallback = this.generateFallback(url);
      this.cache.set(url, { data: fallback, timestamp: Date.now() });
      return fallback;
    }
  }

  // Extract metadata from HTML using regex
  private static extractFromHTML(html: string, url: string): URLMetadata {
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

      // Extract description with multiple fallbacks
      let description =
        getMetaContent(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
        getMetaContent(/<meta\s+name=["']twitter:description["']\s+content=["']([^"']+)["']/i) ||
        getMetaContent(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
        getMetaContent(/<meta\s+content=["']([^"']+)["']\s+property=["']og:description["']/i) ||
        getMetaContent(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);

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

      const result = {
        title: cleanTitle || undefined,
        description: cleanDescription || undefined,
        image: image || undefined,
        siteName: siteName || undefined,
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`,
      };

      console.log(`Extracted metadata for ${url}:`, result);
      return result;
    } catch (error) {
      console.warn('HTML parsing failed:', error);
      return {};
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
      };

      const description = domainDescriptions[domain] || `Website from ${domain}`;
      const siteName = domain.split('.')[0];

      return {
        title: siteName.charAt(0).toUpperCase() + siteName.slice(1).replace(/[-_]/g, ' '),
        description: description,
        siteName: siteName,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      };
    } catch {
      return {
        title: 'External Link',
        description: 'External website',
        siteName: 'Unknown',
        favicon: undefined,
      };
    }
  }

  static clearCache(): void {
    this.cache.clear();
  }
}

// Main export function
export async function extractURLMetadata(url: string): Promise<URLMetadata> {
  return MetadataExtractor.extractMetadata(url);
}

// Export utilities
export function clearMetadataCache(): void {
  MetadataExtractor.clearCache();
}

// Export types
export type { URLMetadata }; 