import React, { useState } from 'react';
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

  // Guarantor 1
  const [g1Name, setG1Name] = useState('');
  const [g1Gender, setG1Gender] = useState('');
  const [g1BirthDay, setG1BirthDay] = useState('');
  const [g1BirthMonth, setG1BirthMonth] = useState('');
  const [g1BirthYear, setG1BirthYear] = useState('');
  const [g1IdCard, setG1IdCard] = useState('');
  const [g1IssueDay, setG1IssueDay] = useState('');
  const [g1IssueMonth, setG1IssueMonth] = useState('');
  const [g1IssueYear, setG1IssueYear] = useState('');
  const [g1HouseNo, setG1HouseNo] = useState('');
  const [g1Commune, setG1Commune] = useState('');
  const [g1District, setG1District] = useState('');
  const [g1Province, setG1Province] = useState('');

  // Guarantor 2
  const [g2Name, setG2Name] = useState('');
  const [g2Gender, setG2Gender] = useState('');
  const [g2BirthDay, setG2BirthDay] = useState('');
  const [g2BirthMonth, setG2BirthMonth] = useState('');
  const [g2BirthYear, setG2BirthYear] = useState('');
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

  // Contract Signature Date
  const [sigDay, setSigDay] = useState(String(today.getDate()));
  const [sigMonth, setSigMonth] = useState(today.toLocaleString('en-US', { month: 'short' }));
  const [sigYear, setSigYear] = useState(String(today.getFullYear()));

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col z-50 overflow-y-auto khmer-contract-editor-modal">
      
      {/* Dynamic Scoped Print CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Hanuman:wght@400;700;900&family=Moul&display=swap');
        
        .font-khmer {
          font-family: 'Hanuman', 'Khmer OS Battambang', serif;
        }
        .font-khmer-moul {
          font-family: 'Moul', 'Khmer OS Muol Light', sans-serif;
        }

        .inline-contract-input {
          border: none;
          border-bottom: 1px dashed #94a3b8;
          background: transparent;
          text-align: center;
          font-weight: bold;
          color: #1e293b;
          padding: 0 4px;
          outline: none;
          transition: all 0.2s;
        }
        .inline-contract-input:focus {
          border-bottom-color: #0d9488;
          background-color: rgba(13, 148, 136, 0.05);
        }

        @media print {
          .khmer-contract-editor-modal {
            background: transparent !important;
            padding: 0 !important;
            position: relative !important;
            overflow: visible !important;
            height: auto !important;
            min-height: auto !important;
            display: block !important;
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
        }
      `}} />

      {/* Editor Modal Header */}
      <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center z-50 no-print">
        <div>
          <h3 className="text-white text-[16px] font-bold font-sans">
            ✍️ Edit and Customize Khmer Loan Agreement
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
        <div className="printable-contract-container w-full max-w-[800px] bg-white rounded-2xl shadow-xl border border-slate-200 p-12 text-[13.5px] leading-[28px] text-slate-800 font-khmer no-print-backdrop">
          
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
              កើតថ្ងៃទី 
              <input type="text" value={g1BirthDay} onChange={e => setG1BirthDay(e.target.value)} className="inline-contract-input" style={{ width: '30px' }} />
              ខែ 
              <input type="text" value={g1BirthMonth} onChange={e => setG1BirthMonth(e.target.value)} className="inline-contract-input" style={{ width: '30px' }} />
              ឆ្នាំ 
              <input type="text" value={g1BirthYear} onChange={e => setG1BirthYear(e.target.value)} className="inline-contract-input" style={{ width: '40px' }} />
              កាន់អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរលេខ 
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
              កើតថ្ងៃទី 
              <input type="text" value={g2BirthDay} onChange={e => setG2BirthDay(e.target.value)} className="inline-contract-input" style={{ width: '30px' }} />
              ខែ 
              <input type="text" value={g2BirthMonth} onChange={e => setG2BirthMonth(e.target.value)} className="inline-contract-input" style={{ width: '30px' }} />
              ឆ្នាំ 
              <input type="text" value={g2BirthYear} onChange={e => setG2BirthYear(e.target.value)} className="inline-contract-input" style={{ width: '40px' }} />
              កាន់អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរលេខ 
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
              <p className="font-bold underline text-[14px]">ប្រការ១៖ អំពីលក្ខខណ្ឌ នៃការផ្តល់នូវប្រាក់កម្ចី</p>
              <p>
                ផ្អែកលើមូលដ្ឋាន នៃពាក្យស្នើសុំខ្ចីចងការ សេចក្តីណែនាំពីគោលការណ៍ និងលក្ខខណ្ឌនៃការខ្ចីចងការភាគី “ក” យល់ព្រមឲ្យភាគី “ខ” ខ្ចី ចងការហើយភាគី “ខ” ក៏យល់ព្រមទទួល និងសន្យាសងមកភាគី “ក” វិញជាដាច់ខាតនូវប្រាក់ខ្ចីចងការនេះតាមចំនួន និងរាល់លក្ខខណ្ឌដូចបានព្រមព្រៀងគ្នាដូចតទៅ៖
              </p>
              
              {/* Clause 1.1 Collaterals */}
              <div className="pl-4">
                <p><strong>១.១ ក្រោមការដាក់បញ្ចាំដើម្បីធានាបំណុលទាំងដើម និងការប្រាក់</strong></p>
                <div className="pl-4 space-y-1.5">
                  <p>
                    ប្រភេទអចលន ឬចលនវត្ថុ៖ 
                    <input type="text" value={collateral1Type} onChange={e => setCollateral1Type(e.target.value)} className="inline-contract-input" style={{ width: '130px' }} />
                    លេខ 
                    <input type="text" value={collateral1No} onChange={e => setCollateral1No(e.target.value)} className="inline-contract-input" style={{ width: '120px' }} />
                    កម្មសិទ្ធិរបស់ឈ្មោះ 
                    <input type="text" value={collateral1Owner} onChange={e => setCollateral1Owner(e.target.value)} className="inline-contract-input" style={{ width: '130px' }} />
                    យល់ព្រមដាក់បញ្ចាំដោយស្ម័គ្រចិត្ត។
                  </p>
                  <p>
                    ប្រភេទអចលន ឬចលនវត្ថុ៖ 
                    <input type="text" value={collateral2Type} onChange={e => setCollateral2Type(e.target.value)} className="inline-contract-input" style={{ width: '130px' }} />
                    លេខ 
                    <input type="text" value={collateral2No} onChange={e => setCollateral2No(e.target.value)} className="inline-contract-input" style={{ width: '120px' }} />
                    កម្មសិទ្ធិរបស់ឈ្មោះ 
                    <input type="text" value={collateral2Owner} onChange={e => setCollateral2Owner(e.target.value)} className="inline-contract-input" style={{ width: '130px' }} />
                    យល់ព្រមដាក់បញ្ចាំដោយស្ម័គ្រចិត្ត។
                  </p>
                </div>
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
                    <span>ប្រចាំថ្ងៃ</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input type="radio" checked={interestPeriod === 'weekly'} onChange={() => setInterestPeriod('weekly')} className="accent-teal-600 no-print" />
                    <span>ប្រចាំសប្ដាហ៍</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input type="radio" checked={interestPeriod === 'monthly'} onChange={() => setInterestPeriod('monthly')} className="accent-teal-600 no-print" />
                    <span>ប្រចាំខែ</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input type="radio" checked={interestPeriod === 'other'} onChange={() => setInterestPeriod('other')} className="accent-teal-600 no-print" />
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
                    <span>ការិយាល័យ</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input type="radio" checked={repaymentMethod === 'agent'} onChange={() => setRepaymentMethod('agent')} className="accent-teal-600 no-print" />
                    <span>តាមរយៈភ្នាក់ងារឥណទាន</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input type="radio" checked={repaymentMethod === 'other'} onChange={() => setRepaymentMethod('other')} className="accent-teal-600 no-print" />
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
                    <span>ទទួលបាន</span>
                  </label>
                  <span>/</span>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input type="radio" checked={insuranceCoverage === 'no'} onChange={() => setInsuranceCoverage('no')} className="accent-teal-600 no-print" />
                    <span>មិនទទួលបាន</span>
                  </label>
                  <span>នូវ អត្ថប្រយោជន៍ក្នុងការធានាប្រាក់កម្ចី ១០០% នៅពេលដែលភាគី “ខ” ទទួលមរណៈភាព ឬពិការភាព(បាត់បង់លទ្ធភាពធ្វើការងារ)។</span>
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
              <p className="font-bold underline text-[14px]">ប្រការ២៖ អំពីសេចក្តីណែនាំជាគោលការណ៍រួម</p>
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
      </div>
    </div>
  );
}
