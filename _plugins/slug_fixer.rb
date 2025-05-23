module Jekyll
  # Plugin to ensure all documents have valid slugs
  class SlugFixer < Jekyll::Generator
    priority :high
    
    def generate(site)
      # Fix slugs for all posts
      site.posts.docs.each do |post|
        ensure_slug(post)
      end
      
      # Fix slugs for all pages
      site.pages.each do |page|
        ensure_slug(page)
      end
      
      # Fix slugs for all collection documents
      site.collections.each do |name, collection|
        collection.docs.each do |doc|
          ensure_slug(doc)
        end
      end
    end
    
    private
    
    def ensure_slug(document)
      # Skip if already has a valid slug
      return if document.data["slug"] && !document.data["slug"].to_s.strip.empty?
      
      # If we have a title, use that for the slug
      if document.data["title"] && !document.data["title"].to_s.strip.empty?
        document.data["slug"] = slugify(document.data["title"])
        return
      end
      
      # Fall back to filename for posts and documents with filenames
      if document.respond_to?(:basename)
        # Use the filename without date prefix and extension
        basename = document.basename.gsub(/^\d{4}-\d{2}-\d{2}-/, "").gsub(/\.\w+$/, "")
        document.data["slug"] = slugify(basename)
        return
      end
      
      # Last resort for pages without a title or parseable filename
      if document.respond_to?(:name)
        document.data["slug"] = slugify(document.name.gsub(/\.\w+$/, ""))
        return
      end
      
      # If all else fails, create a timestamp-based slug as final fallback
      if document.data["slug"].to_s.strip.empty?
        document.data["slug"] = document.respond_to?(:date) ? 
          "post-#{document.date.strftime('%Y-%m-%d')}" : 
          "page-#{Time.now.to_i}"
      end
    end
    
    def slugify(string)
      return "homepage" if string == "index"
      string.to_s.downcase.strip
        .gsub(/\s+/, '-')           # Replace spaces with hyphens
        .gsub(/[^\w\-]/, '')        # Remove non-word chars except hyphens
        .gsub(/\-\-+/, '-')         # Replace multiple hyphens with single hyphen
        .gsub(/^-+/, '')            # Remove leading hyphens
        .gsub(/-+$/, '')            # Remove trailing hyphens
    end
  end
end