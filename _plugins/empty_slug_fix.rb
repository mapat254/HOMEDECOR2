module Jekyll
  class EmptySlugFix < Generator
    safe true
    priority :high

    def generate(site)
      # Fix empty slugs for categories
      site.categories.each do |category, posts|
        if category.to_s.strip.empty?
          site.categories.delete(category)
        end
      end

      # Fix empty slugs for tags
      site.tags.each do |tag, posts|
        if tag.to_s.strip.empty?
          site.tags.delete(tag)
        end
      end

      # Fix empty slugs in documents (posts, pages, etc.)
      site.documents.each do |doc|
        # Ensure slug is set for all documents
        if doc.data['slug'].nil? || doc.data['slug'].to_s.strip.empty?
          default_slug = case doc.type
                         when 'posts'
                           'post-default-slug'
                         when 'pages'
                           'page-default-slug'
                         when 'categories'
                           'category-default-slug'
                         when 'tags'
                           'tag-default-slug'
                         else
                           'default-post'
                         end
          doc.data['slug'] = default_slug
        end
      end
    end
  end
end