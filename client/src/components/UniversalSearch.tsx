import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, ClockIcon, UserIcon, HomeIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export interface SearchResult {
  id: string;
  type: 'room' | 'guest' | 'booking' | 'employee' | 'invoice' | 'report';
  title: string;
  subtitle: string;
  description?: string;
  url: string;
  metadata: Record<string, any>;
  relevance: number;
}

interface SearchHistory {
  query: string;
  timestamp: Date;
  resultCount: number;
}

const UniversalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Mock search data
  const mockData: SearchResult[] = [
    {
      id: '1',
      type: 'room',
      title: 'Room 204',
      subtitle: 'Deluxe Suite',
      description: 'Currently occupied by John Smith, checkout tomorrow',
      url: '/rooms/204',
      metadata: { number: '204', type: 'suite', status: 'occupied', guest: 'John Smith' },
      relevance: 0.95
    },
    {
      id: '2',
      type: 'guest',
      title: 'John Smith',
      subtitle: 'VIP Guest',
      description: 'john.smith@email.com • +1-555-0123 • 5 total stays',
      url: '/guests/john-smith',
      metadata: { email: 'john.smith@email.com', phone: '+1-555-0123', vip: true, totalStays: 5 },
      relevance: 0.92
    },
    {
      id: '3',
      type: 'booking',
      title: 'Booking #BK-2024-001',
      subtitle: 'John Smith - Room 204',
      description: 'Check-in: Jan 15, 2024 • Check-out: Jan 18, 2024 • $450/night',
      url: '/bookings/BK-2024-001',
      metadata: { bookingId: 'BK-2024-001', guest: 'John Smith', room: '204', total: 1350 },
      relevance: 0.88
    },
    {
      id: '4',
      type: 'employee',
      title: 'Jane Wilson',
      subtitle: 'Housekeeping Manager',
      description: 'jane.wilson@hotel.com • Housekeeping Department • Active',
      url: '/employees/jane-wilson',
      metadata: { department: 'Housekeeping', position: 'Manager', status: 'active' },
      relevance: 0.75
    },
    {
      id: '5',
      type: 'invoice',
      title: 'Invoice #INV-001',
      subtitle: 'John Smith - $1,350.00',
      description: 'Issued: Jan 15, 2024 • Due: Jan 30, 2024 • Status: Paid',
      url: '/invoices/INV-001',
      metadata: { invoiceId: 'INV-001', amount: 1350, status: 'paid', guest: 'John Smith' },
      relevance: 0.82
    },
    {
      id: '6',
      type: 'report',
      title: 'Monthly Revenue Report',
      subtitle: 'January 2024',
      description: 'Generated on Jan 31, 2024 • Total Revenue: $125,400',
      url: '/reports/monthly-revenue-jan-2024',
      metadata: { period: 'January 2024', revenue: 125400, type: 'monthly' },
      relevance: 0.70
    }
  ];

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter and rank results based on query
    const filteredResults = mockData
      .filter(item => {
        const searchTerms = searchQuery.toLowerCase().split(' ');
        const searchableText = `${item.title} ${item.subtitle} ${item.description || ''} ${JSON.stringify(item.metadata)}`.toLowerCase();
        
        return searchTerms.every(term => searchableText.includes(term));
      })
      .sort((a, b) => {
        // Sort by relevance and then by exact matches
        const aExactMatch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0;
        const bExactMatch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0;
        
        if (aExactMatch !== bExactMatch) {
          return bExactMatch - aExactMatch;
        }
        
        return b.relevance - a.relevance;
      })
      .slice(0, 8); // Limit to 8 results

    setResults(filteredResults);
    setSelectedIndex(-1);
    setIsLoading(false);

    // Add to search history
    if (filteredResults.length > 0) {
      const historyEntry: SearchHistory = {
        query: searchQuery,
        timestamp: new Date(),
        resultCount: filteredResults.length
      };
      
      setSearchHistory(prev => {
        const filtered = prev.filter(h => h.query !== searchQuery);
        return [historyEntry, ...filtered].slice(0, 10); // Keep last 10 searches
      });
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setShowHistory(value.trim() === '');
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (query.trim() === '') {
      setShowHistory(true);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    setShowHistory(false);
    performSearch(historyQuery);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    setShowHistory(false);
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case 'room':
        return <HomeIcon className={`${iconClass} text-orange-500`} />;
      case 'guest':
        return <UserIcon className={`${iconClass} text-amber-500`} />;
      case 'booking':
        return <DocumentIcon className={`${iconClass} text-red-500`} />;
      case 'employee':
        return <UserIcon className={`${iconClass} text-orange-500`} />;
      case 'invoice':
        return <DocumentIcon className={`${iconClass} text-red-500`} />;
      case 'report':
        return <DocumentIcon className={`${iconClass} text-orange-400`} />;
      default:
        return <DocumentIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  const getTypeBadge = (type: SearchResult['type']) => {
    const colors = {
      room: 'bg-orange-100 text-orange-800',
      guest: 'bg-amber-100 text-amber-800',
      booking: 'bg-red-100 text-red-800',
      employee: 'bg-orange-100 text-orange-800',
      invoice: 'bg-red-100 text-red-800',
      report: 'bg-amber-100 text-amber-800'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[type]}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Search rooms, guests, bookings, staff..."
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Search Results / History Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {showHistory && searchHistory.length > 0 && (
            <>
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Recent Searches</span>
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto">
                {searchHistory.map((history, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(history.query)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{history.query}</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {history.resultCount} results
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {isLoading && (
            <div className="px-4 py-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            </div>
          )}

          {!isLoading && !showHistory && results.length === 0 && query.trim() && (
            <div className="px-4 py-8 text-center">
              <MagnifyingGlassIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No results found for "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">
                Try searching for rooms, guests, bookings, or staff
              </p>
            </div>
          )}

          {!isLoading && !showHistory && results.length > 0 && (
            <>
              <div className="px-4 py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-900">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start space-x-3 border-l-4 transition-all ${
                      selectedIndex === index 
                        ? 'bg-orange-50 border-orange-500' 
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {highlightText(result.title, query)}
                        </h4>
                        {getTypeBadge(result.type)}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {highlightText(result.subtitle, query)}
                      </p>
                      {result.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {highlightText(result.description, query)}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  Use ↑↓ to navigate, Enter to select, Esc to close
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UniversalSearch;
