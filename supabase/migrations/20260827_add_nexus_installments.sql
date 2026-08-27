-- Create repayment installments tracking table
CREATE TABLE IF NOT EXISTS public.nexus_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id TEXT NOT NULL REFERENCES public.nexus_loans(id) ON DELETE CASCADE,
    installment_no INTEGER NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    principal_amount NUMERIC(15, 2) NOT NULL,
    interest_amount NUMERIC(15, 2) NOT NULL,
    total_payment NUMERIC(15, 2) NOT NULL,
    remaining_balance NUMERIC(15, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'overdue')),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_nexus_installments_loan_id ON public.nexus_installments(loan_id);
CREATE INDEX IF NOT EXISTS idx_nexus_installments_status ON public.nexus_installments(status);
