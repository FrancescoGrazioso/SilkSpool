import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SearchBar } from '../SearchBar'

describe('SearchBar', () => {
  it('renders with placeholder text', () => {
    const mockOnSearch = vi.fn()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    expect(screen.getByPlaceholderText('Search mods...')).toBeInTheDocument()
  })

  it('calls onSearch when user types', async () => {
    const mockOnSearch = vi.fn()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByPlaceholderText('Search mods...')
    fireEvent.change(input, { target: { value: 'test query' } })
    
    // Wait for debounced search
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test query')
    }, { timeout: 500 })
  })

  it('debounces search input', async () => {
    const mockOnSearch = vi.fn()
    render(<SearchBar onSearch={mockOnSearch} debounceMs={100} />)
    
    const input = screen.getByPlaceholderText('Search mods...')
    
    // Type multiple characters quickly
    fireEvent.change(input, { target: { value: 't' } })
    fireEvent.change(input, { target: { value: 'te' } })
    fireEvent.change(input, { target: { value: 'tes' } })
    fireEvent.change(input, { target: { value: 'test' } })
    
    // Should only call onSearch once after debounce
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledTimes(1)
      expect(mockOnSearch).toHaveBeenCalledWith('test')
    }, { timeout: 200 })
  })

  it('shows clear button when there is text', () => {
    const mockOnSearch = vi.fn()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByPlaceholderText('Search mods...')
    fireEvent.change(input, { target: { value: 'test' } })
    
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('clears input when clear button is clicked', () => {
    const mockOnSearch = vi.fn()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByPlaceholderText('Search mods...')
    fireEvent.change(input, { target: { value: 'test' } })
    
    const clearButton = screen.getByRole('button')
    fireEvent.click(clearButton)
    
    expect(input).toHaveValue('')
    expect(mockOnSearch).toHaveBeenCalledWith('')
  })

  it('uses custom placeholder when provided', () => {
    const mockOnSearch = vi.fn()
    render(<SearchBar onSearch={mockOnSearch} placeholder="Custom placeholder" />)
    
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument()
  })
})
