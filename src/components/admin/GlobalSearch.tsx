import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface SearchResult {
  id: string;
  type: 'provider' | 'user' | 'house' | 'blog' | 'page';
  title: string;
  description: string;
  url: string;
}

interface GlobalSearchProps {
  onSearch?: (query: string) => Promise<SearchResult[]>;
  placeholder?: string;
}

const typeLabels = {
  provider: 'Proveedor',
  user: 'Usuario',
  house: 'Casa',
  blog: 'Blog',
  page: 'Página',
};

const typeIcons = {
  provider: '■',
  user: '○',
  house: '□',
  blog: '▢',
  page: '▣',
};

export function GlobalSearch({ 
  onSearch, 
  placeholder = "Buscar en toda la plataforma..." 
}: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock search function for demo
  const mockSearch = async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery.trim()) return [];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      {
        id: '1',
        type: 'provider' as const,
        title: 'Casa Modular SpA',
        description: 'Proveedor especializado en construcción modular',
        url: '/admin/providers/1',
      },
      {
        id: '2',
        type: 'house' as const,
        title: 'Casa Moderna 120m²',
        description: 'Casa modular de 3 dormitorios con diseño contemporáneo',
        url: '/admin/content/houses/2',
      },
      {
        id: '3',
        type: 'user' as const,
        title: 'Juan Pérez',
        description: 'Usuario registrado desde enero 2024',
        url: '/admin/users/3',
      },
    ].filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const searchResults = onSearch ? 
        await onSearch(searchQuery) : 
        await mockSearch(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query]);

  // Keyboard shortcut to open search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        className="w-full sm:w-auto justify-start text-muted-foreground"
        onClick={() => setIsOpen(true)}
      >
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {placeholder}
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
            <div className="flex flex-col">
              {/* Search Input */}
              <div className="flex items-center border-b p-4">
                <svg
                  className="mr-2 h-4 w-4 shrink-0 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={placeholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="ml-2"
                >
                  ×
                </Button>
              </div>

              {/* Search Results */}
              <div className="max-h-80 overflow-y-auto p-1">
                {isLoading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Buscando...
                  </div>
                ) : results.length > 0 ? (
                  results.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center space-x-3 rounded-md p-3 hover:bg-muted cursor-pointer"
                      onClick={() => {
                        window.location.href = result.url;
                        setIsOpen(false);
                      }}
                    >
                      <span className="text-lg">{typeIcons[result.type]}</span>
                      <div className="flex-grow">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{result.title}</span>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {typeLabels[result.type]}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{result.description}</p>
                      </div>
                    </div>
                  ))
                ) : query.trim().length >= 2 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No se encontraron resultados para "{query}"
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Escribe al menos 2 caracteres para buscar
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}