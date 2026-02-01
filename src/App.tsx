import { useState } from 'react';

interface EquityInput {
    homeValue: number;
    mortgageBalance: number;
    borrowAmount: number;
    loanRate: number;
    helocRate: number;
}

const LOAN_TERM_YEARS = 15;
const HELOC_DRAW_YEARS = 10;

const EQUITY_TIPS: string[] = [
    'Home equity loans offer fixed rates and predictable payments',
    'HELOCs provide flexible borrowing with variable rates',
    'Interest may be tax-deductible if used for home improvements',
    'Compare total costs including fees before deciding'
];

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

function App() {
    const [values, setValues] = useState<EquityInput>({ homeValue: 450000, mortgageBalance: 250000, borrowAmount: 50000, loanRate: 8.5, helocRate: 9.0 });
    const handleChange = (field: keyof EquityInput, value: number) => setValues(prev => ({ ...prev, [field]: value }));

    const availableEquity = Math.max(0, values.homeValue * 0.8 - values.mortgageBalance);

    // Home Equity Loan: Fixed rate, fixed term amortization
    const calcMonthlyPayment = (principal: number, annualRate: number, years: number): number => {
        const monthlyRate = annualRate / 100 / 12;
        const totalPayments = years * 12;
        if (monthlyRate <= 0) return principal / totalPayments;
        return (principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    };

    const loanMonthly = calcMonthlyPayment(values.borrowAmount, values.loanRate, LOAN_TERM_YEARS);
    const loanTotalPaid = Math.round(loanMonthly * LOAN_TERM_YEARS * 12);
    const loanTotalInterest = Math.round(loanTotalPaid - values.borrowAmount);

    // HELOC: Interest-only during draw period (simplified)
    const helocMonthlyRate = values.helocRate / 100 / 12;
    const helocInterestOnly = Math.round(values.borrowAmount * helocMonthlyRate);
    const helocTotalInterest = Math.round(helocInterestOnly * HELOC_DRAW_YEARS * 12);
    const helocTotalPaid = values.borrowAmount + helocTotalInterest;

    const lowerOption = loanTotalInterest <= helocTotalInterest ? 'Home Equity Loan' : 'HELOC';
    const costDifference = Math.abs(loanTotalInterest - helocTotalInterest);

    const breakdownData = [
        { label: 'Home Equity Loan (15yr)', value: fmt(loanTotalPaid), isTotal: false },
        { label: `HELOC (${HELOC_DRAW_YEARS}yr draw)`, value: fmt(helocTotalPaid), isTotal: false },
        { label: 'Estimated Difference', value: fmt(costDifference), isTotal: true }
    ];

    return (
        <main style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <header style={{ textAlign: 'center', marginBottom: 'var(--space-2)' }}>
                <h1 style={{ marginBottom: 'var(--space-2)' }}>Home Equity Loan vs HELOC Calculator (2026)</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>Compare estimated costs of each option</p>
            </header>

            <div className="card">
                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div>
                            <label htmlFor="homeValue">Home Value ($)</label>
                            <input id="homeValue" type="number" min="50000" max="5000000" step="10000" value={values.homeValue || ''} onChange={(e) => handleChange('homeValue', parseInt(e.target.value) || 0)} placeholder="450000" />
                        </div>
                        <div>
                            <label htmlFor="mortgageBalance">Mortgage Balance ($)</label>
                            <input id="mortgageBalance" type="number" min="0" max="5000000" step="5000" value={values.mortgageBalance || ''} onChange={(e) => handleChange('mortgageBalance', parseInt(e.target.value) || 0)} placeholder="250000" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="borrowAmount">Amount to Borrow ($)</label>
                        <input id="borrowAmount" type="number" min="5000" max="500000" step="1000" value={values.borrowAmount || ''} onChange={(e) => handleChange('borrowAmount', parseInt(e.target.value) || 0)} placeholder="50000" />
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>Available equity (80% LTV): {fmt(availableEquity)}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div>
                            <label htmlFor="loanRate">Loan Interest Rate (%)</label>
                            <input id="loanRate" type="number" min="0" max="20" step="0.125" value={values.loanRate || ''} onChange={(e) => handleChange('loanRate', parseFloat(e.target.value) || 0)} placeholder="8.5" />
                        </div>
                        <div>
                            <label htmlFor="helocRate">HELOC Interest Rate (%)</label>
                            <input id="helocRate" type="number" min="0" max="20" step="0.125" value={values.helocRate || ''} onChange={(e) => handleChange('helocRate', parseFloat(e.target.value) || 0)} placeholder="9.0" />
                        </div>
                    </div>
                    <button className="btn-primary" type="button">Compare Options</button>
                </div>
            </div>

            <div className="card results-panel">
                <div className="text-center">
                    <h2 className="result-label" style={{ marginBottom: 'var(--space-2)' }}>Home Equity Loan Monthly Payment</h2>
                    <div className="result-hero">{fmt(Math.round(loanMonthly))}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>fixed for {LOAN_TERM_YEARS} years</div>
                </div>
                <hr className="result-divider" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', textAlign: 'center' }}>
                    <div>
                        <div className="result-label">HELOC Interest-Only</div>
                        <div className="result-value">{fmt(helocInterestOnly)}/mo</div>
                    </div>
                    <div style={{ borderLeft: '1px solid #BAE6FD', paddingLeft: 'var(--space-4)' }}>
                        <div className="result-label">Lower Total Interest</div>
                        <div className="result-value" style={{ color: '#16A34A' }}>{lowerOption}</div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)' }}>Key Considerations</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-3)' }}>
                    {EQUITY_TIPS.map((item, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '0.9375rem', color: 'var(--color-text-secondary)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-primary)', flexShrink: 0 }} />{item}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="ad-container"><span>Advertisement</span></div>

            <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: '1rem' }}>Cost Comparison</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem' }}>
                    <tbody>
                        {breakdownData.map((row, i) => (
                            <tr key={i} style={{ borderBottom: i === breakdownData.length - 1 ? 'none' : '1px solid var(--color-border)', backgroundColor: row.isTotal ? '#F0F9FF' : (i % 2 ? '#F8FAFC' : 'transparent') }}>
                                <td style={{ padding: 'var(--space-3) var(--space-6)', color: 'var(--color-text-secondary)', fontWeight: row.isTotal ? 600 : 400 }}>{row.label}</td>
                                <td style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'right', fontWeight: 600, color: row.isTotal ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{row.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ maxWidth: 600, margin: '0 auto', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                <p>This calculator provides estimates comparing home equity loan and HELOC costs using simplified assumptions. Actual rates, terms, fees, and eligibility vary by lender and creditworthiness. The figures shown are estimates only and do not constitute financial advice or a loan offer. HELOC rates are typically variable and may change over time. Consult a mortgage professional for personalized guidance.</p>
            </div>

            <footer style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', marginTop: 'var(--space-8)' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--space-4)', fontSize: '0.875rem' }}>
                    <li>• Estimates only</li><li>• Simplified assumptions</li><li>• Free to use</li>
                </ul>
                <p style={{ marginTop: 'var(--space-4)', fontSize: '0.75rem' }}>&copy; 2026 Home Equity Calculator</p>
            </footer>

            <div className="ad-container ad-sticky"><span>Advertisement</span></div>
        </main>
    );
}

export default App;
