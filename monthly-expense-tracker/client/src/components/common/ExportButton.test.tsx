import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ExportButton from './ExportButton';

// Mock document.createElement to track link creation
const mockAnchorElement = {
  href: '',
  download: '',
  target: '',
  click: vi.fn(),
};

describe('ExportButton', () => {
  beforeEach(() => {
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockAnchorElement as any;
      }
      return document.createElement(tagName);
    });
    
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.body);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => document.body);
    
    // Reset mock anchor
    mockAnchorElement.href = '';
    mockAnchorElement.download = '';
    mockAnchorElement.target = '';
    mockAnchorElement.click.mockReset();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('renders the export button', () => {
    render(<ExportButton month="2023-01" />);
    
    expect(screen.getByText('Export')).toBeInTheDocument();
  });
  
  it('shows dropdown menu when clicked', async () => {
    render(<ExportButton month="2023-01" />);
    
    // Click the button to open dropdown
    fireEvent.click(screen.getByText('Export'));
    
    // Check dropdown options are visible
    expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    expect(screen.getByText('Export as PDF')).toBeInTheDocument();
  });
  
  it('triggers CSV export when CSV option is clicked', async () => {
    render(<ExportButton month="2023-01" />);
    
    // Click the button to open dropdown
    fireEvent.click(screen.getByText('Export'));
    
    // Click CSV option
    fireEvent.click(screen.getByText('Export as CSV'));
    
    // Check that link was created with correct attributes
    expect(mockAnchorElement.href).toBe('/api/export/csv/2023-01');
    expect(mockAnchorElement.download).toBe('expenses-2023-01.csv');
    expect(mockAnchorElement.target).toBe('_blank');
    expect(mockAnchorElement.click).toHaveBeenCalled();
    
    // Check that document manipulation happened
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
  });
  
  it('triggers PDF export when PDF option is clicked', async () => {
    render(<ExportButton month="2023-01" />);
    
    // Click the button to open dropdown
    fireEvent.click(screen.getByText('Export'));
    
    // Click PDF option
    fireEvent.click(screen.getByText('Export as PDF'));
    
    // Check that link was created with correct attributes
    expect(mockAnchorElement.href).toBe('/api/export/pdf/2023-01');
    expect(mockAnchorElement.download).toBe('expenses-2023-01.pdf');
    expect(mockAnchorElement.target).toBe('_blank');
    expect(mockAnchorElement.click).toHaveBeenCalled();
    
    // Check that document manipulation happened
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
  });
  
  it('disables the button when disabled prop is true', () => {
    render(<ExportButton month="2023-01" disabled={true} />);
    
    const button = screen.getByText('Export').closest('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('bg-gray-300');
  });
});