import { extractURLMetadata } from './extractURLMetadata';

// Simple test function to verify metadata extraction
export async function testMetadataExtraction() {
  console.log('Testing metadata extraction...');
  
  const testUrls = [
    'https://github.com/facebook/react',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://twitter.com/elonmusk/status/123456789',
    'https://medium.com/@username/article-title',
    'https://example.com'
  ];

  for (const url of testUrls) {
    try {
      console.log(`\nTesting: ${url}`);
      const metadata = await extractURLMetadata(url);
      console.log('Result:', metadata);
    } catch (error) {
      console.error(`Error extracting metadata for ${url}:`, error);
    }
  }
}

// Function is already exported above 