import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { LoanApplication } from '../types';
import { Printer, X } from 'lucide-react';

interface KhmerContractPrintProps {
  application: LoanApplication | null;
  onClose: () => void;
}

// Convert digit characters to Khmer numbers
export function toKhmerDigits(numStr: string | number): string {
  const digitsMap: { [key: string]: string } = {
    '0': '០', '1': '១', '2': '២', '3': '៣', '4': '៤',
    '5': '៥', '6': '៦', '7': '៧', '8': '៨', '9': '៩'
  };
  return String(numStr).split('').map(char => digitsMap[char] || char).join('');
}

// Convert numbers to Khmer written text words
export function numberToKhmerWords(num: number): string {
  if (num === 0) return 'សូន្យ';
  
  const khmerDigits = ['សូន្យ', 'មួយ', 'ពីរ', 'បី', 'បួន', 'ប្រាំ', 'ប្រាំមួយ', 'ប្រាំពីរ', 'ប្រាំបី', 'ប្រាំបួន'];
  const khmerTens = ['', 'ដប់', 'ម្ភៃ', 'សាមសិប', 'សែសិប', 'ហាសិប', 'ហុកសិប', 'ចិតសិប', 'ប៉ែតសិប', 'កៅសិប'];
  
  const helper = (n: number): string => {
    if (n < 10) return khmerDigits[n];
    if (n < 100) {
      const ten = Math.floor(n / 10);
      const rem = n % 10;
      return khmerTens[ten] + (rem > 0 ? khmerDigits[rem] : '');
    }
    if (n < 1000) {
      const hundred = Math.floor(n / 100);
      const rem = n % 100;
      return khmerDigits[hundred] + 'រយ' + (rem > 0 ? helper(rem) : '');
    }
    if (n < 10000) {
      const thousand = Math.floor(n / 1000);
      const rem = n % 1000;
      return khmerDigits[thousand] + 'ពាន់' + (rem > 0 ? helper(rem) : '');
    }
    if (n < 100000) {
      const tenThousand = Math.floor(n / 10000);
      const rem = n % 10000;
      return khmerDigits[tenThousand] + 'ម៉ឺន' + (rem > 0 ? helper(rem) : '');
    }
    if (n < 1000000) {
      const hundredThousand = Math.floor(n / 100000);
      const rem = n % 100000;
      return khmerDigits[hundredThousand] + 'សែន' + (rem > 0 ? helper(rem) : '');
    }
    const million = Math.floor(n / 1000000);
    const rem = n % 1000000;
    return helper(million) + 'លាន' + (rem > 0 ? helper(rem) : '');
  };

  return helper(Math.floor(num));
}

export default function KhmerContractPrint({ application, onClose }: KhmerContractPrintProps) {
  if (!application) return null;

  // Formatted date values
  const today = new Date();
  const phoneVal = application.applicantEmail?.includes('@nexus.local') 
    ? application.applicantEmail.split('@')[0] 
    : '092XXXXXX';

  const getInputWidth = (val: string, minWidth: number = 30) => {
    return `${Math.max((val || '').length * 8.5 + 12, minWidth)}px`;
  };

  const renderPrintRadio = (checked: boolean) => {
    return (
      <span className="print-radio-indicator">
        {checked ? '☑' : '☐'}
      </span>
    );
  };

  // ── INLINE EDITABLE STATES ──
  // Lender (Party A)
  const [lenderName, setLenderName] = useState('');
  const [lenderBirthDay, setLenderBirthDay] = useState('');
  const [lenderBirthMonth, setLenderBirthMonth] = useState('');
  const [lenderBirthYear, setLenderBirthYear] = useState('');
  const [lenderIdCard, setLenderIdCard] = useState('');
  const [lenderIssueDay, setLenderIssueDay] = useState('');
  const [lenderIssueMonth, setLenderIssueMonth] = useState('');
  const [lenderIssueYear, setLenderIssueYear] = useState('');
  const [lenderVillage, setLenderVillage] = useState('');
  const [lenderCommune, setLenderCommune] = useState('');
  const [lenderDistrict, setLenderDistrict] = useState('');
  const [lenderProvince, setLenderProvince] = useState('');

  // Borrower (Party B)
  const [borrowerName, setBorrowerName] = useState(application.applicantName);
  const [borrowerGender, setBorrowerGender] = useState('');
  const [borrowerBirthDate, setBorrowerBirthDate] = useState('');
  const [borrowerNationality, setBorrowerNationality] = useState('');
  const [borrowerIdCard, setBorrowerIdCard] = useState('');
  const [borrowerIssueDay, setBorrowerIssueDay] = useState('');
  const [borrowerIssueMonth, setBorrowerIssueMonth] = useState('');
  const [borrowerIssueYear, setBorrowerIssueYear] = useState('');
  const [borrowerHouseNo, setBorrowerHouseNo] = useState('');
  const [borrowerCommune, setBorrowerCommune] = useState('');
  const [borrowerDistrict, setBorrowerDistrict] = useState('');
  const [borrowerProvince, setBorrowerProvince] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState(phoneVal);

  // Co-borrower 1 (សហកូនបំណុល ១)
  const [coborrower1Name, setCoborrower1Name] = useState('');
  const [coborrower1Gender, setCoborrower1Gender] = useState('');
  const [coborrower1Age, setCoborrower1Age] = useState('');
  const [coborrower1IdCard, setCoborrower1IdCard] = useState('');
  const [coborrower1IssueDay, setCoborrower1IssueDay] = useState('');
  const [coborrower1IssueMonth, setCoborrower1IssueMonth] = useState('');
  const [coborrower1IssueYear, setCoborrower1IssueYear] = useState('');
  const [coborrower1House, setCoborrower1House] = useState('');
  const [coborrower1Commune, setCoborrower1Commune] = useState('');
  const [coborrower1District, setCoborrower1District] = useState('');
  const [coborrower1Province, setCoborrower1Province] = useState('');
  const [coborrower1Phone, setCoborrower1Phone] = useState('');

  // Co-borrower 2 (សហកូនបំណុល ២)
  const [coborrower2Name, setCoborrower2Name] = useState('');
  const [coborrower2Gender, setCoborrower2Gender] = useState('');
  const [coborrower2Age, setCoborrower2Age] = useState('');
  const [coborrower2IdCard, setCoborrower2IdCard] = useState('');
  const [coborrower2IssueDay, setCoborrower2IssueDay] = useState('');
  const [coborrower2IssueMonth, setCoborrower2IssueMonth] = useState('');
  const [coborrower2IssueYear, setCoborrower2IssueYear] = useState('');
  const [coborrower2House, setCoborrower2House] = useState('');
  const [coborrower2Commune, setCoborrower2Commune] = useState('');
  const [coborrower2District, setCoborrower2District] = useState('');
  const [coborrower2Province, setCoborrower2Province] = useState('');
  const [coborrower2Phone, setCoborrower2Phone] = useState('');

  // Guarantor 1 (អ្នកធានា)
  const [g1Name, setG1Name] = useState('');
  const [g1Gender, setG1Gender] = useState('');
  const [g1Age, setG1Age] = useState('');
  const [g1IdCard, setG1IdCard] = useState('');
  const [g1IssueDay, setG1IssueDay] = useState('');
  const [g1IssueMonth, setG1IssueMonth] = useState('');
  const [g1IssueYear, setG1IssueYear] = useState('');
  const [g1HouseNo, setG1HouseNo] = useState('');
  const [g1Commune, setG1Commune] = useState('');
  const [g1District, setG1District] = useState('');
  const [g1Province, setG1Province] = useState('');

  // Guarantor 2 (សហអ្នកធានា)
  const [g2Name, setG2Name] = useState('');
  const [g2Gender, setG2Gender] = useState('');
  const [g2Age, setG2Age] = useState('');
  const [g2IdCard, setG2IdCard] = useState('');
  const [g2IssueDay, setG2IssueDay] = useState('');
  const [g2IssueMonth, setG2IssueMonth] = useState('');
  const [g2IssueYear, setG2IssueYear] = useState('');
  const [g2HouseNo, setG2HouseNo] = useState('');
  const [g2Commune, setG2Commune] = useState('');
  const [g2District, setG2District] = useState('');
  const [g2Province, setG2Province] = useState('');
  const [guarantorsPhone, setGuarantorsPhone] = useState('');

  // Collaterals (1.1)
  const [collateral1Type, setCollateral1Type] = useState('');
  const [collateral1No, setCollateral1No] = useState('');
  const [collateral1Owner, setCollateral1Owner] = useState('');
  const [collateral2Type, setCollateral2Type] = useState('');
  const [collateral2No, setCollateral2No] = useState('');
  const [collateral2Owner, setCollateral2Owner] = useState('');

  // Loan Amount / Interest (1.2 - 1.7)
  const [loanAmountDigits, setLoanAmountDigits] = useState(`$${application.amount}`);
  const [loanAmountWords, setLoanAmountWords] = useState(`${numberToKhmerWords(application.amount)} ដុល្លារ`);
  const [interestRateVal, setInterestRateVal] = useState('1.5%');
  const [interestPeriod, setInterestPeriod] = useState('monthly'); // daily, weekly, monthly, other
  const [loanDuration, setLoanDuration] = useState(`${application.durationMonths} ខែ`);
  const [adminFeeDigits, setAdminFeeDigits] = useState('$0');
  const [repaymentMethod, setRepaymentMethod] = useState('office'); // office, agent, other
  const [insuranceCoverage, setInsuranceCoverage] = useState('no'); // yes, no
  const [insuranceRate, setInsuranceRate] = useState('100%');

  // Checklist attachments table
  const [check1Desc, setCheck1Desc] = useState('វិក័យបត្របង់ប្រាក់');
  const [check1Qty, setCheck1Qty] = useState('');
  const [check1Remark, setCheck1Remark] = useState('');
  const [check1Comment, setCheck1Comment] = useState('');

  const [check2Desc, setCheck2Desc] = useState('');
  const [check2Qty, setCheck2Qty] = useState('');
  const [check2Remark, setCheck2Remark] = useState('');
  const [check2Comment, setCheck2Comment] = useState('');

  const [check3Desc, setCheck3Desc] = useState('');
  const [check3Qty, setCheck3Qty] = useState('');
  const [check3Remark, setCheck3Remark] = useState('');
  const [check3Comment, setCheck3Comment] = useState('');

  const [check4Desc, setCheck4Desc] = useState('');
  const [check4Qty, setCheck4Qty] = useState('');
  const [check4Remark, setCheck4Remark] = useState('');
  const [check4Comment, setCheck4Comment] = useState('');

  const [check5Desc, setCheck5Desc] = useState('');
  const [check5Qty, setCheck5Qty] = useState('');
  const [check5Remark, setCheck5Remark] = useState('');
  const [check5Comment, setCheck5Comment] = useState('');

  // Official Signature Dates
  const [officialDay, setOfficialDay] = useState('');
  const [officialMonth, setOfficialMonth] = useState('');
  const [officialYear, setOfficialYear] = useState('');
  const [officialTitle, setOfficialTitle] = useState('ចៅសង្កាត់/មេភូមិ/កងរាជអាវុធហត្ថ');

  // Contract Signature Date
  const [sigDay, setSigDay] = useState(String(today.getDate()));
  const [sigMonth, setSigMonth] = useState(today.toLocaleString('en-US', { month: 'short' }));
  const [sigYear, setSigYear] = useState(String(today.getFullYear()));

  const triggerPrint = () => {
    window.print();
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col z-50 overflow-y-auto khmer-contract-editor-modal">
      
      {/* Dynamic Scoped Print CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .font-khmer {
          font-family: 'Hanuman', 'Khmer OS Battambang', serif;
        }
        .font-khmer-moul {
          font-family: 'Moul', 'Khmer OS Muol Light', sans-serif;
        }

        .inline-contract-input {
          display: inline-block !important;
          width: auto;
          border: none !important;
          border-bottom: 1px dashed #94a3b8 !important;
          background: transparent !important;
          text-align: center !important;
          font-weight: bold !important;
          color: #1e293b !important;
          padding: 0 4px !important;
          outline: none !important;
          transition: all 0.2s;
        }
        .inline-contract-input:focus {
          border-bottom-color: #0d9488 !important;
          background-color: rgba(13, 148, 136, 0.05) !important;
        }

        .print-radio-indicator {
          display: none;
        }

        @media print {
          .print-radio-indicator {
            display: inline-block !important;
            margin-right: 4px !important;
            font-family: Arial, sans-serif !important;
            font-size: 14px !important;
            color: black !important;
          }
          .printable-contract-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            min-height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
            display: block !important;
            font-size: 11.5px !important;
            line-height: 20px !important;
          }
          .printable-contract-container > * + * {
            margin-top: 12px !important;
          }
          .contract-print-page > * + * {
            margin-top: 6px !important;
          }
          .contract-print-page {
            page-break-after: always !important;
            break-after: always !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            background: white !important;
            box-sizing: border-box !important;
            height: auto !important;
            min-height: auto !important;
          }
          .contract-print-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .inline-contract-input {
            border-bottom: none !important;
            color: black !important;
            font-weight: bold !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            pointer-events: none;
            width: auto !important;
            display: inline-block !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .khmer-contract-editor-modal {
            background: transparent !important;
            padding: 0 !important;
            position: relative !important;
            overflow: visible !important;
            height: auto !important;
            min-height: auto !important;
            display: block !important;
          }
        }
      `}} />

      {/* Editor Modal Header */}
      <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center z-50 no-print">
        <div>
          <h3 className="text-white text-[16px] font-bold font-sans">
            ✍️ Edit and Customize Khmer Loan Agreement (4-Page Set)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Fill in the blanks below directly inside the contract template, then click print.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={triggerPrint}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-[12.5px] font-bold shadow-md hover:brightness-105 active:scale-97 cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Contract</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Contract Template Paper Wrapper */}
      <div className="flex-1 flex justify-center py-8 px-4 bg-slate-800/40">
        
        {/* Printable Contract Body */}
        <div className="printable-contract-container w-full max-w-[800px] bg-white rounded-2xl shadow-xl border border-slate-200 p-12 text-[13px] leading-[26px] text-slate-800 font-khmer no-print-backdrop space-y-12">
          
          {/* ─────────────────────────────────────────────────────────────────
              PAGE 1 & 2: LOAN AGREEMENT
              ───────────────────────────────────────────────────────────────── */}
          <div className="contract-print-page space-y-6">
            {/* Kingdom Header */}
            <div className="text-center space-y-1.5 mb-6">
              <h1 className="font-khmer-moul text-[15px] tracking-wider">ព្រះរាជាណាចក្រកម្ពុជា</h1>
              <h2 className="font-khmer-moul text-[13.5px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</h2>
              <div className="w-20 h-[1.5px] bg-slate-900 mx-auto mt-2"></div>
              <h3 className="font-khmer-moul text-[16px] pt-4 underline">កិច្ចសន្យាខ្ចីប្រាក់</h3>
            </div>

            {/* Parties Definition Section */}
            <div className="space-y-4">
              {/* Party A - Lender */}
              <p>
                <strong>ម្ចាស់បំណុល៖</strong> ឈ្មោះ 
                <input type="text" value={lenderName} onChange={e => setLenderName(e.target.value)} className="inline-contract-input" style={{ width: '130px' }} />
                កើតថ្ងៃទី 
                <input type="text" value={lenderBirthDay} onChange={e => setLenderBirthDay(e.target.value)} className="inline-contract-input" style={{ width: '40px' }} />
                ខែ 
                <input type="text" value={lenderBirthMonth} onChange={e => setLenderBirthMonth(e.target.value)} className="inline-contract-input" style={{ width: '70px' }} />
                ឆ្នាំ 
                <input type="text" value={lenderBirthYear} onChange={e => setLenderBirthYear(e.target.value)} className="inline-contract-input" style={{ width: '60px' }} />
                កាន់អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរលេខ 
                <input type="text" value={lenderIdCard} onChange={e => setLenderIdCard(e.target.value)} className="inline-contract-input" style={{ width: '130px' }} />
                ចុះថ្ងៃទី 
                <input type="text" value={lenderIssueDay} onChange={e => setLenderIssueDay(e.target.value)} className="inline-contract-input" style={{ width: '40px' }} />
                ខែ 
                <input type="text" value={lenderIssueMonth} onChange={e => setLenderIssueMonth(e.target.value)} className="inline-contract-input" style={{ width: '75px' }} />
                ឆ្នាំ 
                <input type="text" value={lenderIssueYear} onChange={e => setLenderIssueYear(e.target.value)} className="inline-contract-input" style={{ width: '60px' }} />
                មានអាសយដ្ឋានបច្ចុប្បន្ននៅភូមិ 
                <input type="text" value={lenderVillage} onChange={e => setLenderVillage(e.target.value)} className="inline-contract-input" style={{ width: '110px' }} />
                ឃុំ/សង្កាត់ 
                <input type="text" value={lenderCommune} onChange={e => setLenderCommune(e.target.value)} className="inline-contract-input" style={{ width: '100px' }} />
                ស្រុក/ខណ្ឌ 
                <input type="text" value={lenderDistrict} onChange={e => setLenderDistrict(e.target.value)} className="inline-contract-input" style={{ width: '100px' }} />
                ខេត្ត/រាជធានី 
                <input type="text" value={lenderProvince} onChange={e => setLenderProvince(e.target.value)} className="inline-contract-input" style={{ width: '120px' }} />
                តទៅនេះហៅថា ភាគី "ក"។
              </p>

              <div className="text-center font-bold text-[12px] my-2">ដោយ និងរវាង</div>

              {/* Party B - Borrower */}
              <p>
                <strong>កូនបំណុល៖</strong> ឈ្មោះ 
                <input type="text" value={borrowerName} onChange={e => setBorrowerName(e.target.value)} className="inline-contract-input" style={{ width: '120px' }} />
                ភេទ 
                <input type="text" value={borrowerGender} onChange={e => setBorrowerGender(e.target.value)} className="inline-contract-input" style={{ width: '45px' }} />
                កើតថ្ងៃទី 
                <input type="text" value={borrowerBirthDate} onChange={e => setBorrowerBirthDate(e.target.value)} className="inline-contract-input" style={{ width: '100px' }} />
                សញ្ជាតិ 
                <input type="text" value={borrowerNationality} onChange={e => setBorrowerNationality(e.target.value)} className="inline-contract-input" style={{ width: '60px' }} />
                កាន់អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរលេខ 
                <input type="text" value={borrowerIdCard} onChange={e => setBorrowerIdCard(e.target.value)} className="inline-contract-input" style={{ width: '135px' }} />
                ចុះថ្ងៃទី 
                <input type="text" value={borrowerIssueDay} onChange={e => setBorrowerIssueDay(e.target.value)} className="inline-contract-input" style={{ width: '40px' }} />
                ខែ 
                <input type="text" value={borrowerIssueMonth} onChange={e => setBorrowerIssueMonth(e.target.value)} className="inline-contract-input" style={{ width: '70px' }} />
                ឆ្នាំ 
                <input type="text" value={borrowerIssueYear} onChange={e => setBorrowerIssueYear(e.target.value)} className="inline-contract-input" style={{ width: '60px' }} />
                មានអាសយដ្ឋានបច្ចុប្បន្ននៅផ្ទះលេខ 
                <input type="text" value={borrowerHouseNo} onChange={e => setBorrowerHouseNo(e.target.value)} className="inline-contract-input" style={{ width: '50px' }} />
                ឃុំ/សង្កាត់ 
                <input type="text" value={borrowerCommune} onChange={e => setBorrowerCommune(e.target.value)} className="inline-contract-input" style={{ width: '100px' }} />
                ស្រុក/ខណ្ឌ 
                <input type="text" value={borrowerDistrict} onChange={e => setBorrowerDistrict(e.target.value)} className="inline-contract-input" style={{ width: '100px' }} />
                ខេត្ត/រាជធានី 
                <input type="text" value={borrowerProvince} onChange={e => setBorrowerProvince(e.target.value)} className="inline-contract-input" style={{ width: '120px' }} />
                តទៅនេះហៅថា ភាគី "ខ"។ លេខទំនាក់ទំនង៖ 
                <input type="text" value={borrowerPhone} onChange={e => setBorrowerPhone(e.target.value)} className="inline-contract-input" style={{ width: '110px' }} />
              </p>

              {/* Guarantors */}
              <p>
                <strong>ភាគីធានាបំណុល៖</strong> ឈ្មោះ 
                <input type="text" value={g1Name} onChange={e => setG1Name(e.target.value)} className="inline-contract-input" style={{ width: '110px' }} />
                ភេទ 
                <input type="text" value={g1Gender} onChange={e => setG1Gender(e.target.value)} className="inline-contract-input" style={{ width: '50px' }} />
                អាយុ 
                <input type="text" value={g1Age} onChange={e => setG1Age(e.target.value)} className="inline-contract-input" style={{ width: '40px' }} />
                ឆ្នាំ កាន់អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរលេខ 
                <input type="text" value={g1IdCard} onChange={e => setG1IdCard(e.target.value)} className="inline-contract-input" style={{ width: '120px' }} />
                ចុះថ្ងៃទី 
                <input type="text" value={g1IssueDay} onChange={e => setG1IssueDay(e.target.value)} className="inline-contract-input" style={{ width: '35px' }} />
                ខែ 
                <input type="text" value={g1IssueMonth} onChange={e => setG1IssueMonth(e.target.value)} className="inline-contract-input" style={{ width: '35px' }} />
                ឆ្នាំ 
                <input type="text" value={g1IssueYear} onChange={e => setG1IssueYear(e.target.value)} className="inline-contract-input" style={{ width: '40px' }} />
                មានអាសយដ្ឋានបច្ចុប្បន្ននៅផ្ទះលេខ 
                <input type="text" value={g1HouseNo} onChange={e => setG1HouseNo(e.target.value)} className="inline-contract-input" style={{ width: '40px' }} />
                ឃុំ/សង្កាត់ 
                <input type="text" value={g1Commune} onChange={e => setG1Commune(e.target.value)} className="inline-contract-input" style={{ width: '85px' }} />
                ស្រុក/ខណ្ឌ 
                <input type="text" value={g1District} onChange={e => setG1District(e.target.value)} className="inline-contract-input" style={{ width: '85px' }} />
                ខេត្ត/រាជធានី 
                <input type="text" value={g1Province} onChange={e => setG1Province(e.target.value)} className="inline-contract-input" style={{ width: '100px' }} />
                
                និង ឈ្មោះ 
                <input type="text" value={g2Name} onChange={e => setG2Name(e.target.value)} className="inline-contract-input" style={{ width: '110px' }} />
                ភេទ 
                <input type="text" value={g2Gender} onChange={e => setG2Gender(e.target.value)} className="inline-contract-input" style={{ width: '50px' }} />
                អាយុ 
                <input type="text" value={g2Age} onChange={e => setG2Age(e.target.value)} className="inline-contract-input" style={{ width: '40px' }} />
                ឆ្នាំ កាន់អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរលេខ 
                <input type="text" value={g2IdCard} onChange={e => setG2IdCard(e.target.value)} className="inline-contract-input" style={{ width: '120px' }} />
                ចុះថ្ងៃទី 
                <input type="text" value={g2IssueDay} onChange={e => setG2IssueDay(e.target.value)} className="inline-contract-input" style={{ width: '35px' }} />
                ខែ 
                <input type="text" value={g2IssueMonth} onChange={e => setG2IssueMonth(e.target.value)} className="inline-contract-input" style={{ width: '35px' }} />
                ឆ្នាំ 
                <input type="text" value={g2IssueYear} onChange={e => setG2IssueYear(e.target.value)} className="inline-contract-input" style={{ width: '40px' }} />
                មានអាសយដ្ឋានបច្ចុប្បន្ននៅផ្ទះលេខ 
                <input type="text" value={g2HouseNo} onChange={e => setG2HouseNo(e.target.value)} className="inline-contract-input" style={{ width: '40px' }} />
                ឃុំ/សង្កាត់ 
                <input type="text" value={g2Commune} onChange={e => setG2Commune(e.target.value)} className="inline-contract-input" style={{ width: '85px' }} />
                ស្រុក/ខណ្ឌ 
                <input type="text" value={g2District} onChange={e => setG2District(e.target.value)} className="inline-contract-input" style={{ width: '85px' }} />
                ខេត្ត/រាជធានី 
                <input type="text" value={g2Province} onChange={e => setG2Province(e.target.value)} className="inline-contract-input" style={{ width: '100px' }} />
                ។ លេខទំនាក់ទំនង៖ 
                <input type="text" value={guarantorsPhone} onChange={e => setGuarantorsPhone(e.target.value)} className="inline-contract-input" style={{ width: '110px' }} />
              </p>

              <p>ភាគី “ក” និង “ខ” បានព្រមព្រៀងគ្នាលើកិច្ចសន្យាខ្ចីចងការប្រាក់ ដោយអនុវត្តរាល់ប្រការដូចមានចែងខាងក្រោម៖</p>

              {/* Article 1 */}
              <div className="space-y-1.5 pt-2">
                <p className="font-bold underline text-[13.5px]">ប្រការ១៖ អំពីលក្ខខណ្ឌ នៃការផ្តល់នូវប្រាក់កម្ចី</p>
                <p>
                  ផ្អែកលើមូលដ្ឋាន នៃពាក្យស្នើសុំខ្ចីចងការ សេចក្តីណែនាំពីគោលការណ៍ និងលក្ខខណ្ឌនៃការខ្ចីចងការភាគី “ក” យល់ព្រមឲ្យភាគី “ខ” ខ្ចី ចងការហើយភាគី “ខ” ក៏យល់ព្រមទទួល និងសន្យាសងមកភាគី “ក” វិញជាដាច់ខាតនូវប្រាក់ខ្ចីចងការនេះតាមចំនួន និងរាល់លក្ខខណ្ឌដូចបានព្រមព្រៀងគ្នាដូចតទៅ៖
                </p>
                
                {/* Clause 1.1 Collaterals */}
                <div className="pl-4">
                  <p><strong>១.១ ក្រោមការដាក់បញ្ចាំដើម្បីធានាបំណុលទាំងដើម និងការប្រាក់</strong></p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>
                      ប្រភេទអចលន ឬចលនវត្ថុ៖ 
                      <input type="text" value={collateral1Type} onChange={e => setCollateral1Type(e.target.value)} className="inline-contract-input" style={{ width: '130px' }} />
                      លេខ 
                      <input type="text" value={collateral1No} onChange={e => setCollateral1No(e.target.value)} className="inline-contract-input" style={{ width: '120px' }} />
                      កម្មសិទ្ធិរបស់ឈ្មោះ 
                      <input type="text" value={collateral1Owner} onChange={e => setCollateral1Owner(e.target.value)} className="inline-contract-input" style={{ width: '130px' }} />
                      យល់ព្រមដាក់បញ្ចាំដោយស្ម័គ្រចិត្ត។
                    </li>
                    <li>
                      ប្រភេទអចលន ឬចលនវត្ថុ៖ 
                      <input type="text" value={collateral2Type} onChange={e => setCollateral2Type(e.target.value)} className="inline-contract-input" style={{ width: '130px' }} />
                      លេខ 
                      <input type="text" value={collateral2No} onChange={e => setCollateral2No(e.target.value)} className="inline-contract-input" style={{ width: '120px' }} />
                      កម្មសិទ្ធិរបស់ឈ្មោះ 
                      <input type="text" value={collateral2Owner} onChange={e => setCollateral2Owner(e.target.value)} className="inline-contract-input" style={{ width: '130px' }} />
                      យល់ព្រមដាក់បញ្ចាំដោយស្ម័គ្រចិត្ត។
                    </li>
                  </ul>
                </div>

                {/* Clause 1.2 Amount */}
                <div className="pl-4">
                  <p>
                    <strong>១.២ ប្រាក់ខ្ចីចងការភាគី “ខ” បានទទួលចំនួនជាលេខ៖</strong>
                    <input type="text" value={loanAmountDigits} onChange={e => setLoanAmountDigits(e.target.value)} className="inline-contract-input" style={{ width: '150px' }} />
                    ជាអក្សរ៖
                    <input type="text" value={loanAmountWords} onChange={e => setLoanAmountWords(e.target.value)} className="inline-contract-input" style={{ width: '250px' }} />
                  </p>
                </div>

                {/* Clause 1.3 Interest */}
                <div className="pl-4">
                  <p className="flex items-center gap-1.5 flex-wrap">
                    <strong>១.៣ អត្រាការប្រាក់៖</strong>
                    <input type="text" value={interestRateVal} onChange={e => setInterestRateVal(e.target.value)} className="inline-contract-input" style={{ width: '70px' }} />
                    
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input type="radio" checked={interestPeriod === 'daily'} onChange={() => setInterestPeriod('daily')} className="accent-teal-600 no-print" />
                      {renderPrintRadio(interestPeriod === 'daily')}
                      <span>ប្រចាំថ្ងៃ</span>
                    </label>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input type="radio" checked={interestPeriod === 'weekly'} onChange={() => setInterestPeriod('weekly')} className="accent-teal-600 no-print" />
                      {renderPrintRadio(interestPeriod === 'weekly')}
                      <span>ប្រចាំសប្ដាហ៍</span>
                    </label>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input type="radio" checked={interestPeriod === 'monthly'} onChange={() => setInterestPeriod('monthly')} className="accent-teal-600 no-print" />
                      {renderPrintRadio(interestPeriod === 'monthly')}
                      <span>ប្រចាំខែ</span>
                    </label>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input type="radio" checked={interestPeriod === 'other'} onChange={() => setInterestPeriod('other')} className="accent-teal-600 no-print" />
                      {renderPrintRadio(interestPeriod === 'other')}
                      <span>ផ្សេងៗ</span>
                    </label>
                  </p>
                </div>

                {/* Clause 1.4 Duration */}
                <div className="pl-4">
                  <p>
                    <strong>១.៤ រយៈពេលខ្ចីប្រាក់៖</strong>
                    <input type="text" value={loanDuration} onChange={e => setLoanDuration(e.target.value)} className="inline-contract-input" style={{ width: '90px' }} />
                    គិតចាប់ពីថ្ងៃទទួលនេះតទៅ។
                  </p>
                </div>

                {/* Clause 1.5 Admin Fee */}
                <div className="pl-4">
                  <p>
                    <strong>១.៥ កម្រៃសេវារដ្ឋបាលដែលត្រូវបង់ពេលទទួលប្រាក់ដំបូង៖</strong>
                    <input type="text" value={adminFeeDigits} onChange={e => setAdminFeeDigits(e.target.value)} className="inline-contract-input" style={{ width: '130px' }} />
                  </p>
                </div>

                {/* Clause 1.6 Repayment Mode */}
                <div className="pl-4">
                  <p className="flex items-center gap-1.5 flex-wrap">
                    <strong>១.៦ របៀបសងប្រាក់អនុវត្តតាមតារាងកាលវិភាគសងប្រាក់ដោយបង់ផ្ទាល់នៅ៖</strong>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input type="radio" checked={repaymentMethod === 'office'} onChange={() => setRepaymentMethod('office')} className="accent-teal-600 no-print" />
                      {renderPrintRadio(repaymentMethod === 'office')}
                      <span>ការិយាល័យ</span>
                    </label>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input type="radio" checked={repaymentMethod === 'agent'} onChange={() => setRepaymentMethod('agent')} className="accent-teal-600 no-print" />
                      {renderPrintRadio(repaymentMethod === 'agent')}
                      <span>តាមរយៈភ្នាក់ងារឥណទាន</span>
                    </label>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input type="radio" checked={repaymentMethod === 'other'} onChange={() => setRepaymentMethod('other')} className="accent-teal-600 no-print" />
                      {renderPrintRadio(repaymentMethod === 'other')}
                      <span>ផ្សេងៗ</span>
                    </label>
                  </p>
                </div>

                {/* Clause 1.7 Insurance */}
                <div className="pl-4">
                  <p className="flex items-center gap-1.5 flex-wrap">
                    <strong>១.៧ កំរ៉ៃសេវាធានារ៉ាប់រងចំនួន ដើម្បី៖</strong>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input type="radio" checked={insuranceCoverage === 'yes'} onChange={() => setInsuranceCoverage('yes')} className="accent-teal-600 no-print" />
                      {renderPrintRadio(insuranceCoverage === 'yes')}
                      <span>ទទួលបាន</span>
                    </label>
                    <span>/</span>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input type="radio" checked={insuranceCoverage === 'no'} onChange={() => setInsuranceCoverage('no')} className="accent-teal-600 no-print" />
                      {renderPrintRadio(insuranceCoverage === 'no')}
                      <span>មិនទទួលបាន</span>
                    </label>
                    <span>នូវ អត្ថប្រយោជន៍ក្នុងការធានាប្រាក់កម្ចី {insuranceRate} នៅពេលដែលភាគី “ខ” ទទួលមរណៈភាព ឬពិការភាព(បាត់បង់លទ្ធភាពធ្វើការងារ)។</span>
                  </p>
                </div>

                {/* Clause 1.8 Env Policy */}
                <div className="pl-4">
                  <p>
                    <strong>១.៨</strong> ភាគី “ខ” សន្យាថានឹងមិនប្រើប្រាស់ឥណទានដែលទទួលបានពីភាគី “ក” ធ្វើឲ្យប៉ះពាល់ដល់បរិស្ថានសង្គម និងសកម្មភាព ទាំងឡាយណាណាដែលហាមឃាត់ដោយច្បាប់របស់ព្រះរាជាណាចក្រកម្ពុជាឡើយ ។
                  </p>
                </div>
              </div>

              <p className="italic text-[12.5px] text-slate-600">តារាងកាលវិភាគសងប្រាក់នឹងប័ណ្ណផ្តល់ប្រាក់កម្ចីជាឧបសម្ព័ន្ធនៃកិច្ចសន្យានេះ។</p>

              {/* Article 2 */}
              <div className="space-y-1.5 pt-2">
                <p className="font-bold underline text-[13.5px]">ប្រការ២៖ អំពីសេចក្តីណែនាំជាគោលការណ៍រួម</p>
                <p>
                  ក្នុងករណីដែលភាគី “ខ” មិនបានអនុវត្តតាមការសន្យាសងប្រាក់ដើម និងការប្រាក់ដូចមានចែងក្នុងបញ្ញត្តិ ១.១ ១.២ ១.៣ ១.៤ ១.៥ ១.៦ នៃប្រការ ១ ខាងលើទេភាគី “ខ” យល់ព្រមឲ្យភាគី “ក” អនុវត្តវិធានការរបស់ម្ចាស់បំណុលមានដូចតទៅ៖
                </p>
                
                <div className="pl-4 space-y-1.5">
                  <p>
                    <strong>២.១</strong> ប្រសិនបើភាគី “ខ” មិនបានបំពេញកាតព្វកិច្ចសងប្រាក់ទាន់ពេលវេលាកំណត់ក្នុងតារាងសងប្រាក់ទេភាគី “ខ” សុខចិត្តបង់ប្រាក់ពិន័យ ចំនួន ២,០០០ រៀល ក្នុងមួយថ្ងៃ បន្ថែមលើទឹកប្រាក់ត្រូវបង់ប្រចាំថ្ងៃដោយចំនួនថ្ងៃនៃការពិន័យត្រូវបានគិតតាមថ្ងៃធ្វើការរបស់ម្ចាស់បំណុល ។ នាកំឡុងពេលនៃការយឺតយ៉ាវនេះ ភាគី “ក” មានសិទ្ធិគ្រប់គ្រាន់ក្នុងការចុះសាកសួរព័ត៌មានអំពីមូលហេតុដែលបណ្តាលឲ្យមានការយឺតយ៉ាវដើម្បីរកដំណោះស្រាយនៅគ្រប់ទីកន្លែងដែលភាគី “ខ” មានវត្តមាន ។
                  </p>
                  <p>
                    <strong>២.២</strong> ភាគី “ក” និងភាគី “ខ” សន្យាគោរពយ៉ាងម៉ឺងម៉ាត់តាមរាល់ប្រការ និងបញ្ញត្តិនានានៃកិច្ចសន្យាខាងលើ។ ក្នុងករណីមានការអនុវត្តផ្ទុយ ឬដោយរំលោភលើលក្ខខណ្ឌណាមួយ នៃកិច្ចសន្យានេះភាគីដែលល្មើស ឬបំពានកិច្ចសន្យានឹងត្រូវទទួលខុសត្រូវចំពោះវិធានការច្បាប់ជាធរមាន។ រាល់សាហ៊ុយទាក់ទងក្នុងការដោះស្រាយទំនាស់ ឬវិវាទជាបន្ទុករបស់ភាគីដែលរំលោភបំពានលើកិច្ចសន្យានេះ។
                  </p>
                  <p>
                    <strong>២.៣</strong> ភាគីអ្នកធានា និងអ្នករួមធានាត្រូវជាប់កាតព្វកិច្ចដោយសាមគ្គីភាពជាមួយ និងកូនបំណុល ឬសហកូនបំណុល។ កិច្ចសន្យានេះត្រូវបានធ្វើឡើងដោយមានការព្រមព្រៀងពិតប្រាកដ និងដោយសេរីគ្មានការបង្ខិតបង្ខំពីភាគីណាមួយឡើយ ហើយមានប្រសិទ្ធិភាពអនុវត្តចាប់ពីថ្ងៃចុះហត្ថលេខា និងផ្តិតមេដៃនេះតទៅ។
                  </p>
                </div>
              </div>

              {/* Document Copies */}
              <p className="pt-2">
                កិច្ចសន្យានេះត្រូវធ្វើឡើងចំនួន ០២ ច្បាប់(០១ច្បាប់ដើម និង០១ច្បាប់ថតចម្លង) ដើម្បីតម្កល់ទុកនៅ៖ 
                ភាគី “ក” ០១ច្បាប់ដើម និង ភាគី “ខ” ០១ច្បាប់ថតចំលង។
              </p>
            </div>

            {/* Signature Grid */}
            <div className="mt-12 pt-6 border-t border-slate-200">
              <div className="flex justify-between items-center text-[12.5px] font-bold">
                <span>ស្នាមមេដៃស្ដាំ ភាគីខ្ចីចងការប្រាក់ ភាគី “ខ”</span>
                <span>
                  ថ្ងៃទី 
                  <input type="text" value={sigDay} onChange={e => setSigDay(e.target.value)} className="inline-contract-input" style={{ width: '35px' }} />
                  ខែ 
                  <input type="text" value={sigMonth} onChange={e => setSigMonth(e.target.value)} className="inline-contract-input" style={{ width: '50px' }} />
                  ឆ្នាំ 
                  <input type="text" value={sigYear} onChange={e => setSigYear(e.target.value)} className="inline-contract-input" style={{ width: '55px' }} />
                </span>
                <span>ហត្ថលេខាម្ចាស់បំណុល</span>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-20 text-center text-[11.5px] font-bold text-slate-500">
                <div>
                  <div className="border-t border-slate-300 pt-2.5">សាក្សី</div>
                </div>
                <div>
                  <div className="border-t border-slate-300 pt-2.5">កូនបំណុល ឬអ្នកខ្ចី</div>
                </div>
                <div>
                  <div className="border-t border-slate-300 pt-2.5">សហកូនបំណុល/អ្នករួមខ្ចី</div>
                </div>
                <div>
                  <div className="border-t border-slate-300 pt-2.5">អ្នកធានា/រួមធានា</div>
                </div>
              </div>
            </div>
          </div>


          {/* ─────────────────────────────────────────────────────────────────
              PAGE 3: CO-BORROWER & GUARANTOR DETAILS
              ───────────────────────────────────────────────────────────────── */}
          <div className="contract-print-page space-y-6 pt-12">
            <div className="text-center space-y-1 mb-4">
              <h1 className="font-khmer-moul text-[14.5px]">ព្រះរាជាណាចក្រកម្ពុជា</h1>
              <h2 className="font-khmer-moul text-[13px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</h2>
              <div className="w-16 h-[1px] bg-slate-900 mx-auto mt-2"></div>
              <h3 className="font-khmer-moul text-[14px] pt-3 underline">កិច្ចសន្យាអមព្រមព្រៀង និងធានា</h3>
            </div>

            {/* Section: Co-borrower info */}
            <div className="space-y-2.5">
              <h4 className="font-khmer-moul text-[12px] underline">ព័ត៌មានរបស់សហកូនបំណុល និងសហកូនបំណុល</h4>
              <p className="leading-[26px]">
                ខ្ញុំបាទ/នាងខ្ញុំឈ្មោះ 
                <input type="text" value={coborrower1Name} onChange={e => setCoborrower1Name(e.target.value)} className="inline-contract-input" style={{ width: '130px' }} />
                ភេទ 
                <input type="text" value={coborrower1Gender} onChange={e => setCoborrower1Gender(e.target.value)} className="inline-contract-input" style={{ width: '50px' }} />
                អាយុ 
                <input type="text" value={coborrower1Age} onChange={e => setCoborrower1Age(e.target.value)} className="inline-contract-input" style={{ width: '40px' }} />
                ឆ្នាំ កាន់អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរលេខ 
                <input type="text" value={coborrower1IdCard} onChange={e => setCoborrower1IdCard(e.target.value)} className="inline-contract-input" style={{ width: '130px' }} />
                ចុះថ្ងៃទី 
                <input type="text" value={coborrower1IssueDay} onChange={e => setCoborrower1IssueDay(e.target.value)} className="inline-contract-input" style={{ width: '35px' }} />
                នៃ 
                <input type="text" value={coborrower1IssueMonth} onChange={e => setCoborrower1IssueMonth(e.target.value)} className="inline-contract-input" style={{ width: '70px' }} />
                ឆ្នាំ 
                <input type="text" value={coborrower1IssueYear} onChange={e => setCoborrower1IssueYear(e.target.value)} className="inline-contract-input" style={{ width: '50px' }} />
                មានអាសយដ្ឋានបច្ចុប្បន្ននៅផ្ទះលេខ 
                <input type="text" value={coborrower1House} onChange={e => setCoborrower1House(e.target.value)} className="inline-contract-input" style={{ width: '50px' }} />
                ឃុំ/សង្កាត់ 
                <input type="text" value={coborrower1Commune} onChange={e => setCoborrower1Commune(e.target.value)} className="inline-contract-input" style={{ width: '90px' }} />
                ស្រុក/ខណ្ឌ 
                <input type="text" value={coborrower1District} onChange={e => setCoborrower1District(e.target.value)} className="inline-contract-input" style={{ width: '90px' }} />
                ខេត្ត/ក្រុង 
                <input type="text" value={coborrower1Province} onChange={e => setCoborrower1Province(e.target.value)} className="inline-contract-input" style={{ width: '110px' }} />
                ។ លេខទំនាក់ទំនង៖ 
                <input type="text" value={coborrower1Phone} onChange={e => setCoborrower1Phone(e.target.value)} className="inline-contract-input" style={{ width: '110px' }} />

                និងឈ្មោះ 
                <input type="text" value={coborrower2Name} onChange={e => setCoborrower2Name(e.target.value)} className="inline-contract-input" style={{ width: '130px' }} />
                ភេទ 
                <input type="text" value={coborrower2Gender} onChange={e => setCoborrower2Gender(e.target.value)} className="inline-contract-input" style={{ width: '50px' }} />
                អាយុ 
                <input type="text" value={coborrower2Age} onChange={e => setCoborrower2Age(e.target.value)} className="inline-contract-input" style={{ width: '40px' }} />
                ឆ្នាំ កាន់អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរលេខ 
                <input type="text" value={coborrower2IdCard} onChange={e => setCoborrower2IdCard(e.target.value)} className="inline-contract-input" style={{ width: '130px' }} />
                ចុះថ្ងៃទី 
                <input type="text" value={coborrower2IssueDay} onChange={e => setCoborrower2IssueDay(e.target.value)} className="inline-contract-input" style={{ width: '35px' }} />
                នៃ 
                <input type="text" value={coborrower2IssueMonth} onChange={e => setCoborrower2IssueMonth(e.target.value)} className="inline-contract-input" style={{ width: '70px' }} />
                ឆ្នាំ 
                <input type="text" value={coborrower2IssueYear} onChange={e => setCoborrower2IssueYear(e.target.value)} className="inline-contract-input" style={{ width: '50px' }} />
                មានអាសយដ្ឋានបច្ចុប្បន្ននៅផ្ទះលេខ 
                <input type="text" value={coborrower2House} onChange={e => setCoborrower2House(e.target.value)} className="inline-contract-input" style={{ width: '50px' }} />
                ឃុំ/សង្កាត់ 
                <input type="text" value={coborrower2Commune} onChange={e => setCoborrower2Commune(e.target.value)} className="inline-contract-input" style={{ width: '90px' }} />
                ស្រុក/ខណ្ឌ 
                <input type="text" value={coborrower2District} onChange={e => setCoborrower2District(e.target.value)} className="inline-contract-input" style={{ width: '90px' }} />
                ខេត្ត/ក្រុង 
                <input type="text" value={coborrower2Province} onChange={e => setCoborrower2Province(e.target.value)} className="inline-contract-input" style={{ width: '110px' }} />
                ។ លេខទំនាក់ទំនង៖ 
                <input type="text" value={coborrower2Phone} onChange={e => setCoborrower2Phone(e.target.value)} className="inline-contract-input" style={{ width: '110px' }} />
              </p>
            </div>

            {/* Section: Guarantor info */}
            <div className="space-y-2.5 pt-2">
              <h4 className="font-khmer-moul text-[12px] underline">ព័ត៌មានរបស់អ្នកធានា និងសហអ្នកធានា</h4>
              <p className="leading-[26px]">
                ខ្ញុំបាទ/នាងខ្ញុំឈ្មោះ 
                <input type="text" value={g1Name} onChange={e => setG1Name(e.target.value)} className="inline-contract-input" style={{ width: '130px' }} />
                ភេទ 
                <input type="text" value={g1Gender} onChange={e => setG1Gender(e.target.value)} className="inline-contract-input" style={{ width: '50px' }} />
                អាយុ 
                <input type="text" value={g1Age} onChange={e => setG1Age(e.target.value)} className="inline-contract-input" style={{ width: '40px' }} />
                ឆ្នាំ កាន់អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរលេខ 
                <input type="text" value={g1IdCard} onChange={e => setG1IdCard(e.target.value)} className="inline-contract-input" style={{ width: '130px' }} />
                ចុះថ្ងៃទី 
                <input type="text" value={g1IssueDay} onChange={e => setG1IssueDay(e.target.value)} className="inline-contract-input" style={{ width: '35px' }} />
                នៃ 
                <input type="text" value={g1IssueMonth} onChange={e => setG1IssueMonth(e.target.value)} className="inline-contract-input" style={{ width: '70px' }} />
                ឆ្នាំ 
                <input type="text" value={g1IssueYear} onChange={e => setG1IssueYear(e.target.value)} className="inline-contract-input" style={{ width: '50px' }} />
                មានអាសយដ្ឋានបច្ចុប្បន្ននៅផ្ទះលេខ 
                <input type="text" value={g1HouseNo} onChange={e => setG1HouseNo(e.target.value)} className="inline-contract-input" style={{ width: '50px' }} />
                ឃុំ/សង្កាត់ 
                <input type="text" value={g1Commune} onChange={e => setG1Commune(e.target.value)} className="inline-contract-input" style={{ width: '90px' }} />
                ស្រុក/ខណ្ឌ 
                <input type="text" value={g1District} onChange={e => setG1District(e.target.value)} className="inline-contract-input" style={{ width: '90px' }} />
                ខេត្ត/ក្រុង 
                <input type="text" value={g1Province} onChange={e => setG1Province(e.target.value)} className="inline-contract-input" style={{ width: '110px' }} />
                ។ លេខទំនាក់ទំនង៖ 
                <input type="text" value={guarantorsPhone} onChange={e => setGuarantorsPhone(e.target.value)} className="inline-contract-input" style={{ width: '110px' }} />

                និងឈ្មោះ 
                <input type="text" value={g2Name} onChange={e => setG2Name(e.target.value)} className="inline-contract-input" style={{ width: '130px' }} />
                ភេទ 
                <input type="text" value={g2Gender} onChange={e => setG2Gender(e.target.value)} className="inline-contract-input" style={{ width: '50px' }} />
                អាយុ 
                <input type="text" value={g2Age} onChange={e => setG2Age(e.target.value)} className="inline-contract-input" style={{ width: '40px' }} />
                ឆ្នាំ កាន់អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរលេខ 
                <input type="text" value={g2IdCard} onChange={e => setG2IdCard(e.target.value)} className="inline-contract-input" style={{ width: '130px' }} />
                ចុះថ្ងៃទី 
                <input type="text" value={g2IssueDay} onChange={e => setG2IssueDay(e.target.value)} className="inline-contract-input" style={{ width: '35px' }} />
                នៃ 
                <input type="text" value={g2IssueMonth} onChange={e => setG2IssueMonth(e.target.value)} className="inline-contract-input" style={{ width: '70px' }} />
                ឆ្នាំ 
                <input type="text" value={g2IssueYear} onChange={e => setG2IssueYear(e.target.value)} className="inline-contract-input" style={{ width: '50px' }} />
                មានអាសយដ្ឋានបច្ចុប្បន្ននៅផ្ទះលេខ 
                <input type="text" value={g2HouseNo} onChange={e => setG2HouseNo(e.target.value)} className="inline-contract-input" style={{ width: '50px' }} />
                ឃុំ/សង្កាត់ 
                <input type="text" value={g2Commune} onChange={e => setG2Commune(e.target.value)} className="inline-contract-input" style={{ width: '90px' }} />
                ស្រុក/ខណ្ឌ 
                <input type="text" value={g2District} onChange={e => setG2District(e.target.value)} className="inline-contract-input" style={{ width: '90px' }} />
                ខេត្ត/ក្រុង 
                <input type="text" value={g2Province} onChange={e => setG2Province(e.target.value)} className="inline-contract-input" style={{ width: '110px' }} />
                ។
              </p>
            </div>

            {/* Decision summary */}
            <div className="space-y-2 pt-2">
              <h4 className="font-bold underline text-[12px] uppercase">សេចក្តីសម្រេចរបស់លោកស្រី/លោក៖ {lenderName || '_______________'}</h4>
              <p className="leading-[26px]">
                <strong>១. កម្មវត្ថុ៖</strong> សំរ៉ាប់ឥណទានស្នើសុំចំនួន 
                <input type="text" value={loanAmountDigits} onChange={e => setLoanAmountDigits(e.target.value)} className="inline-contract-input" style={{ width: '120px' }} />
                រយៈពេល 
                <input type="text" value={loanDuration} onChange={e => setLoanDuration(e.target.value)} className="inline-contract-input" style={{ width: '90px' }} />
                ការប្រាក់ 
                <input type="text" value={interestRateVal} onChange={e => setInterestRateVal(e.target.value)} className="inline-contract-input" style={{ width: '70px' }} />
                កម្រៃសេវារដ្ឋបាល 
                <input type="text" value={adminFeeDigits} onChange={e => setAdminFeeDigits(e.target.value)} className="inline-contract-input" style={{ width: '100px' }} />
                
                <span className="inline-flex items-center gap-1.5 ml-2">
                  <span>របៀបបង់ប្រាក់៖</span>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input type="radio" checked={repaymentMethod === 'office'} onChange={() => setRepaymentMethod('office')} className="accent-teal-600 no-print" />
                    <span>ការិយាល័យ</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input type="radio" checked={repaymentMethod === 'agent'} onChange={() => setRepaymentMethod('agent')} className="accent-teal-600 no-print" />
                    <span>ភ្នាក់ងារ</span>
                  </label>
                </span>

                <span className="inline-flex items-center gap-1.5 ml-2">
                  <span>សេវាធានារ៉ាប់រង៖</span>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input type="radio" checked={insuranceCoverage === 'yes'} onChange={() => setInsuranceCoverage('yes')} className="accent-teal-600 no-print" />
                    <span>ទទួលបាន</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input type="radio" checked={insuranceCoverage === 'no'} onChange={() => setInsuranceCoverage('no')} className="accent-teal-600 no-print" />
                    <span>មិនទទួលបាន</span>
                  </label>
                </span>
              </p>
            </div>

            {/* Checklist table */}
            <div className="space-y-2 pt-2">
              <h4 className="font-bold underline text-[12.5px]">២. ឯកសារនិងព័ត៌មានភ្ជាប់៖</h4>
              <div className="overflow-x-auto border border-slate-300 rounded-xl">
                <table className="w-full text-[12px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-300 text-[11px] uppercase text-slate-600 font-bold">
                      <th className="px-4 py-2 border-r border-slate-300 text-center w-12">ល.រ</th>
                      <th className="px-4 py-2 border-r border-slate-300">បរិយាយឯកសារ</th>
                      <th className="px-4 py-2 border-r border-slate-300 text-center w-20">ចំនួន</th>
                      <th className="px-4 py-2 border-r border-slate-300 text-center w-28">ចំណាំ</th>
                      <th className="px-4 py-2">យោបល់</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="px-4 py-1.5 border-r border-slate-300 text-center">១</td>
                      <td className="px-4 py-1.5 border-r border-slate-300">
                        <input type="text" value={check1Desc} onChange={e => setCheck1Desc(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold" />
                      </td>
                      <td className="px-4 py-1.5 border-r border-slate-300">
                        <input type="text" value={check1Qty} onChange={e => setCheck1Qty(e.target.value)} className="w-full bg-transparent border-none outline-none text-center font-bold" />
                      </td>
                      <td className="px-4 py-1.5 border-r border-slate-300">
                        <input type="text" value={check1Remark} onChange={e => setCheck1Remark(e.target.value)} className="w-full bg-transparent border-none outline-none text-center font-bold" />
                      </td>
                      <td className="px-4 py-1.5">
                        <input type="text" value={check1Comment} onChange={e => setCheck1Comment(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold" />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="px-4 py-1.5 border-r border-slate-300 text-center">២</td>
                      <td className="px-4 py-1.5 border-r border-slate-300">
                        <input type="text" value={check2Desc} onChange={e => setCheck2Desc(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold" />
                      </td>
                      <td className="px-4 py-1.5 border-r border-slate-300">
                        <input type="text" value={check2Qty} onChange={e => setCheck2Qty(e.target.value)} className="w-full bg-transparent border-none outline-none text-center font-bold" />
                      </td>
                      <td className="px-4 py-1.5 border-r border-slate-300">
                        <input type="text" value={check2Remark} onChange={e => setCheck2Remark(e.target.value)} className="w-full bg-transparent border-none outline-none text-center font-bold" />
                      </td>
                      <td className="px-4 py-1.5">
                        <input type="text" value={check2Comment} onChange={e => setCheck2Comment(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold" />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="px-4 py-1.5 border-r border-slate-300 text-center">៣</td>
                      <td className="px-4 py-1.5 border-r border-slate-300">
                        <input type="text" value={check3Desc} onChange={e => setCheck3Desc(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold" />
                      </td>
                      <td className="px-4 py-1.5 border-r border-slate-300">
                        <input type="text" value={check3Qty} onChange={e => setCheck3Qty(e.target.value)} className="w-full bg-transparent border-none outline-none text-center font-bold" />
                      </td>
                      <td className="px-4 py-1.5 border-r border-slate-300">
                        <input type="text" value={check3Remark} onChange={e => setCheck3Remark(e.target.value)} className="w-full bg-transparent border-none outline-none text-center font-bold" />
                      </td>
                      <td className="px-4 py-1.5">
                        <input type="text" value={check3Comment} onChange={e => setCheck3Comment(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold" />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="px-4 py-1.5 border-r border-slate-300 text-center">៤</td>
                      <td className="px-4 py-1.5 border-r border-slate-300">
                        <input type="text" value={check4Desc} onChange={e => setCheck4Desc(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold" />
                      </td>
                      <td className="px-4 py-1.5 border-r border-slate-300">
                        <input type="text" value={check4Qty} onChange={e => setCheck4Qty(e.target.value)} className="w-full bg-transparent border-none outline-none text-center font-bold" />
                      </td>
                      <td className="px-4 py-1.5 border-r border-slate-300">
                        <input type="text" value={check4Remark} onChange={e => setCheck4Remark(e.target.value)} className="w-full bg-transparent border-none outline-none text-center font-bold" />
                      </td>
                      <td className="px-4 py-1.5">
                        <input type="text" value={check4Comment} onChange={e => setCheck4Comment(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold" />
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="px-4 py-1.5 border-r border-slate-300 text-center">៥</td>
                      <td className="px-4 py-1.5 border-r border-slate-300">
                        <input type="text" value={check5Desc} onChange={e => setCheck5Desc(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold" />
                      </td>
                      <td className="px-4 py-1.5 border-r border-slate-300">
                        <input type="text" value={check5Qty} onChange={e => setCheck5Qty(e.target.value)} className="w-full bg-transparent border-none outline-none text-center font-bold" />
                      </td>
                      <td className="px-4 py-1.5 border-r border-slate-300">
                        <input type="text" value={check5Remark} onChange={e => setCheck5Remark(e.target.value)} className="w-full bg-transparent border-none outline-none text-center font-bold" />
                      </td>
                      <td className="px-4 py-1.5">
                        <input type="text" value={check5Comment} onChange={e => setCheck5Comment(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>


          {/* ─────────────────────────────────────────────────────────────────
              PAGE 4: SKETCH MAP & AUTHENTICATIONS
              ───────────────────────────────────────────────────────────────── */}
          <div className="contract-print-page space-y-6 pt-12">
            
            {/* Sketch Location Heading */}
            <div className="space-y-4">
              <h4 className="font-khmer-moul text-[12.5px] uppercase">៣. ប្លង់បង្ហាញទីតាំង លំនៅដ្ឋាន/កន្លែងប្រកបមុខរបរ</h4>
              
              {/* Layout Map Drawing Box Frame */}
              <div className="w-full h-80 border-2 border-slate-300 border-dashed rounded-2xl flex items-center justify-center bg-slate-50/50 print:bg-white select-none">
                <span className="text-[12px] text-slate-400 no-print">
                  [ Draw Map / Sketch Location Here ]
                </span>
              </div>
            </div>

            {/* Summary Declaration Text */}
            <p className="text-[11.5px] leading-relaxed text-slate-700">
              យើងខ្ញុំសូមបញ្ជាក់ថា រាល់ព័ត៌មានដែលផ្តល់ជូនខាងលើនេះ ពិតជាត្រឹមត្រូវឥតមានក្លែងបន្លំឡើយ ប្រសិនបើសិនមានកូនបំណុលល្មើសកិច្ចសន្យាកើតមានឡើង យើងខ្ញុំសុខចិត្តទទួលខុសត្រូវចំពោះមុខច្បាប់នៃព្រះរាជាណាចក្រកម្ពុជាឡើយ។
            </p>

            {/* Date and fingerprint info */}
            <div className="flex justify-between items-center text-[12px] font-bold mt-4">
              <div className="space-y-1">
                <span>ស្នាមមេដៃស្ដាំ ភាគីខ្ចីចងការប្រាក់ ភាគី “ខ”</span>
              </div>
              <div className="space-y-1">
                <span>
                  ថ្ងៃទី 
                  <input type="text" value={sigDay} onChange={e => setSigDay(e.target.value)} className="inline-contract-input" style={{ width: '35px' }} />
                  ខែ 
                  <input type="text" value={sigMonth} onChange={e => setSigMonth(e.target.value)} className="inline-contract-input" style={{ width: '50px' }} />
                  ឆ្នាំ 
                  <input type="text" value={sigYear} onChange={e => setSigYear(e.target.value)} className="inline-contract-input" style={{ width: '55px' }} />
                </span>
              </div>
              <div className="space-y-1 text-right">
                <span>ហត្ថលេខាម្ចាស់បំណុល</span>
              </div>
            </div>

            {/* Witnesses and Guarantors Grid */}
            <div className="grid grid-cols-4 gap-4 mt-16 text-center text-[11px] font-bold text-slate-500">
              <div>
                <div className="border-t border-slate-300 pt-2">សាក្សី</div>
              </div>
              <div>
                <div className="border-t border-slate-300 pt-2">កូនបំណុល ឬអ្នកខ្ចី</div>
              </div>
              <div>
                <div className="border-t border-slate-300 pt-2">សហកូនបំណុល/អ្នករួមខ្ចី</div>
              </div>
              <div>
                <div className="border-t border-slate-300 pt-2">អ្នកធានា/រួមធានា</div>
              </div>
            </div>

            {/* Official Authentication Block at the bottom */}
            <div className="mt-12 pt-6 border-t-2 border-dashed border-slate-200">
              <div className="flex justify-between items-start text-[11.5px] font-semibold text-slate-600">
                <div className="space-y-1">
                  <div>បានឃើញ និងបញ្ជាក់ដោយ៖</div>
                  <input type="text" value={officialTitle} onChange={e => setOfficialTitle(e.target.value)} className="inline-contract-input text-left" style={{ width: '220px', textAlign: 'left' }} />
                </div>
                <div className="text-right">
                  <div>
                    ថ្ងៃទី 
                    <input type="text" value={officialDay} onChange={e => setOfficialDay(e.target.value)} className="inline-contract-input" style={{ width: '30px' }} placeholder="...." />
                    ខែ 
                    <input type="text" value={officialMonth} onChange={e => setOfficialMonth(e.target.value)} className="inline-contract-input" style={{ width: '45px' }} placeholder="...." />
                    ឆ្នាំ 
                    <input type="text" value={officialYear} onChange={e => setOfficialYear(e.target.value)} className="inline-contract-input" style={{ width: '45px' }} placeholder="...." />
                  </div>
                  <div className="mt-1 font-bold text-slate-900">ហត្ថលេខា និងឈ្មោះ</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  , document.body);
}
