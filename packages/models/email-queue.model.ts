export interface IEmailQueue {
    id: number; 
    template_id: number;
    recipient_email: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body_variables?: Record<string, any>; // JSONB field
    attachments?: Record<string, any>; // JSONB field
    status?: string;
    retry_count?: number;
    error_message?: string;
    priority?: number;
    scheduled_at?: Date;
    created_at?: Date;
    updated_at?: Date;
    sender_email?: string;
    tags?: Record<string, any>; // JSONB field
    is_urgent?: boolean;
  }
  