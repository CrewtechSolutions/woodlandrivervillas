import React from 'react';
import { SEO } from '../components/common/SEO';
import { PageHero } from '../components/common/PageHero';
import { privacyPolicyData } from '../data/policiesData';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <SEO title="Privacy Policy | Woodland River Villa Alibaug" />
      <PageHero title="Privacy Policy" subtitle="Woodland River Villa Data & Information Safeguards" />

      <section className="layout-pt-md layout-pb-md">
        <div className="container">
          <div className="row justify-center">
            <div className="col-xl-9 col-lg-10">
              {privacyPolicyData.map((sec, idx) => (
                <div key={idx} className="mb-50">
                  <h2 className="text-30 fw-500 mb-20">{sec.title}</h2>
                  {sec.content.map((p, pIdx) => (
                    <p key={pIdx} className="text-18 text-sec lh-17 mb-15">
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
