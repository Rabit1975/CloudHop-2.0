
import React from 'react';

const Billing: React.FC = () => {
  const plans = [
    { 
      name: 'Free', 
      price: '$0', 
      desc: 'For individuals and small groups.', 
      features: ['Unlimited messaging', '1 Hop Space', '45-minute meetings', '1GB cloud storage', '720p video'],
      cta: 'Current Plan'
    },
    { 
      name: 'Plus', 
      price: '$5.99', 
      desc: 'For frequent users who want more freedom.', 
      features: ['Unlimited meeting length', '1080p HD video', '5 Hop Spaces', '300 AI actions/month', '25GB cloud storage'],
      cta: 'Upgrade to Plus'
    },
    { 
      name: 'Pro', 
      price: '$14.99', 
      desc: 'For professionals and community owners.', 
      features: ['Unlimited Hop Spaces', 'Full AI assistant suite', 'Meeting notes & AI extraction', '100GB cloud storage', '4K video support'],
      popular: true,
      cta: 'Upgrade to Pro'
    },
    { 
      name: 'Teams', 
      price: '$8.99', 
      desc: 'For small–medium businesses (min 3 users).', 
      features: ['Admin dashboard', 'Shared team spaces', 'Meeting transcripts', 'Unlimited storage/team', 'Compliance mode'],
      cta: 'Upgrade to Teams'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black mb-2 tracking-tight">Billing & Subscriptions</h2>
           <p className="text-white/40 font-medium">Manage your plan, payment methods, and usage.</p>
        </div>
        <div className="bg-[#10233A] border border-[#1E3A5F] px-6 py-4 rounded-2xl flex items-center gap-6">
           <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#53C8FF] mb-1">AI Credits</div>
              <div className="text-xl font-black">2,450 <span className="text-xs text-white/30">/ 5,000</span></div>
           </div>
           <button className="bg-[#53C8FF]/10 text-[#53C8FF] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#53C8FF]/20 transition-all">Buy More</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan, i) => (
          <div key={i} className={`p-1 rounded-[24px] transition-all flex flex-col ${plan.popular ? 'bg-gradient-to-b from-[#53C8FF] to-transparent shadow-2xl shadow-[#53C8FF]/10' : 'bg-white/5 border border-white/5'}`}>
             <div className="bg-[#0E1430] rounded-[22px] p-8 flex-1 flex flex-col h-full">
                {plan.popular && <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#53C8FF] mb-6">Most Popular</div>}
                <h3 className="text-xl font-black mb-1">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-white/30 text-xs font-bold mb-1">{plan.name === 'Teams' ? '/user/mo' : '/mo'}</span>
                </div>
                <p className="text-xs text-white/40 mb-8 font-medium leading-relaxed">{plan.desc}</p>
                <div className="space-y-4 mb-10 flex-1">
                   {plan.features.map((f, j) => (
                     <div key={j} className="flex items-start gap-3">
                        <svg className="w-4 h-4 text-[#53C8FF] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        <span className="text-xs font-bold text-white/70">{f}</span>
                     </div>
                   ))}
                </div>
                <button className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${plan.name === 'Free' ? 'bg-white/5 text-white/30 cursor-default' : plan.popular ? 'bg-[#53C8FF] text-[#0A0F1F] hover:shadow-[0_0_20px_rgba(83,200,255,0.4)]' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}>
                   {plan.cta}
                </button>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-[#0E1430] border border-white/5 rounded-[24px] p-8 space-y-6 shadow-xl">
            <h4 className="text-sm font-black uppercase tracking-widest text-[#53C8FF]">Payment Method</h4>
            <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center font-bold italic text-[10px]">VISA</div>
                  <div>
                    <div className="text-sm font-black">Visa ending in 4242</div>
                    <div className="text-[10px] text-white/30 font-bold">Expires 12/27</div>
                  </div>
               </div>
               <button className="text-xs font-black text-[#53C8FF] hover:underline uppercase tracking-widest">Edit</button>
            </div>
         </div>
         <div className="bg-[#0E1430] border border-white/5 rounded-[24px] p-8 space-y-6 shadow-xl">
            <h4 className="text-sm font-black uppercase tracking-widest text-[#53C8FF]">Billing History</h4>
            <div className="space-y-3">
               {[1, 2, 3].map(i => (
                 <div key={i} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0">
                    <div>
                       <div className="text-xs font-bold">Invoice #CH-998{i}</div>
                       <div className="text-[10px] text-white/30 font-bold">Nov {20-i}, 2025</div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-sm font-black">$5.99</span>
                       <button className="p-2 text-white/20 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></button>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Billing;
