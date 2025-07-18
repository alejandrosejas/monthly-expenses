import { Expense, Category, Budget } from 'shared';
import { ExpenseRepository } from '../database/expense-repository';
import { CategoryRepository } from '../database/category-repository';
import { BudgetRepository } from '../database/budget-repository';
import { AnalyticsService } from './analytics-service';
import { getMonthStart, getMonthEnd } from '../utils';
import { format } from 'date-fns';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

/**
 * Service for exporting expense data
 */
export class ExportService {
  private expenseRepository: ExpenseRepository;
  private categoryRepository: CategoryRepository;
  private budgetRepository: BudgetRepository;
  private analyticsService: AnalyticsService;

  constructor(
    expenseRepository: ExpenseRepository,
    categoryRepository: CategoryRepository,
    budgetRepository: BudgetRepository,
    analyticsService: AnalyticsService
  ) {
    this.expenseRepository = expenseRepository;
    this.categoryRepository = categoryRepository;
    this.budgetRepository = budgetRepository;
    this.analyticsService = analyticsService;
  }

  /**
   * Export expenses for a month as CSV
   */
  async exportMonthToCSV(month: string): Promise<string> {
    const startDate = getMonthStart(month);
    const endDate = getMonthEnd(month);
    
    // Get all expenses for the month
    const expenses = await this.expenseRepository.findByDateRange(startDate, endDate);
    
    // Get all categories for mapping IDs to names
    const categories = await this.categoryRepository.findAll();
    const categoryMap = new Map<string, Category>();
    categories.forEach(category => categoryMap.set(category.id, category));
    
    // Create CSV header
    let csv = 'Date,Amount,Category,Description,Payment Method\n';
    
    // Add expense rows
    expenses.forEach(expense => {
      const categoryName = categoryMap.get(expense.category)?.name || expense.category;
      
      // Format and escape CSV fields
      const formattedDate = expense.date;
      const formattedAmount = expense.amount.toFixed(2);
      const escapedCategory = this.escapeCsvField(categoryName);
      const escapedDescription = this.escapeCsvField(expense.description);
      
      csv += `${formattedDate},${formattedAmount},${escapedCategory},${escapedDescription},${expense.paymentMethod}\n`;
    });
    
    return csv;
  }

  /**
   * Export expenses for a month as PDF
   */
  async exportMonthToPDF(month: string): Promise<Buffer> {
    const startDate = getMonthStart(month);
    const endDate = getMonthEnd(month);
    
    // Get all expenses for the month
    const expenses = await this.expenseRepository.findByDateRange(startDate, endDate);
    
    // Get all categories for mapping IDs to names
    const categories = await this.categoryRepository.findAll();
    const categoryMap = new Map<string, Category>();
    categories.forEach(category => categoryMap.set(category.id, category));
    
    // Get budget for the month
    const budget = await this.budgetRepository.findByMonth(month);
    
    // Get category breakdown for charts
    const categoryBreakdown = await this.analyticsService.getCategoryBreakdown(month);
    
    // Calculate monthly total
    const monthlyTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Format month for display
    const monthDate = new Date(`${month}-01`);
    const formattedMonth = format(monthDate, 'MMMM yyyy');
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];
    
    // Collect PDF data chunks
    doc.on('data', buffers.push.bind(buffers));
    
    // Add title
    doc.fontSize(20).text(`Monthly Expense Report - ${formattedMonth}`, { align: 'center' });
    doc.moveDown();
    
    // Add summary section
    doc.fontSize(16).text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Total Expenses: $${monthlyTotal.toFixed(2)}`);
    
    if (budget) {
      const budgetRemaining = Math.max(0, budget.totalBudget - monthlyTotal);
      const percentUsed = budget.totalBudget > 0 
        ? Math.round((monthlyTotal / budget.totalBudget) * 100) 
        : 0;
      
      doc.text(`Monthly Budget: $${budget.totalBudget.toFixed(2)}`);
      doc.text(`Budget Remaining: $${budgetRemaining.toFixed(2)}`);
      doc.text(`Budget Used: ${percentUsed}%`);
    }
    
    doc.moveDown();
    
    // Add category breakdown section
    doc.fontSize(16).text('Category Breakdown', { underline: true });
    doc.moveDown(0.5);
    
    // Create a simple table for category breakdown
    const categoryTableTop = doc.y;
    let categoryTableY = categoryTableTop;
    
    // Table headers
    doc.fontSize(10)
       .text('Category', 50, categoryTableY, { width: 150 })
       .text('Amount', 200, categoryTableY, { width: 100 })
       .text('% of Total', 300, categoryTableY, { width: 100 });
    
    categoryTableY += 20;
    
    // Draw header line
    doc.moveTo(50, categoryTableY - 5)
       .lineTo(400, categoryTableY - 5)
       .stroke();
    
    // Table rows
    categoryBreakdown.forEach(item => {
      doc.fontSize(10)
         .text(item.category, 50, categoryTableY, { width: 150 })
         .text(`$${item.amount.toFixed(2)}`, 200, categoryTableY, { width: 100 })
         .text(`${item.percentage.toFixed(1)}%`, 300, categoryTableY, { width: 100 });
      
      categoryTableY += 20;
    });
    
    // Draw bottom line
    doc.moveTo(50, categoryTableY - 5)
       .lineTo(400, categoryTableY - 5)
       .stroke();
    
    doc.moveDown(2);
    
    // Add expense details section
    doc.fontSize(16).text('Expense Details', { underline: true });
    doc.moveDown(0.5);
    
    // Create a table for expenses
    const expenseTableTop = doc.y;
    let expenseTableY = expenseTableTop;
    
    // Table headers
    doc.fontSize(8)
       .text('Date', 50, expenseTableY, { width: 70 })
       .text('Category', 120, expenseTableY, { width: 100 })
       .text('Description', 220, expenseTableY, { width: 180 })
       .text('Amount', 400, expenseTableY, { width: 70 })
       .text('Payment', 470, expenseTableY, { width: 70 });
    
    expenseTableY += 15;
    
    // Draw header line
    doc.moveTo(50, expenseTableY - 5)
       .lineTo(540, expenseTableY - 5)
       .stroke();
    
    // Sort expenses by date
    const sortedExpenses = [...expenses].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Table rows
    sortedExpenses.forEach(expense => {
      // Check if we need a new page
      if (expenseTableY > 700) {
        doc.addPage();
        expenseTableY = 50;
        
        // Add headers on new page
        doc.fontSize(8)
           .text('Date', 50, expenseTableY, { width: 70 })
           .text('Category', 120, expenseTableY, { width: 100 })
           .text('Description', 220, expenseTableY, { width: 180 })
           .text('Amount', 400, expenseTableY, { width: 70 })
           .text('Payment', 470, expenseTableY, { width: 70 });
        
        expenseTableY += 15;
        
        // Draw header line
        doc.moveTo(50, expenseTableY - 5)
           .lineTo(540, expenseTableY - 5)
           .stroke();
      }
      
      const categoryName = categoryMap.get(expense.category)?.name || expense.category;
      
      doc.fontSize(8)
         .text(expense.date, 50, expenseTableY, { width: 70 })
         .text(categoryName, 120, expenseTableY, { width: 100 })
         .text(expense.description, 220, expenseTableY, { width: 180 })
         .text(`$${expense.amount.toFixed(2)}`, 400, expenseTableY, { width: 70 })
         .text(expense.paymentMethod, 470, expenseTableY, { width: 70 });
      
      expenseTableY += 15;
    });
    
    // Draw bottom line
    doc.moveTo(50, expenseTableY - 5)
       .lineTo(540, expenseTableY - 5)
       .stroke();
    
    // Add footer with generation date
    doc.fontSize(8)
       .text(
         `Report generated on ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
         50,
         doc.page.height - 50,
         { align: 'center' }
       );
    
    // Finalize the PDF
    doc.end();
    
    // Return the PDF as a buffer
    return new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
    });
  }

  /**
   * Helper method to escape CSV fields
   */
  private escapeCsvField(field: string): string {
    // If the field contains commas, quotes, or newlines, wrap it in quotes
    if (/[",\n\r]/.test(field)) {
      // Double up any quotes and wrap the whole field in quotes
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}