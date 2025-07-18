import React, { useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface ExportButtonProps {
  month: string;
  disabled?: boolean;
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ month, disabled = false, className = '' }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      setIsExporting(true);
      
      // Create the export URL
      const url = `/api/export/${format}/${month}`;
      
      // Create a hidden anchor element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = `expenses-${month}.${format}`;
      link.target = '_blank';
      
      // Append to the document, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button
          disabled={disabled || isExporting}
          className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md
            ${disabled || isExporting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
        >
          <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
          <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" />
        </Menu.Button>
        
        <Transition
          as={React.Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={isExporting}
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } flex w-full items-center px-4 py-2 text-sm`}
                  >
                    <span className="mr-2">📊</span> Export as CSV
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } flex w-full items-center px-4 py-2 text-sm`}
                  >
                    <span className="mr-2">📄</span> Export as PDF
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default ExportButton;