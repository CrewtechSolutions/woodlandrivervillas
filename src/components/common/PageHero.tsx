import React from 'react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  category?: string;
  bgImage?: string;
}

export const PageHero: React.FC<PageHeroProps> = ({
  title,
  subtitle,
  category = 'WOODLAND RIVER VILLAS',
  bgImage = '/assets/img/pageHero/4.png',
}) => {
  return (
    <section data-anim-wrap className="pageHero -type-1 -items-center">
      <div data-anim-child="img-right cover-white delay-1" className="pageHero__bg">
        <img src={bgImage} alt={title} loading="eager" />
      </div>

      <div className="container">
        <div className="row justify-center">
          <div className="col-auto">
            <div data-split="lines" data-anim="split-lines delay-3" className="pageHero__content text-center">
              {category && <div className="pageHero__subtitle text-white uppercase mb-20">{category}</div>}
              <h1 className="pageHero__title lh-11 capitalize text-white mb-30">{title}</h1>
              {subtitle && <p className="pageHero__text lh-17 text-white mt-30">{subtitle}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
