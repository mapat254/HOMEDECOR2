document.addEventListener('DOMContentLoaded', function() {
  // Simple front-end search functionality
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const liveSearchResults = document.getElementById('live-search-results');
  let searchIndex = [];
  let searchJsonLoaded = false;
  
  // Debug - log that search.js is loaded
  console.log('Search script loaded');
  
  // Calculate the correct path to search.json
  // Try multiple paths to make sure we find the file
  function fetchSearchData() {
    console.log('Attempting to fetch search data');
    
    // First try - direct path
    const searchJsonPath = 'search.json';
    console.log('Trying to fetch search data from:', searchJsonPath);
    
    fetch(searchJsonPath)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok with direct path');
        }
        console.log('Search data fetch successful with direct path');
        return response.json();
      })
      .then(data => {
        console.log('Search data loaded successfully:', data.length, 'items');
        searchIndex = data;
        searchJsonLoaded = true;
      
      // Set up live search on all pages
      if (searchInput) {
        // Handle search input for live search
        searchInput.addEventListener('input', function() {
          const query = this.value.toLowerCase().trim();
          
          // Hide live search results if query is empty
          if (query.length < 2) {
            if (liveSearchResults) {
              liveSearchResults.innerHTML = '';
              liveSearchResults.style.display = 'none';
            }
            return;
          }
          
          const results = searchIndex.filter(item => {
            const titleMatch = item.title.toLowerCase().includes(query);
            const contentMatch = item.content.toLowerCase().includes(query);
            const tagsMatch = item.tags && item.tags.some(tag => tag.toLowerCase().includes(query));
            const categoryMatch = item.categories && item.categories.some(category => category.toLowerCase().includes(query));
            
            return titleMatch || contentMatch || tagsMatch || categoryMatch;
          }).slice(0, 5); // Limit live search results to 5 items
          
          // Display live search results
          if (liveSearchResults) {
            if (results.length === 0) {
              liveSearchResults.innerHTML = `<p>No results found for "${query}"</p>`;
            } else {
              let html = '<ul class="live-search-list">';
              
              results.forEach(result => {
                html += `
                  <li class="live-search-item">
                    <a href="${window.location.origin}${result.url}">
                      <span class="live-search-title">${result.title}</span>
                      <span class="live-search-category">${result.categories ? result.categories[0] : ''}</span>
                    </a>
                  </li>
                `;
              });
              
              html += `
                <li class="live-search-more">
                  <a href="${window.location.origin}/search/?q=${encodeURIComponent(query)}">View all results</a>
                </li>
              `;
              html += '</ul>';
              
              liveSearchResults.innerHTML = html;
              liveSearchResults.style.display = 'block';
            }
          }
        });
        
        // Hide live search results when clicking outside
        document.addEventListener('click', function(e) {
          if (liveSearchResults && !searchInput.contains(e.target) && !liveSearchResults.contains(e.target)) {
            liveSearchResults.style.display = 'none';
          }
        });
      }
      
      // Additional functionality for search page
      if (searchInput && searchResults) {
        // Handle search input for search page
        searchInput.addEventListener('input', function() {
          const query = this.value.toLowerCase().trim();
          
          if (query.length < 2) {
            searchResults.innerHTML = '<p>Please enter at least 2 characters to search</p>';
            return;
          }
          
          const results = searchIndex.filter(item => {
            const titleMatch = item.title.toLowerCase().includes(query);
            const contentMatch = item.content.toLowerCase().includes(query);
            const tagsMatch = item.tags && item.tags.some(tag => tag.toLowerCase().includes(query));
            const categoryMatch = item.categories && item.categories.some(category => category.toLowerCase().includes(query));
            
            return titleMatch || contentMatch || tagsMatch || categoryMatch;
          });
          
          displayResults(results, query);
        });
        
        // Check if URL has search parameter
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q');
        
        if (searchQuery) {
          searchInput.value = searchQuery;
          searchInput.dispatchEvent(new Event('input'));
        }
      }
    })
    .catch(error => {
      console.error('Error loading search data from origin path:', error);
      // Try with relative path
      console.log('Trying alternative path for search.json');
      fetch('/search.json')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok with relative path');
          }
          return response.json();
        })
        .then(data => {
          console.log('Search data loaded successfully with relative path:', data.length, 'items');
          searchIndex = data;
          searchJsonLoaded = true;
          // Initialize the search functionality
          initializeSearch();
        })
        .catch(finalError => {
          console.error('Final error loading search data:', finalError);
          if (searchResults) {
            searchResults.innerHTML = '<p>Error loading search data</p>';
          }
          // Try one more time with just the filename
          fetch('search.json')
            .then(response => response.json())
            .then(data => {
              console.log('Search data loaded successfully with filename only:', data.length, 'items');
              searchIndex = data;
              searchJsonLoaded = true;
              initializeSearch();
            })
            .catch(err => {
              console.error('All attempts to load search data failed:', err);
            });
        });
    });
  }

  // Initialize the fetching
  fetchSearchData();
  
  // Function to initialize search functionality once data is loaded
  function initializeSearch() {
    if (searchInput) {
      console.log('Initializing search input with ID:', searchInput.id);
      
      // Make sure the event listener isn't attached multiple times
      searchInput.removeEventListener('input', handleSearchInput);
      searchInput.addEventListener('input', handleSearchInput);
      
      // Enhanced debugging
      searchInput.addEventListener('focus', function() {
        console.log('Search input focused');
      });
      
      searchInput.addEventListener('blur', function() {
        console.log('Search input lost focus');
      });
      
      // Make form submit work as expected
      const searchForm = searchInput.closest('form');
      if (searchForm) {
        console.log('Search form found, setting up submit handler');
        searchForm.addEventListener('submit', function(e) {
          const query = searchInput.value.trim();
          if (query.length < 2) {
            e.preventDefault();
            console.log('Preventing form submission: query too short');
            return false;
          }
          
          console.log('Search form submitted with query:', query);
          // Allow normal form submission
        });
      } else {
        console.warn('No search form found around search input');
      }
      
      // Check if URL has search parameter (for search page)
      if (searchResults) {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q');
        
        if (searchQuery) {
          console.log('URL has search query:', searchQuery);
          searchInput.value = searchQuery;
          searchInput.dispatchEvent(new Event('input'));
        }
      }
    } else {
      console.error('Search input element not found');
    }
  }
  
  // Handler for search input
  function handleSearchInput() {
    const query = this.value.toLowerCase().trim();
    
    // Handle live search results
    if (query.length < 2) {
      if (liveSearchResults) {
        liveSearchResults.innerHTML = '';
        liveSearchResults.style.display = 'none';
      }
      if (searchResults) {
        searchResults.innerHTML = '<p>Please enter at least 2 characters to search</p>';
      }
      return;
    }
    
    performSearch(query);
  }
  
  // Perform the actual search
  function performSearch(query) {
    if (!searchIndex || searchIndex.length === 0) {
      console.warn('Search index not yet loaded');
      return;
    }
    
    console.log('Performing search for:', query, 'in data of size:', searchIndex.length);
    
    // Prioritize results to show the most relevant first
    const results = searchIndex.filter(item => {
      // Convert strings to lowercase for comparison
      const lQuery = query.toLowerCase();
      const lTitle = item.title ? item.title.toLowerCase() : '';
      const lContent = item.content ? item.content.toLowerCase() : '';
      
      // Check title match (highest priority)
      const titleMatch = lTitle.includes(lQuery);
      if (titleMatch) console.log('Title match found in:', item.title);
      
      // Check tag matches (high priority)
      let tagsMatch = false;
      if (item.tags && item.tags.length > 0) {
        tagsMatch = item.tags.some(tag => {
          if (tag && typeof tag === 'string') {
            const match = tag.toLowerCase().includes(lQuery);
            if (match) console.log('Tag match found in:', tag);
            return match;
          }
          return false;
        });
      }
      
      // Check category matches (high priority)
      let categoryMatch = false;
      if (item.categories && item.categories.length > 0) {
        categoryMatch = item.categories.some(category => {
          if (category && typeof category === 'string') {
            const match = category.toLowerCase().includes(lQuery);
            if (match) console.log('Category match found in:', category);
            return match;
          }
          return false;
        });
      }
      
      // Check content matches (lower priority but still important)
      const contentMatch = lContent.includes(lQuery);
      if (contentMatch) console.log('Content match found in:', item.title);
      
      // For explicit tag/category searches with format tag:xxx or category:xxx
      let explicitTagMatch = false;
      let explicitCategoryMatch = false;
      
      if (lQuery.startsWith('tag:') && item.tags) {
        const tagQuery = lQuery.substring(4).trim();
        explicitTagMatch = item.tags.some(tag => 
          tag && typeof tag === 'string' && tag.toLowerCase().includes(tagQuery)
        );
        if (explicitTagMatch) console.log('Explicit tag match found for:', tagQuery);
      }
      
      if (lQuery.startsWith('category:') && item.categories) {
        const categoryQuery = lQuery.substring(9).trim();
        explicitCategoryMatch = item.categories.some(category => 
          category && typeof category === 'string' && category.toLowerCase().includes(categoryQuery)
        );
        if (explicitCategoryMatch) console.log('Explicit category match found for:', categoryQuery);
      }
      
      // Return true if any match is found
      return titleMatch || contentMatch || tagsMatch || categoryMatch || explicitTagMatch || explicitCategoryMatch;
    });
    
    // Handle live search results
    if (liveSearchResults) {
      displayLiveResults(results, query);
    }
    
    // Handle search page results
    if (searchResults) {
      displayResults(results, query);
    }
  }
  
  // Display live search results
  function displayLiveResults(results, query) {
    const limitedResults = results.slice(0, 5); // Limit to 5 items
    
    if (results.length === 0) {
      liveSearchResults.innerHTML = `<p>No results found for "${query}"</p>`;
    } else {
      let html = '<ul class="live-search-list">';
      
      limitedResults.forEach(result => {
        html += `
          <li class="live-search-item">
            <a href="${result.url}">
              <span class="live-search-title">${result.title}</span>
              <span class="live-search-category">${result.categories ? result.categories[0] : ''}</span>
            </a>
          </li>
        `;
      });
      
      html += `
        <li class="live-search-more">
          <a href="/search/?q=${encodeURIComponent(query)}">View all results</a>
        </li>
      `;
      html += '</ul>';
      
      liveSearchResults.innerHTML = html;
      liveSearchResults.style.display = 'block';
    }
  }
  
  // Register click handler to hide live search results
  document.addEventListener('click', function(e) {
    if (liveSearchResults && !searchInput?.contains(e.target) && !liveSearchResults.contains(e.target)) {
      liveSearchResults.style.display = 'none';
    }
  });
  
  function displayResults(results, query) {
    if (results.length === 0) {
      searchResults.innerHTML = `<p>No results found for "${query}"</p>`;
      return;
    }
    
    let html = '<div class="search-results-list">';
    
    results.forEach(result => {
      // Get excerpt around the matched term
      let excerpt = getExcerptWithMatch(result.content, query);
      
      html += `
        <div class="search-result-item">
          <h3><a href="${window.location.origin}${result.url}">${result.title}</a></h3>
          <div class="search-result-excerpt">${excerpt}</div>
          <div class="search-result-meta">
            <span class="date">${result.date}</span>
            ${result.categories ? `<span class="categories">in ${result.categories.join(', ')}</span>` : ''}
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    searchResults.innerHTML = html;
  }
  
  function getExcerptWithMatch(content, query) {
    const maxLength = 200;
    const lowerContent = content.toLowerCase();
    const index = lowerContent.indexOf(query);
    
    if (index === -1) return content.substring(0, maxLength) + '...';
    
    let start = Math.max(0, index - 60);
    let end = Math.min(content.length, index + query.length + 60);
    
    // Adjust to avoid cutting words
    while (start > 0 && content[start] !== ' ') {
      start--;
    }
    
    while (end < content.length && content[end] !== ' ') {
      end++;
    }
    
    let excerpt = content.substring(start, end);
    
    // Add ellipsis if needed
    if (start > 0) excerpt = '...' + excerpt;
    if (end < content.length) excerpt += '...';
    
    // Highlight the query term
    const regex = new RegExp('(' + query + ')', 'gi');
    excerpt = excerpt.replace(regex, '<mark>$1</mark>');
    
    return excerpt;
  }
});
