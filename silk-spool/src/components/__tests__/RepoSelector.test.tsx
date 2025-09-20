import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { RepoSelector } from '../RepoSelector'
import { RepositoryInfo } from '../../types'

const mockRepositories: RepositoryInfo[] = [
  {
    id: 'built-in',
    name: 'Built-in Mods',
    url: 'built-in',
    mod_count: 1,
    version: 1,
    last_updated: '2024-01-01T00:00:00Z'
  },
  {
    id: 'test-repo',
    name: 'Test Repository',
    url: 'https://example.com/repo.json',
    mod_count: 5,
    version: 1,
    last_updated: '2024-01-01T00:00:00Z'
  }
]

describe('RepoSelector', () => {
  it('renders with current repository name', () => {
    const mockOnRepoSelect = vi.fn()
    const mockOnAddRepo = vi.fn()
    
    render(
      <RepoSelector
        repositories={mockRepositories}
        activeRepoId="built-in"
        onRepoSelect={mockOnRepoSelect}
        onAddRepo={mockOnAddRepo}
      />
    )
    
    expect(screen.getByText('Built-in Mods')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument() // mod count
  })

  it('shows "All Repositories" when no active repo is selected', () => {
    const mockOnRepoSelect = vi.fn()
    const mockOnAddRepo = vi.fn()
    
    render(
      <RepoSelector
        repositories={mockRepositories}
        activeRepoId={null}
        onRepoSelect={mockOnRepoSelect}
        onAddRepo={mockOnAddRepo}
      />
    )
    
    expect(screen.getByText('All Repositories')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument() // total mod count
  })

  it('opens dropdown when clicked', () => {
    const mockOnRepoSelect = vi.fn()
    const mockOnAddRepo = vi.fn()
    
    render(
      <RepoSelector
        repositories={mockRepositories}
        activeRepoId="built-in"
        onRepoSelect={mockOnRepoSelect}
        onAddRepo={mockOnAddRepo}
      />
    )
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(screen.getByText('All Repositories')).toBeInTheDocument()
    expect(screen.getByText('Test Repository')).toBeInTheDocument()
  })

  it('calls onRepoSelect when repository is selected', () => {
    const mockOnRepoSelect = vi.fn()
    const mockOnAddRepo = vi.fn()
    
    render(
      <RepoSelector
        repositories={mockRepositories}
        activeRepoId="built-in"
        onRepoSelect={mockOnRepoSelect}
        onAddRepo={mockOnAddRepo}
      />
    )
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    const allReposOption = screen.getByText('All Repositories')
    fireEvent.click(allReposOption)
    
    expect(mockOnRepoSelect).toHaveBeenCalledWith(null)
  })

  it('calls onAddRepo when add button is clicked', () => {
    const mockOnRepoSelect = vi.fn()
    const mockOnAddRepo = vi.fn()
    
    render(
      <RepoSelector
        repositories={mockRepositories}
        activeRepoId="built-in"
        onRepoSelect={mockOnRepoSelect}
        onAddRepo={mockOnAddRepo}
      />
    )
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    const addButton = screen.getByText('Add Repository')
    fireEvent.click(addButton)
    
    expect(mockOnAddRepo).toHaveBeenCalled()
  })

  it('shows built-in badge for built-in repository', () => {
    const mockOnRepoSelect = vi.fn()
    const mockOnAddRepo = vi.fn()
    
    render(
      <RepoSelector
        repositories={mockRepositories}
        activeRepoId="built-in"
        onRepoSelect={mockOnRepoSelect}
        onAddRepo={mockOnAddRepo}
      />
    )
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(screen.getByText('Built-in')).toBeInTheDocument()
  })

  it('highlights active repository in dropdown', () => {
    const mockOnRepoSelect = vi.fn()
    const mockOnAddRepo = vi.fn()
    
    render(
      <RepoSelector
        repositories={mockRepositories}
        activeRepoId="built-in"
        onRepoSelect={mockOnRepoSelect}
        onAddRepo={mockOnAddRepo}
      />
    )
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Find the button that contains "Built-in Mods" in the dropdown (not the main button)
    const dropdownButtons = screen.getAllByText('Built-in Mods')
    const dropdownButton = dropdownButtons.find(button => 
      button.closest('button')?.classList.contains('bg-primary-600')
    )
    expect(dropdownButton).toBeDefined()
  })
})
