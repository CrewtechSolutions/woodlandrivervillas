import React from 'react';
import { SEO } from '../components/common/SEO';
import { PageHero } from '../components/common/PageHero';
import { rulesPolicyData } from '../data/policiesData';

export const RulesPolicyPage: React.FC = () => {
  return (
    <>
      <SEO title="House Rules & Policies | Woodland River Villa Alibaug" />
      <PageHero title="House Rules & Guidelines" subtitle="Important Policies to Ensure a Comfortable Stay" />

      <section className="layout-pt-md layout-pb-md">
        <div className="container">
          <div className="row justify-center">
            <div className="col-xl-9 col-lg-10">
              {rulesPolicyData.map((sec, idx) => (
                <div key={idx} className="mb-50">
                  <h2 className="text-30 fw-500 mb-20">{sec.title}</h2>
                  <ul className="list-disc pl-20">
                    {sec.content.map((item, itemIdx) => (
                      <li key={itemIdx} className="text-18 text-sec lh-17 mb-10">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
