export function TreatmentScience() {
  return <section className="report-dark bg-[#3a3026] px-5 py-12 text-[#f5eee0] sm:px-8" aria-labelledby="treatment-science-title">
    <div className="mx-auto max-w-5xl">
      <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#d4b579]">The science behind the approach</p>
      <h2 id="treatment-science-title" className="mt-3 font-serif text-3xl text-[#fff8eb]">How Endomax Lift works beneath the skin</h2>
      <div className="mt-7 grid gap-6 sm:grid-cols-3">
        {[
          ["01", "Targeted energy", "A fine optical fibre places 1470nm laser energy beneath the skin in the treatment area. The clinician controls its delivery."],
          ["02", "Thermal response", "Controlled heat can contract tissue and, where appropriate, address selected superficial fat. The treatment plan depends on the tissue involved."],
          ["03", "Gradual remodelling", "The healing response includes collagen remodelling over subsequent months. The aim is firmer-looking skin and improved contour; the degree of change varies."],
        ].map(([num, title, body]) => <div key={num} className="border-t border-[#c5a568]/40 pt-4"><p className="text-sm text-[#d4b579]">{num}</p><h3 className="mt-2 font-serif text-xl text-[#fff8eb]">{title}</h3><p className="mt-3 text-sm leading-relaxed text-[#ddd0be]">{body}</p></div>)}
      </div>
      <details className="mt-7 border-t border-white/15 pt-4 text-xs text-[#d8cbb8]">
        <summary className="cursor-pointer py-2">Research and treatment limits</summary>
        <p className="mt-2 max-w-3xl leading-relaxed">Clinical studies report improvements in selected patients, but much of the evidence comes from small studies. A selfie cannot show elasticity, deeper anatomy or how much change an individual will achieve. Recovery and risks, including swelling, burns and nerve injury, need discussion before treatment.</p>
        <div className="mt-3 flex flex-wrap gap-4 underline underline-offset-4">
          <a href="https://pubmed.ncbi.nlm.nih.gov/35083532/" target="_blank" rel="noopener noreferrer">Jowl study</a>
          <a href="https://pubmed.ncbi.nlm.nih.gov/38634118/" target="_blank" rel="noopener noreferrer">Neck-line study</a>
          <a href="https://pubmed.ncbi.nlm.nih.gov/39827299/" target="_blank" rel="noopener noreferrer">Evidence review</a>
        </div>
      </details>
    </div>
  </section>;
}
