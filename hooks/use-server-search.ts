import { useState, useCallback } from "react"
import { useDebouncedCallback } from "./use-debounced-callback"

interface UseServerSearchOptions {
  /**
   * Delay in milliseconds before triggering the search
   * @default 300
   */
  delay?: number
  /**
   * Minimum characters required before triggering search
   * @default 0
   */
  minChars?: number
}

interface UseServerSearchReturn {
  /**
   * Current search input value (for controlled input)
   */
  searchValue: string
  /**
   * Debounced search value (for API calls)
   */
  debouncedValue: string
  /**
   * Handler for input onChange
   */
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  /**
   * Set search value programmatically
   */
  setSearchValue: (value: string) => void
  /**
   * Clear search and reset to empty
   */
  clearSearch: () => void
  /**
   * Whether a search is currently pending (debounce in progress)
   */
  isPending: boolean
}

/**
 * Reusable hook for server-side search with debouncing.
 * Provides both immediate and debounced values for optimal UX.
 * 
 * @param onSearch - Callback function that will be called with debounced search value
 * @param options - Configuration options
 * 
 * @example
 * ```tsx
 * const {
 *   searchValue,
 *   handleSearchChange,
 *   clearSearch
 * } = useServerSearch((search) => {
 *   refetch({ page: 1, search })
 * }, { delay: 300 })
 * 
 * return (
 *   <Input
 *     value={searchValue}
 *     onChange={handleSearchChange}
 *     placeholder="Search..."
 *   />
 * )
 * ```
 */
export function useServerSearch(
  onSearch: (value: string) => void,
  options: UseServerSearchOptions = {}
): UseServerSearchReturn {
  const {
    delay = 300,
    minChars = 0,
  } = options

  const [searchValue, setSearchValue] = useState("")
  const [debouncedValue, setDebouncedValue] = useState("")
  const [isPending, setIsPending] = useState(false)

  // Debounced callback that updates the debounced value and triggers search
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setDebouncedValue(value)
    setIsPending(false)
    
    // Only trigger search if meets minimum characters or is empty (clear)
    if (value.length >= minChars || value === "") {
      onSearch(value)
    }
  }, delay)

  // Handle input change
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchValue(value)
    setIsPending(true)
    debouncedSearch(value)
  }, [debouncedSearch])

  // Set value programmatically
  const setValue = useCallback((value: string) => {
    setSearchValue(value)
    setIsPending(true)
    debouncedSearch(value)
  }, [debouncedSearch])

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchValue("")
    setDebouncedValue("")
    setIsPending(false)
    onSearch("")
  }, [onSearch])

  return {
    searchValue,
    debouncedValue,
    handleSearchChange,
    setSearchValue: setValue,
    clearSearch,
    isPending,
  }
}

