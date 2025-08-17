import { User } from '@/types'

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface EmailProvider {
  name: string
  sendEmail: (to: string, template: EmailTemplate) => Promise<void>
}

export class EmailService {
  private provider: EmailProvider

  constructor(provider?: EmailProvider) {
    this.provider = provider || new ConsoleEmailProvider()
  }

  private async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    try {
      if (!to || !template) {
        throw new Error('Email address and template are required')
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(to)) {
        throw new Error('Invalid email address format')
      }

      await this.provider.sendEmail(to, template)
      
      console.log(`✅ Email sent successfully to: ${to}`)
    } catch (error) {
      console.error('❌ Failed to send email:', error)
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async sendSupplierRegistrationConfirmation(user: User): Promise<void> {
    if (!user || !user.email) {
      throw new Error('User and email are required')
    }

    const template: EmailTemplate = {
      subject: 'Supplier Registration Confirmation - NubiaGo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to NubiaGo!</h2>
        <p>Dear ${(user as any).displayName || user.name || 'Valued Supplier'},</p>
          <p>Thank you for registering as a supplier on NubiaGo. Your application has been received and is currently under review.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">What happens next?</h3>
            <ul>
              <li>Our admin team will review your business documents</li>
              <li>We'll verify your business information</li>
              <li>Background checks will be performed</li>
              <li>You'll receive an email notification of the decision</li>
            </ul>
            <p><strong>Approval typically takes 1-3 business days.</strong></p>
          </div>
          
          <p>If you have any questions, please contact our support team at <a href="mailto:support@nubiago.com">support@nubiago.com</a></p>
          
          <p>Best regards,<br>The NubiaGo Team</p>
        </div>
      `,
      text: `
        Welcome to NubiaGo!
        
      Dear ${(user as any).displayName || user.name || 'Valued Supplier'},
        
        Thank you for registering as a supplier on NubiaGo. Your application has been received and is currently under review.
        
        What happens next?
        - Our admin team will review your business documents
        - We'll verify your business information
        - Background checks will be performed
        - You'll receive an email notification of the decision
        
        Approval typically takes 1-3 business days.
        
        If you have any questions, please contact our support team at support@nubiago.com
        
        Best regards,
        The NubiaGo Team
      `
    }

    await this.sendEmail(user.email, template)
  }

  async sendSupplierApprovalSuccess(user: User, approvedBy: string): Promise<void> {
    if (!user || !user.email) {
      throw new Error('User and email are required')
    }

    const template: EmailTemplate = {
      subject: 'Congratulations! Your Supplier Account is Approved - NubiaGo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">🎉 Your Account is Approved!</h2>
        <p>Dear ${(user as any).displayName || user.name || 'Valued Supplier'},</p>
          <p>Great news! Your supplier account has been approved and is now active on NubiaGo.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3 style="margin-top: 0; color: #059669;">What you can do now:</h3>
            <ul>
              <li>Access your supplier dashboard</li>
              <li>Add products to your catalog</li>
              <li>Manage orders and inventory</li>
              <li>View analytics and reports</li>
            </ul>
          </div>
          
          <p><strong>Next steps:</strong></p>
          <ol>
            <li>Log in to your account at <a href="https://nubiago.com/supplier">nubiago.com/supplier</a></li>
            <li>Complete your business profile</li>
            <li>Add your first products</li>
            <li>Set up your payment methods</li>
          </ol>
          
          <p>If you need help getting started, our support team is here to assist you.</p>
          
          <p>Best regards,<br>The NubiaGo Team</p>
        </div>
      `,
      text: `
        Congratulations! Your Account is Approved!
        
      Dear ${(user as any).displayName || user.name || 'Valued Supplier'},
        
        Great news! Your supplier account has been approved and is now active on NubiaGo.
        
        What you can do now:
        - Access your supplier dashboard
        - Add products to your catalog
        - Manage orders and inventory
        - View analytics and reports
        
        Next steps:
        1. Log in to your account at nubiago.com/supplier
        2. Complete your business profile
        3. Add your first products
        4. Set up your payment methods
        
        If you need help getting started, our support team is here to assist you.
        
        Best regards,
        The NubiaGo Team
      `
    }

    await this.sendEmail(user.email, template)
  }

  async sendSupplierRejection(user: User, reason: string, rejectedBy: string): Promise<void> {
    if (!user || !user.email) {
      throw new Error('User and email are required')
    }

    if (!reason) {
      throw new Error('Rejection reason is required')
    }

    const template: EmailTemplate = {
      subject: 'Supplier Application Update - NubiaGo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Application Status Update</h2>
        <p>Dear ${(user as any).displayName || user.name || 'Valued Applicant'},</p>
          <p>Thank you for your interest in becoming a supplier on NubiaGo. After careful review of your application, we regret to inform you that we are unable to approve your supplier account at this time.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #dc2626;">Reason for Rejection:</h3>
            <p>${reason}</p>
          </div>
          
          <p><strong>What you can do:</strong></p>
          <ul>
            <li>Review the feedback provided above</li>
            <li>Address any issues mentioned</li>
            <li>Reapply in 30 days with updated information</li>
            <li>Contact our support team for clarification</li>
          </ul>
          
          <p>If you believe this decision was made in error or if you have additional information to share, please contact our support team at <a href="mailto:support@nubiago.com">support@nubiago.com</a></p>
          
          <p>We appreciate your interest in NubiaGo and wish you the best in your future endeavors.</p>
          
          <p>Best regards,<br>The NubiaGo Team</p>
        </div>
      `,
      text: `
        Application Status Update
        
      Dear ${(user as any).displayName || user.name || 'Valued Applicant'},
        
        Thank you for your interest in becoming a supplier on NubiaGo. After careful review of your application, we regret to inform you that we are unable to approve your supplier account at this time.
        
        Reason for Rejection:
        ${reason}
        
        What you can do:
        - Review the feedback provided above
        - Address any issues mentioned
        - Reapply in 30 days with updated information
        - Contact our support team for clarification
        
        If you believe this decision was made in error or if you have additional information to share, please contact our support team at support@nubiago.com
        
        We appreciate your interest in NubiaGo and wish you the best in your future endeavors.
        
        Best regards,
        The NubiaGo Team
      `
    }

    await this.sendEmail(user.email, template)
  }

  async sendAccountSuspension(user: User, reason: string, suspendedBy: string): Promise<void> {
    if (!user || !user.email) {
      throw new Error('User and email are required')
    }

    if (!reason) {
      throw new Error('Suspension reason is required')
    }

    const template: EmailTemplate = {
      subject: 'Account Suspension Notice - NubiaGo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Account Suspension Notice</h2>
        <p>Dear ${(user as any).displayName || user.name || 'Valued User'},</p>
          <p>We regret to inform you that your NubiaGo account has been suspended due to a violation of our terms of service.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #dc2626;">Reason for Suspension:</h3>
            <p>${reason}</p>
          </div>
          
          <p><strong>What this means:</strong></p>
          <ul>
            <li>Your account is temporarily disabled</li>
            <li>You cannot access your dashboard or make transactions</li>
            <li>Your listings may be temporarily hidden</li>
            <li>You can still contact support for assistance</li>
          </ul>
          
          <p><strong>Next steps:</strong></p>
          <ol>
            <li>Review our terms of service and community guidelines</li>
            <li>Address the issue that led to the suspension</li>
            <li>Contact our support team to request account reactivation</li>
            <li>Provide any additional information or clarification needed</li>
          </ol>
          
          <p>If you believe this suspension was made in error, please contact our support team immediately at <a href="mailto:support@nubiago.com">support@nubiago.com</a></p>
          
          <p>Best regards,<br>The NubiaGo Team</p>
        </div>
      `,
      text: `
        Account Suspension Notice
        
      Dear ${(user as any).displayName || user.name || 'Valued User'},
        
        We regret to inform you that your NubiaGo account has been suspended due to a violation of our terms of service.
        
        Reason for Suspension:
        ${reason}
        
        What this means:
        - Your account is temporarily disabled
        - You cannot access your dashboard or make transactions
        - Your listings may be temporarily hidden
        - You can still contact support for assistance
        
        Next steps:
        1. Review our terms of service and community guidelines
        2. Address the issue that led to the suspension
        3. Contact our support team to request account reactivation
        4. Provide any additional information or clarification needed
        
        If you believe this suspension was made in error, please contact our support team immediately at support@nubiago.com
        
        Best regards,
        The NubiaGo Team
      `
    }

    await this.sendEmail(user.email, template)
  }

  async sendAccountReactivation(user: User, reactivatedBy: string): Promise<void> {
    if (!user || !user.email) {
      throw new Error('User and email are required')
    }

    const template: EmailTemplate = {
      subject: 'Account Reactivated - Welcome Back to NubiaGo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">🎉 Welcome Back!</h2>
        <p>Dear ${(user as any).displayName || user.name || 'Valued User'},</p>
          <p>Great news! Your NubiaGo account has been reactivated and you can now access all features and services.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3 style="margin-top: 0; color: #059669;">Your account is now:</h3>
            <ul>
              <li>✅ Fully active and accessible</li>
              <li>✅ Ready for transactions</li>
              <li>✅ All features restored</li>
              <li>✅ Your listings are visible again</li>
            </ul>
          </div>
          
          <p><strong>What you can do now:</strong></p>
          <ul>
            <li>Log in to your account at <a href="https://nubiago.com/login">nubiago.com/login</a></li>
            <li>Continue with your business activities</li>
            <li>Access your dashboard and analytics</li>
            <li>Manage your products and orders</li>
          </ul>
          
          <p>Thank you for your patience during this process. We appreciate your business and look forward to serving you again.</p>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>The NubiaGo Team</p>
        </div>
      `,
      text: `
        Welcome Back!
        
      Dear ${(user as any).displayName || user.name || 'Valued User'},
        
        Great news! Your NubiaGo account has been reactivated and you can now access all features and services.
        
        Your account is now:
        ✅ Fully active and accessible
        ✅ Ready for transactions
        ✅ All features restored
        ✅ Your listings are visible again
        
        What you can do now:
        - Log in to your account at nubiago.com/login
        - Continue with your business activities
        - Access your dashboard and analytics
        - Manage your products and orders
        
        Thank you for your patience during this process. We appreciate your business and look forward to serving you again.
        
        If you have any questions or need assistance, please don't hesitate to contact our support team.
        
        Best regards,
        The NubiaGo Team
      `
    }

    await this.sendEmail(user.email, template)
  }
}

// Console email provider for development/testing
class ConsoleEmailProvider implements EmailProvider {
  name = 'console'

  async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    console.log('📧 Sending email:')
    console.log(`To: ${to}`)
    console.log(`Subject: ${template.subject}`)
    console.log(`Content: ${template.text}`)
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

// Export a default instance
export const emailService = new EmailService() 
