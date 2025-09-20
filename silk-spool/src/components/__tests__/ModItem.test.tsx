import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ModItem } from '../ModItem'
import { Mod } from '../../types'

const mockMod: Mod = {
  id: 'test-mod',
  title: 'Test Mod',
  description: 'A test mod for testing purposes',
  homepage: 'https://example.com',
  game_version: '1.0.0',
  authors: ['Test Author'],
  requirements: ['BepInEx'],
  downloads: [
    {
      url: 'https://example.com/download',
      label: 'Download'
    }
  ],
  images: ['https://example.com/image.png'],
  updated_at: '2024-01-01T00:00:00Z'
}

describe('ModItem', () => {
  it('renders mod information correctly', () => {
    const mockOnClick = vi.fn()
    render(<ModItem mod={mockMod} isSelected={false} onClick={mockOnClick} />)
    
    expect(screen.getByText('Test Mod')).toBeInTheDocument()
    expect(screen.getByText('A test mod for testing purposes')).toBeInTheDocument()
    expect(screen.getByText('by Test Author')).toBeInTheDocument()
    expect(screen.getByText('BepInEx')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const mockOnClick = vi.fn()
    render(<ModItem mod={mockMod} isSelected={false} onClick={mockOnClick} />)
    
    const modItem = screen.getByText('Test Mod').closest('div')
    fireEvent.click(modItem!)
    
    expect(mockOnClick).toHaveBeenCalled()
  })

  it('shows selected state when isSelected is true', () => {
    const mockOnClick = vi.fn()
    render(<ModItem mod={mockMod} isSelected={true} onClick={mockOnClick} />)
    
    // Find the main container div (the one with cursor-pointer class)
    const modItem = screen.getByText('Test Mod').closest('div[class*="cursor-pointer"]')
    expect(modItem).toHaveClass('bg-primary-600', 'border-primary-500')
  })

  it('shows unselected state when isSelected is false', () => {
    const mockOnClick = vi.fn()
    render(<ModItem mod={mockMod} isSelected={false} onClick={mockOnClick} />)
    
    // Find the main container div (the one with cursor-pointer class)
    const modItem = screen.getByText('Test Mod').closest('div[class*="cursor-pointer"]')
    expect(modItem).toHaveClass('bg-gray-800', 'border-gray-700')
  })

  it('formats date correctly', () => {
    const mockOnClick = vi.fn()
    render(<ModItem mod={mockMod} isSelected={false} onClick={mockOnClick} />)
    
    // The date should be formatted and displayed as "Jan 1, 2024"
    expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument()
  })

  it('shows game version and download count', () => {
    const mockOnClick = vi.fn()
    render(<ModItem mod={mockMod} isSelected={false} onClick={mockOnClick} />)
    
    expect(screen.getByText('Game: 1.0.0')).toBeInTheDocument()
    expect(screen.getByText('1 download')).toBeInTheDocument()
  })

  it('handles multiple authors correctly', () => {
    const modWithMultipleAuthors = { ...mockMod, authors: ['Author 1', 'Author 2'] }
    const mockOnClick = vi.fn()
    render(<ModItem mod={modWithMultipleAuthors} isSelected={false} onClick={mockOnClick} />)
    
    expect(screen.getByText('by Author 1, Author 2')).toBeInTheDocument()
  })
})
