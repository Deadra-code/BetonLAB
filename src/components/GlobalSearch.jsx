import React, { useState, useEffect, useCallback } from 'react';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from './ui/command';
import { Folder, FileText, Beaker, Loader2 } from 'lucide-react';
import * as api from '../api/electronAPI';

// Custom hook for debouncing
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export default function GlobalSearch({ onNavigate }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ projects: [], trials: [], materials: [] });
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const debouncedQuery = useDebounce(query, 300); // 300ms delay

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedQuery.length < 2) {
                setResults({ projects: [], trials: [], materials: [] });
                setLoading(false);
                setIsOpen(false);
                return;
            }
            setLoading(true);
            setIsOpen(true);
            try {
                const searchResults = await api.globalSearch(debouncedQuery);
                setResults(searchResults);
            } catch (error) {
                console.error("Global search failed:", error);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [debouncedQuery]);

    const handleSelect = (item, type) => {
        onNavigate(item, type);
        setIsOpen(false);
        setQuery('');
    };

    const hasResults = results.projects.length > 0 || results.trials.length > 0 || results.materials.length > 0;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div className="relative w-full max-w-md">
                    <Input
                        type="text"
                        placeholder="Cari Proyek, Trial, atau Material..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : <Beaker className="h-5 w-5 text-muted-foreground" />}
                    </div>
                </div>
            </PopoverTrigger>
            {/* PERBAIKAN: Menambahkan prop onOpenAutoFocus.
              Ini akan mencegah Popover mencuri fokus dari input saat terbuka,
              sehingga pengguna dapat terus mengetik tanpa gangguan.
            */}
            <PopoverContent 
                className="w-[450px] p-0" 
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <Command>
                    <CommandList>
                        {!hasResults && !loading && debouncedQuery.length > 1 && (
                             <CommandEmpty>Tidak ada hasil untuk "{debouncedQuery}".</CommandEmpty>
                        )}
                        
                        {results.projects.length > 0 && (
                            <CommandGroup heading="Proyek">
                                {results.projects.map(item => (
                                    <CommandItem key={`proj-${item.id}`} onSelect={() => handleSelect(item, 'project')}>
                                        <Folder className="mr-2 h-4 w-4" />
                                        <span>{item.projectName}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {results.trials.length > 0 && (
                            <CommandGroup heading="Trial Mix">
                                {results.trials.map(item => (
                                    <CommandItem key={`trial-${item.id}`} onSelect={() => handleSelect(item, 'trial')}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        <span>{item.trial_name} <span className="text-xs text-muted-foreground ml-2">({item.projectName})</span></span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                        
                        {results.materials.length > 0 && (
                            <CommandGroup heading="Material">
                                {results.materials.map(item => (
                                    <CommandItem key={`mat-${item.id}`} onSelect={() => handleSelect(item, 'material')}>
                                        <Beaker className="mr-2 h-4 w-4" />
                                        <span>{item.name}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
