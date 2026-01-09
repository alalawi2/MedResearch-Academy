import { useEffect } from "react";
import { useState } from "react";
import { Calculator, AlertCircle, CheckCircle2, Info } from "lucide-react";

/**
 * qSOFA Calculator Landing Page
 * SEO-optimized page targeting keywords: qSOFA calculator, sepsis scoring, quick SOFA, sepsis assessment
 */

interface QSofaScore {
  score: number;
  risk: "Low" | "High";
  recommendation: string;
}

export default function QSofaCalculator() {
  const [alteredMentation, setAlteredMentation] = useState(false);
  const [respiratoryRate, setRespiratoryRate] = useState(false);
  const [systolicBP, setSystolicBP] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const calculateQSOFA = (): QSofaScore => {
    const score = [alteredMentation, respiratoryRate, systolicBP].filter(Boolean).length;
    
    if (score >= 2) {
      return {
        score,
        risk: "High",
        recommendation: "High risk for poor outcomes. Consider ICU admission, obtain cultures, initiate broad-spectrum antibiotics, and closely monitor for organ dysfunction. Immediate clinical assessment required."
      };
    } else {
      return {
        score,
        risk: "Low",
        recommendation: "Lower risk for poor outcomes, but clinical judgment is essential. Continue monitoring and reassess frequently. Consider full SOFA score if clinical suspicion remains high."
      };
    }
  };

  const handleCalculate = () => {
    setShowResult(true);
  };

  const handleReset = () => {
    setAlteredMentation(false);
    setRespiratoryRate(false);
    setSystolicBP(false);
    setShowResult(false);
  };

  const result = showResult ? calculateQSOFA() : null;

  useEffect(() => {
    document.title = "qSOFA Calculator - Quick Sepsis Assessment Tool | MedResearch Academy";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Free qSOFA (quick SOFA) calculator for rapid sepsis risk assessment. Calculate sepsis scores instantly at bedside. Evidence-based clinical decision support tool for Omani healthcare professionals.');
    }
  }, []);

  return (
    <>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#1a237e] to-[#0d9488] text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
                <Calculator className="w-10 h-10" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                qSOFA Calculator
              </h1>
              <p className="text-xl md:text-2xl mb-6 text-teal-100">
                Quick Sequential Organ Failure Assessment
              </p>
              <p className="text-lg text-white/90 max-w-3xl mx-auto">
                Rapid bedside sepsis risk assessment tool for identifying patients at high risk for poor outcomes. 
                Evidence-based clinical decision support used by healthcare professionals worldwide.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Calculator Section */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-[#1a237e] mb-6 flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-[#0d9488]" />
                  Calculate qSOFA Score
                </h2>

                <div className="space-y-6">
                  {/* Criterion 1 */}
                  <div className="border-b pb-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alteredMentation}
                        onChange={(e) => setAlteredMentation(e.target.checked)}
                        className="mt-1 w-5 h-5 text-[#0d9488] rounded focus:ring-[#0d9488]"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Altered Mental Status</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Glasgow Coma Scale (GCS) &lt; 15 or any acute change in mental status
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Criterion 2 */}
                  <div className="border-b pb-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={respiratoryRate}
                        onChange={(e) => setRespiratoryRate(e.target.checked)}
                        className="mt-1 w-5 h-5 text-[#0d9488] rounded focus:ring-[#0d9488]"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Tachypnea</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Respiratory rate ≥ 22 breaths per minute
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Criterion 3 */}
                  <div className="border-b pb-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={systolicBP}
                        onChange={(e) => setSystolicBP(e.target.checked)}
                        className="mt-1 w-5 h-5 text-[#0d9488] rounded focus:ring-[#0d9488]"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Hypotension</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Systolic blood pressure ≤ 100 mmHg
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleCalculate}
                      className="flex-1 bg-[#0d9488] hover:bg-[#0d9488]/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Calculate Score
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-semibold transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Result Display */}
                {showResult && result && (
                  <div className={`mt-8 p-6 rounded-lg ${result.risk === "High" ? "bg-red-50 border-2 border-red-200" : "bg-green-50 border-2 border-green-200"}`}>
                    <div className="flex items-center gap-3 mb-4">
                      {result.risk === "High" ? (
                        <AlertCircle className="w-8 h-8 text-red-600" />
                      ) : (
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-600">qSOFA Score</div>
                        <div className={`text-3xl font-bold ${result.risk === "High" ? "text-red-600" : "text-green-600"}`}>
                          {result.score} / 3
                        </div>
                      </div>
                    </div>
                    <div className={`text-lg font-semibold mb-2 ${result.risk === "High" ? "text-red-800" : "text-green-800"}`}>
                      {result.risk} Risk for Poor Outcomes
                    </div>
                    <div className={`text-sm ${result.risk === "High" ? "text-red-700" : "text-green-700"}`}>
                      {result.recommendation}
                    </div>
                  </div>
                )}
              </div>

              {/* Information Section */}
              <div className="space-y-6">
                {/* About qSOFA */}
                <div className="bg-blue-50 border-l-4 border-[#0d9488] p-6 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-[#0d9488] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-[#1a237e] mb-2">About qSOFA</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        The quick Sequential Organ Failure Assessment (qSOFA) is a bedside clinical score used to identify patients with suspected infection who are at high risk for poor outcomes. A qSOFA score ≥2 suggests higher risk of mortality and prolonged ICU stay.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Clinical Use */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-[#1a237e] mb-4">Clinical Application</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#0d9488] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">
                        <strong>Emergency Department:</strong> Rapid triage of patients with suspected infection
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#0d9488] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">
                        <strong>General Ward:</strong> Identify patients requiring ICU-level monitoring
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#0d9488] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">
                        <strong>Bedside Assessment:</strong> No laboratory tests required - can be calculated immediately
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#0d9488] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">
                        <strong>Resource-Limited Settings:</strong> Simple criteria accessible in any clinical environment
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Evidence Base */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-[#1a237e] mb-4">Evidence-Based Medicine</h3>
                  <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                    The qSOFA score was developed and validated through analysis of over 148,000 patients across multiple international cohorts. It is recommended by the Sepsis-3 consensus definitions published in JAMA (2016).
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs font-semibold text-gray-600 mb-2">KEY REFERENCE</div>
                    <p className="text-sm text-gray-800">
                      Singer M, et al. The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). <em>JAMA</em>. 2016;315(8):801-810.
                    </p>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-xs text-yellow-800 leading-relaxed">
                    <strong>Clinical Disclaimer:</strong> This calculator is for educational and clinical decision support purposes. It should not replace clinical judgment. Always consider the full clinical context and local treatment protocols when making patient care decisions.
                  </p>
                </div>
              </div>
            </div>

            {/* SEO Content Section */}
            <div className="mt-16 max-w-4xl mx-auto prose prose-lg">
              <h2 className="text-3xl font-bold text-[#1a237e] mb-6">
                Understanding qSOFA: A Comprehensive Guide for Healthcare Professionals
              </h2>

              <h3 className="text-2xl font-semibold text-[#1a237e] mt-8 mb-4">
                What is the qSOFA Score?
              </h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                The quick Sequential Organ Failure Assessment (qSOFA) score is a simplified bedside clinical score designed to rapidly identify patients with suspected infection who are at high risk for adverse outcomes including mortality and prolonged intensive care unit (ICU) stay. Unlike the full SOFA score, qSOFA does not require laboratory tests, making it ideal for rapid assessment in emergency departments, general wards, and resource-limited settings common in Omani healthcare facilities.
              </p>

              <h3 className="text-2xl font-semibold text-[#1a237e] mt-8 mb-4">
                How to Calculate qSOFA Score
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                The qSOFA score consists of three simple clinical criteria, each worth one point:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li><strong>Altered mental status:</strong> Glasgow Coma Scale less than 15 or any acute change in mental status</li>
                <li><strong>Tachypnea:</strong> Respiratory rate of 22 breaths per minute or greater</li>
                <li><strong>Hypotension:</strong> Systolic blood pressure of 100 mmHg or less</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-6">
                A qSOFA score of 2 or 3 indicates high risk for poor outcomes and should prompt consideration for ICU admission, immediate cultures, broad-spectrum antibiotics, and close monitoring for organ dysfunction.
              </p>

              <h3 className="text-2xl font-semibold text-[#1a237e] mt-8 mb-4">
                Clinical Implementation in Oman
              </h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Healthcare professionals across Oman's hospitals and clinics can benefit from incorporating qSOFA into their sepsis screening protocols. The tool's simplicity makes it particularly valuable in busy emergency departments at Royal Hospital, Sultan Qaboos University Hospital, and regional healthcare centers throughout the Sultanate. Regular training on qSOFA assessment can improve early sepsis recognition and patient outcomes across Omani healthcare settings.
              </p>

              <h3 className="text-2xl font-semibold text-[#1a237e] mt-8 mb-4">
                Limitations and Clinical Judgment
              </h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                While qSOFA is a valuable screening tool, it should not be used in isolation. Clinical judgment remains paramount. The score has moderate sensitivity, meaning some high-risk patients may have a qSOFA score less than 2. Always consider the full clinical picture, patient history, and local treatment protocols. For patients with qSOFA less than 2 but high clinical suspicion for sepsis, proceed with full SOFA score calculation and appropriate interventions.
              </p>

              <h3 className="text-2xl font-semibold text-[#1a237e] mt-8 mb-4">
                Related Clinical Tools
              </h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                MedResearch Academy provides additional evidence-based clinical decision support tools for Omani healthcare professionals, including our Pre-Operative Patient Preparation Guide. Explore our Resources page for comprehensive clinical calculators and educational materials designed to support medical practice in Oman.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
