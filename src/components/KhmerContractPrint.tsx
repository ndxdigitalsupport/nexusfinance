import React from 'react';
import { LoanApplication } from '../types';

interface KhmerContractPrintProps {
  application: LoanApplication | null;
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

export default function KhmerContractPrint({ application }: KhmerContractPrintProps) {
  if (!application) return null;

  // Estimation values
  const interestRate = 12; // Standard rate
  const monthlyRepaymentEst = Math.round(application.amount / application.durationMonths * 1.05);

  const amountInWords = numberToKhmerWords(application.amount);
  const durationInWords = numberToKhmerWords(application.durationMonths);
  const interestInWords = numberToKhmerWords(interestRate);

  // Formatted date values
  const today = new Date();
  const khmerYear = toKhmerDigits(today.getFullYear());
  const khmerMonth = toKhmerDigits(today.getMonth() + 1);
  const khmerDay = toKhmerDigits(today.getDate());

  return (
    <div className="hidden print:block printable-contract-container font-khmer p-12 text-[14px] leading-relaxed text-black bg-white min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanuman:wght@400;700;900&family=Moul&display=swap');
        
        .font-khmer {
          font-family: 'Hanuman', 'Khmer OS Battambang', serif;
        }
        .font-khmer-moul {
          font-family: 'Moul', 'Khmer OS Muol Light', sans-serif;
        }
        
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .printable-contract-container {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* State Header Section */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="font-khmer-moul text-[16px] tracking-wider uppercase">ព្រះរាជាណាចក្រកម្ពុជា</h1>
        <h2 className="font-khmer-moul text-[14px] tracking-wide">ជាតិ សាសនា ព្រះមហាក្សត្រ</h2>
        <div className="w-24 h-[1px] bg-black mx-auto mt-2"></div>
      </div>

      {/* Title */}
      <div className="text-center my-6">
        <h3 className="font-khmer-moul text-[18px] underline">កិច្ចសន្យាខ្ចីប្រាក់</h3>
        <p className="text-[12px] text-slate-700 mt-1">លេខកិច្ចសន្យា៖ {toKhmerDigits(application.id.replace('#', ''))}</p>
      </div>

      {/* Date */}
      <div className="text-right mb-6">
        <p>ធ្វើនៅ រាជធានីភ្នំពេញ, ថ្ងៃទី {khmerDay} ខែ {khmerMonth} ឆ្នាំ {khmerYear}</p>
      </div>

      {/* Parties */}
      <div className="space-y-4 mb-6">
        <p className="font-bold underline text-[15px]">ភាគីកិច្ចសន្យា៖</p>
        
        {/* Lender */}
        <div className="pl-4">
          <p><strong>ភាគី ក (អ្នកអោយខ្ចី)៖</strong> គ្រឹះស្ថានហិរញ្ញវត្ថុ <strong>ណិកសឺស ហ្វាយណាន់ (NexusFinance)</strong></p>
          <p className="text-slate-700">អាសយដ្ឋាន៖ វិថីព្រះនរោត្តម, សង្កាត់វត្តភ្នំ, ខណ្ឌដូនពេញ, រាជធានីភ្នំពេញ។</p>
        </div>

        {/* Borrower */}
        <div className="pl-4">
          <p><strong>ភាគី ខ (អ្នកខ្ចី)៖</strong> លោក/លោកស្រី <strong>{application.applicantName}</strong></p>
          <p className="text-slate-700">អ៊ីមែល៖ {application.applicantEmail} | លេខទូរស័ព្ទ៖ {toKhmerDigits(application.applicantEmail?.includes('@nexus.local') ? application.applicantEmail.split('@')[0] : '០៩២XXXXXX')}</p>
        </div>
      </div>

      {/* Clauses */}
      <div className="space-y-6">
        <p>ភាគីទាំងពីរបានព្រមព្រៀងគ្នាខ្ចី និងប្រគល់ប្រាក់ក្រោមលក្ខខណ្ឌច្បាប់ដូចខាងក្រោម៖</p>

        {/* Clause 1 */}
        <div className="space-y-2">
          <p className="font-bold">ប្រការ ១. ទំហំទឹកប្រាក់ខ្ចី និងគោលបំណង</p>
          <p className="pl-4 leading-relaxed">
            ភាគី ក យល់ព្រមផ្តល់ប្រាក់កម្ចីទៅអោយ ភាគី ខ ក្នុងទំហំទឹកប្រាក់ចំនួន <strong>${toKhmerDigits(application.amount.toLocaleString())} ដុល្លារអាមេរិក</strong> 
            (ជាអក្សរ៖ <strong>{amountInWords} ដុល្លារអាមេរិកគត់</strong>) ដើម្បីប្រើប្រាស់ក្នុងគោលបំណង <strong>"{application.purpose}"</strong>។
          </p>
        </div>

        {/* Clause 2 */}
        <div className="space-y-2">
          <p className="font-bold">ប្រការ ២. រយៈពេលកម្ចី និងអត្រាការប្រាក់</p>
          <p className="pl-4 leading-relaxed">
            រយៈពេលនៃកិច្ចសន្យាកម្ចីនេះមានចំនួន <strong>{toKhmerDigits(application.durationMonths)} ខែ</strong> (ជាអក្សរ៖ <strong>{durationInWords}ខែ</strong>) 
            គិតចាប់ពីថ្ងៃចុះហត្ថលេខានេះតទៅ។ អត្រាការប្រាក់ប្រចាំឆ្នាំត្រូវបានកំណត់ស្មើនឹង <strong>{toKhmerDigits(interestRate)}%</strong> (ជាអក្សរ៖ <strong>{interestInWords}ភាគរយ</strong>) ក្នុងមួយឆ្នាំ។
          </p>
        </div>

        {/* Clause 3 */}
        <div className="space-y-2">
          <p className="font-bold">ប្រការ ៣. ការបង់សង និងកាតព្វកិច្ច</p>
          <p className="pl-4 leading-relaxed">
            ភាគី ខ ត្រូវមានកាតព្វកិច្ចបង់សងទាំងប្រាក់ដើម និងការប្រាក់ប្រចាំខែទៅកាន់ ភាគី ក ក្នុងទំហំប្រាក់ប្រហាក់ប្រហែលចំនួន <strong>${toKhmerDigits(monthlyRepaymentEst.toLocaleString())} ដុល្លារអាមេរិក</strong> ក្នុងមួយខែ។ ការយឺតយ៉ាវក្នុងការបង់សងនឹងត្រូវរងការផាកពិន័យទៅតាមលក្ខខណ្ឌផ្ទៃក្នុងរបស់គ្រឹះស្ថាន។
          </p>
        </div>

        {/* Clause 4 */}
        <div className="space-y-2">
          <p className="font-bold">ប្រការ ៤. ការដោះស្រាយវិវាទ</p>
          <p className="pl-4 leading-relaxed">
            រាល់វិវាទទាំងឡាយដែលកើតឡើងពីការអនុវត្តកិច្ចសន្យានេះ ភាគីទាំងពីរនឹងធ្វើការដោះស្រាយដោយសន្តិវិធី និងការសម្របសម្រួល។ ក្នុងករណីមិនអាចដោះស្រាយបាន វិវាទនោះនឹងត្រូវបញ្ជូនទៅតុលាការមានសមត្ថកិច្ចនៃព្រះរាជាណាចក្រកម្ពុជា។
          </p>
        </div>
      </div>

      <div className="my-8 text-[13px] text-slate-800 italic">
        <p>សន្យានេះត្រូវបានធ្វើឡើងជាពីរច្បាប់ ភាគីនីមួយៗរក្សាទុកមួយច្បាប់ និងមានតម្លៃគតិយុត្តិស្មើគ្នា ចាប់ពីថ្ងៃចុះហត្ថលេខានេះតទៅ។</p>
      </div>

      {/* Signature Grid */}
      <div className="mt-16 grid grid-cols-3 gap-6 text-center text-[13px]">
        <div>
          <p className="font-bold">ភាគី ក (អ្នកអោយខ្ចី)</p>
          <p className="text-slate-500 mt-12">(ហត្ថលេខា និងត្រា)</p>
        </div>
        <div>
          <p className="font-bold">ភាគី ខ (អ្នកខ្ចី)</p>
          <p className="text-slate-500 mt-12">(ស្នាមមេដៃ ឬហត្ថលេខា)</p>
        </div>
        <div>
          <p className="font-bold">សាក្សី/អ្នកធានា</p>
          <p className="text-slate-500 mt-12">(ស្នាមមេដៃ ឬហត្ថលេខា)</p>
        </div>
      </div>
    </div>
  );
}
