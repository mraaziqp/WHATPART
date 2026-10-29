import type React from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle, Building2 } from 'lucide-react';
import { COMPANY, isVatRegistered } from '@/data/company';
import Link from 'next/link';

export type InfoPage = 'about' | 'contact' | 'terms' | 'privacy' | 'returns' | 'shipping';

interface InfoPageProps {
  page: InfoPage;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
    <div className="space-y-3 text-sm text-slate-700 leading-relaxed">{children}</div>
  </section>
);

const List: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className="list-disc pl-5 space-y-1.5">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);

const ContactLine: React.FC = () => (
  <>
    email <a href={`mailto:${COMPANY.email}`} className="text-navy-700 hover:underline">{COMPANY.email}</a>
    {COMPANY.phone && <> or call {COMPANY.phone}</>}
  </>
);

const BusinessDetails: React.FC = () => (
  <dl className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-x-6 gap-y-2 text-sm">
    <dt className="text-slate-500">Legal name</dt>
    <dd className="text-slate-800">{COMPANY.legalName}</dd>
    {COMPANY.registrationNumber && (
      <>
        <dt className="text-slate-500">Company registration no.</dt>
        <dd className="text-slate-800">{COMPANY.registrationNumber}</dd>
      </>
    )}
    {isVatRegistered() && (
      <>
        <dt className="text-slate-500">VAT no.</dt>
        <dd className="text-slate-800">{COMPANY.vatNumber}</dd>
      </>
    )}
    <dt className="text-slate-500">Physical address</dt>
    <dd className="text-slate-800">{COMPANY.physicalAddress}</dd>
    <dt className="text-slate-500">Email</dt>
    <dd className="text-slate-800">{COMPANY.email}</dd>
    {COMPANY.phone && (
      <>
        <dt className="text-slate-500">Telephone</dt>
        <dd className="text-slate-800">{COMPANY.phone}</dd>
      </>
    )}
    <dt className="text-slate-500">Website</dt>
    <dd className="text-slate-800">{COMPANY.website}</dd>
  </dl>
);

const PageLink: React.FC<{ to: InfoPage; children: React.ReactNode }> = ({ to, children }) => (
  <Link href={`/${to}`} className="font-medium text-navy-700 hover:underline">
    {children}
  </Link>
);

export const TITLES: Record<InfoPage, string> = {
  about: 'About WHATPART',
  contact: 'Contact Us',
  terms: 'Terms and Conditions',
  privacy: 'Privacy Policy',
  returns: 'Returns and Refunds Policy',
  shipping: 'Delivery Policy',
};

export const InfoPageView: React.FC<InfoPageProps> = ({ page }) => {
  const isPolicy = page !== 'about' && page !== 'contact';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black text-slate-900">{TITLES[page]}</h1>
        {isPolicy && <p className="text-xs text-slate-500">Last updated: {COMPANY.policiesUpdated}</p>}
      </header>

      {page === 'about' && (
        <>
          <Section title="Who we are">
            <p>
              {COMPANY.tradingName} is a South African online marketplace for vehicle parts. We connect car owners,
              mechanics and fleet operators with verified parts suppliers, OEM importers and salvage yards, so you can
              find the right part for your exact vehicle, pay securely online and have it delivered anywhere in South Africa.
            </p>
          </Section>
          <Section title="What we offer">
            <List
              items={[
                'New OEM, aftermarket and quality used parts for most makes and models sold in South Africa',
                'Search by vehicle, VIN or OEM part number to find parts that fit',
                'Request-a-quote for hard-to-find parts, answered by our supplier network',
                'Secure online payment through PayFast and Ozow',
                'Nationwide delivery by courier or to a Pargo pickup point',
              ]}
            />
          </Section>
          <Section title="Business details">
            <BusinessDetails />
          </Section>
        </>
      )}

      {page === 'contact' && (
        <>
          <p className="text-sm text-slate-700">
            Questions about a part, an order or a return? Our team is here to help.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href={`mailto:${COMPANY.email}`} className="flex gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-500 transition">
              <Mail className="w-5 h-5 text-navy-700 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-900">Email</p>
                <p className="text-sm text-slate-400">{COMPANY.email}</p>
              </div>
            </a>
            {COMPANY.phone && (
              <a href={`tel:${COMPANY.phone.replace(/\s/g, '')}`} className="flex gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-500 transition">
                <Phone className="w-5 h-5 text-navy-700 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Telephone</p>
                  <p className="text-sm text-slate-400">{COMPANY.phone}</p>
                </div>
              </a>
            )}
            {COMPANY.whatsapp && (
              <a href={`https://wa.me/${COMPANY.whatsapp.replace(/\D/g, '').replace(/^0/, '27')}`} className="flex gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-500 transition">
                <MessageCircle className="w-5 h-5 text-navy-700 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900">WhatsApp</p>
                  <p className="text-sm text-slate-400">{COMPANY.whatsapp}</p>
                </div>
              </a>
            )}
            <div className="flex gap-3 p-4 bg-white border border-slate-200 rounded-xl">
              <MapPin className="w-5 h-5 text-navy-700 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-900">Address</p>
                <p className="text-sm text-slate-400">{COMPANY.physicalAddress}</p>
              </div>
            </div>
            <div className="flex gap-3 p-4 bg-white border border-slate-200 rounded-xl">
              <Clock className="w-5 h-5 text-navy-700 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-900">Business hours</p>
                <p className="text-sm text-slate-400">{COMPANY.businessHours}</p>
              </div>
            </div>
            <div className="flex gap-3 p-4 bg-white border border-slate-200 rounded-xl">
              <Building2 className="w-5 h-5 text-navy-700 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-900">Company</p>
                <p className="text-sm text-slate-400">
                  {COMPANY.legalName}
                  {COMPANY.registrationNumber && <> · Reg. {COMPANY.registrationNumber}</>}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {page === 'terms' && (
        <>
          <Section title="1. About these terms">
            <p>
              These terms apply to every purchase made on {COMPANY.website} (the "Site"), operated by {COMPANY.legalName}
              ("{COMPANY.tradingName}", "we", "us"). By placing an order you agree to these terms, our{' '}
              <PageLink to="privacy">Privacy Policy</PageLink>,{' '}
              <PageLink to="returns">Returns and Refunds Policy</PageLink> and{' '}
              <PageLink to="shipping">Delivery Policy</PageLink>. Nothing in these terms limits
              your rights under the Consumer Protection Act 68 of 2008 (CPA) or the Electronic Communications and
              Transactions Act 25 of 2002 (ECTA).
            </p>
          </Section>
          <Section title="2. Supplier information (ECTA section 43)">
            <BusinessDetails />
          </Section>
          <Section title="3. Products and fitment">
            <p>
              We make every effort to describe parts accurately, including part numbers, condition (new, aftermarket or
              used) and compatible vehicles. Fitment information is based on the vehicle details you provide. Please
              check your vehicle details, or supply your VIN, before ordering. If we supplied the wrong part for the
              vehicle details you gave us, the Returns and Refunds Policy applies.
            </p>
            <p>Product images are for illustration and may differ slightly from the item supplied.</p>
          </Section>
          <Section title="4. Prices and payment">
            <List
              items={[
                'All prices are in South African Rand (ZAR).',
                isVatRegistered()
                  ? 'Prices include VAT at the current rate.'
                  : `${COMPANY.legalName} is not currently registered for VAT, so no VAT is charged.`,
                'Delivery fees are shown at checkout before you pay.',
                'Payment is processed securely by PayFast (card, instant EFT and other methods) or Ozow (instant EFT). We never see or store your full card details.',
                'An order is accepted only once payment has been confirmed by the payment provider and we have sent you an order confirmation.',
                'If a price or stock error occurs, we will contact you before dispatch and you may cancel for a full refund.',
              ]}
            />
          </Section>
          <Section title="5. Cooling-off period">
            <p>
              Under ECTA section 44 you may cancel an online purchase without reason within 7 days of receiving the goods.
              The goods must be returned unused and in their original packaging. You pay only the direct cost of returning
              the goods. Refunds are made within 30 days of cancellation. See the{' '}
              <PageLink to="returns">Returns and Refunds Policy</PageLink> for how to return items.
            </p>
          </Section>
          <Section title="6. Warranty">
            <p>
              New parts carry the CPA section 56 implied warranty of quality for 6 months from delivery, and may carry an
              additional manufacturer warranty stated on the product page. Used parts are sold as described on the product
              page, with any warranty period stated there. Warranty claims do not cover damage caused by incorrect
              installation, accidents, misuse or normal wear and tear. We recommend parts are fitted by a qualified mechanic.
            </p>
          </Section>
          <Section title="7. Marketplace sellers">
            <p>
              Some parts are listed by independent suppliers on our marketplace. {COMPANY.tradingName} processes payment,
              handles customer service and remains your point of contact for orders, returns and refunds.
            </p>
          </Section>
          <Section title="8. Liability">
            <p>
              To the extent allowed by law, we are not liable for indirect or consequential loss, including loss of use of a
              vehicle, arising from a purchase. This does not exclude liability for gross negligence or any liability that
              cannot be excluded under the CPA.
            </p>
          </Section>
          <Section title="9. Disputes and governing law">
            <p>
              These terms are governed by the laws of the Republic of South Africa. If you have a complaint, please{' '}
              <ContactLine /> and we will try to resolve it within 10 business days. You may also refer unresolved complaints
              to the Consumer Goods and Services Ombud (CGSO).
            </p>
          </Section>
        </>
      )}

      {page === 'privacy' && (
        <>
          <Section title="1. Introduction">
            <p>
              {COMPANY.legalName} respects your privacy and processes personal information in line with the Protection of
              Personal Information Act 4 of 2013 (POPIA). This policy explains what we collect, why, and your rights.
            </p>
          </Section>
          <Section title="2. Information we collect">
            <List
              items={[
                'Contact details: name, email address, phone number',
                'Delivery details: street address, city, province and postal code',
                'Vehicle details you provide: make, model, year, VIN or part numbers',
                'Order history and correspondence with us',
                'Technical information: IP address, browser type and pages visited, used to keep the Site secure and working',
              ]}
            />
            <p>
              We do not collect or store card numbers. Payments are processed directly by PayFast or Ozow under their own
              privacy policies and PCI DSS security standards.
            </p>
          </Section>
          <Section title="3. How we use it">
            <List
              items={[
                'To process, deliver and support your orders, returns and quotes',
                'To match parts to your vehicle',
                'To share delivery details with our courier partners (The Courier Guy, RAM, Pargo) and order details with the supplier fulfilling your part',
                'To prevent fraud and meet legal and tax obligations',
                'To send marketing only where you have opted in. You can unsubscribe at any time',
              ]}
            />
            <p>We do not sell your personal information.</p>
          </Section>
          <Section title="4. Storage and security">
            <p>
              Your information is stored on secured servers, transmitted over encrypted (HTTPS) connections and accessible
              only to staff and service providers who need it. We keep order records for as long as required by tax and
              consumer law (generally 5 years), then delete or anonymise them.
            </p>
          </Section>
          <Section title="5. Cookies">
            <p>
              We use essential browser storage to keep your cart and selected vehicle between visits. We do not use
              third-party advertising cookies.
            </p>
          </Section>
          <Section title="6. Your rights">
            <p>
              You may ask to access, correct or delete your personal information, or object to its processing. To do so,{' '}
              <ContactLine />
              {COMPANY.informationOfficer && <> (Information Officer: {COMPANY.informationOfficer})</>}. You may also lodge a
              complaint with the Information Regulator (South Africa) at inforeg.org.za.
            </p>
          </Section>
        </>
      )}

      {page === 'returns' && (
        <>
          <Section title="Summary">
            <List
              items={[
                'Change your mind: return unused items in original packaging within 7 days of delivery',
                'Wrong part supplied for the vehicle details you gave us: free return and full refund or exchange',
                'Defective new parts: repair, replacement or refund within 6 months (CPA section 56)',
                'Refunds are paid within 30 days, usually much sooner',
              ]}
            />
          </Section>
          <Section title="1. Change of mind (cooling-off)">
            <p>
              You may return any item within 7 days of delivery for a full refund of the item price. The part must be
              unused, not fitted, and in its original undamaged packaging with all labels. You pay the cost of returning it.
            </p>
          </Section>
          <Section title="2. Incorrect part">
            <p>
              If we supply a part that does not match the vehicle details or part number you provided, we will collect it
              at our cost and refund you in full or send the correct part. Please do not attempt to fit a part that does not
              match.
            </p>
          </Section>
          <Section title="3. Defective parts">
            <p>
              If a new part is defective, report it within 6 months of delivery. After inspection we will repair or replace
              it or refund you, as you choose, in line with CPA section 56. Used parts are covered for the warranty period
              stated on the product page. Damage from incorrect installation, accidents, misuse or normal wear is not covered.
            </p>
          </Section>
          <Section title="4. Items we cannot accept back">
            <p>
              For hygiene and safety reasons, electrical parts that have been installed and fluids or chemicals that have
              been opened can only be returned if they are defective. Special-order or custom-sourced parts will be clearly
              marked before you pay.
            </p>
          </Section>
          <Section title="5. How to return an item">
            <List
              items={[
                <>Contact us: <ContactLine />, with your order number and the reason for the return.</>,
                'We will send you a return authorisation and collection or drop-off instructions within 2 business days.',
                'Pack the part securely in its original packaging.',
                'Once we receive and inspect the part, we will confirm your refund or exchange.',
              ]}
            />
          </Section>
          <Section title="6. Refunds">
            <p>
              Refunds are paid to the original payment method (card refunds through PayFast, EFT refunds to the bank account
              you paid from) within 30 days of our receiving the returned part, usually within 7 business days. Original
              delivery fees are refunded when the return is due to our error or a defect.
            </p>
          </Section>
        </>
      )}

      {page === 'shipping' && (
        <>
          <Section title="Where we deliver">
            <p>We deliver to street addresses and Pargo pickup points across all nine provinces of South Africa.</p>
          </Section>
          <Section title="Delivery options and fees">
            <div className="overflow-x-auto">
              <table className="w-full bg-white text-sm border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <tr>
                    <th className="text-left p-3">Option</th>
                    <th className="text-left p-3">Estimated time</th>
                    <th className="text-right p-3">Under R1,500</th>
                    <th className="text-right p-3">R1,500 and over</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3">The Courier Guy (door to door)</td>
                    <td className="p-3">1 to 3 business days</td>
                    <td className="p-3 text-right font-mono">R150</td>
                    <td className="p-3 text-right font-mono text-emerald-700">Free</td>
                  </tr>
                  <tr>
                    <td className="p-3">RAM Overnight</td>
                    <td className="p-3">Next business day (main centres)</td>
                    <td className="p-3 text-right font-mono">R195</td>
                    <td className="p-3 text-right font-mono">R45</td>
                  </tr>
                  <tr>
                    <td className="p-3">Pargo pickup point</td>
                    <td className="p-3">2 to 4 business days</td>
                    <td className="p-3 text-right font-mono">R85</td>
                    <td className="p-3 text-right font-mono text-emerald-700">Free</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500">
              Oversized items such as body panels, engines and gearboxes may carry a freight surcharge, which is shown before you pay.
            </p>
          </Section>
          <Section title="Processing and dispatch">
            <p>
              In-stock parts are dispatched within 1 to 2 business days of payment confirmation. Parts sourced from a
              marketplace supplier may take up to 3 additional business days, shown on the product page. Delivery times are
              estimates and exclude weekends and public holidays; outlying areas may take longer.
            </p>
          </Section>
          <Section title="Tracking">
            <p>You will receive a tracking number by email and SMS as soon as your order is dispatched.</p>
          </Section>
          <Section title="Receiving your order">
            <p>
              Please check the parcel on delivery. If the packaging is visibly damaged, note it with the courier and contact
              us within 48 hours. Risk passes to you on delivery to the address or pickup point you selected.
            </p>
          </Section>
          <Section title="Questions">
            <p>
              For delivery questions, <ContactLine />.
            </p>
          </Section>
        </>
      )}
    </div>
  );
};
