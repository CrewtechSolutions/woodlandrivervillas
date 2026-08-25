import React, { useEffect } from 'react';
import { SEO } from '../components/common/SEO';
import { PageHero } from '../components/common/PageHero';
import { InstagramGrid } from '../components/sections/InstagramGrid';
import { BookingCTA } from '../components/common/BookingCTA';
import { siteConfig } from '../data/siteConfig';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    if (typeof (window as any).initApp === 'function') {
      (window as any).initApp();
    }
  }, []);

  const testimonials = [
    { quote: "“Didn’t feel like a rental at all. The space felt personal, refined, and thoughtfully designed throughout.”", author: "Arjun Mehta" },
    { quote: "“Perfect for a peaceful group trip. Spacious, private, and effortlessly comfortable in every way.”", author: "Riya Shah" },
    { quote: "“Private, clean, and absolutely worth it. Everything felt well cared for and seamlessly managed.”", author: "Kabir Malhotra" },
    { quote: "“The villa felt private and well thought out. We spent most of our time by the pool and didn’t feel like leaving at all.”", author: "Ananya Iyer" },
    { quote: "“Everything was clean, calm, and easy. It’s the kind of place where you instantly slow down.”", author: "Vikram Desai" },
  ];

  return (
    <>
      <SEO
        title="About Woodland River Villa | Luxury Stays in Alibaug"
        description="Explore woodland river villa in Alibaug offering private villas, refined spaces, and a peaceful stay experience designed for comfort and exclusivity."
        canonical="https://www.woodlandriver.com/about/"
      />
      <PageHero
        title="A Retreat Defined by Space and Stillness"
        subtitle="Woodland river villa is envisioned as a private retreat in Alibaug, where thoughtful design meets natural surroundings. Created for those who value space and stillness, each villa offers an environment that feels calm, refined, and quietly luxurious."
        bgImage="/assets/img/pageHero/4.png"
      />

      {/* Section 1: Silent Luxury */}
      <section className="about -type-1 layout-pt-md layout-pb-md">
        <div data-anim-wrap className="container">
          <div data-anim-child="slide-up delay-1" className="about__backTitle text-sec text-light-2">
            WOODLAND RIVER VILLA'S
          </div>

          <div className="about__images">
            <div data-anim-child="img-right cover-white delay-2">
              <img src="/assets/img/about/12/1.png" alt="Woodland River Villa" className="rounded-16" loading="lazy" />
            </div>
            <div data-anim-child="img-right cover-white delay-4">
              <img src="/assets/img/about/12/2.png" alt="Woodland River Villa" className="rounded-16" loading="lazy" />
            </div>
            <div data-anim-child="img-right cover-white delay-6">
              <img src="/assets/img/about/12/3.png" alt="Woodland River Villa" className="rounded-16" loading="lazy" />
            </div>
          </div>

          <div className="about__content">
            <div className="row justify-center text-center">
              <div className="col-xl-8 col-lg-10">
                <div data-split="lines" data-anim-child="split-lines delay-7">
                  <h2 className="about__title text-120">SILENT LUXURY</h2>
                  <p className="lh-18">
                    At woodland river villa, every space is designed to feel open, balanced, and personal. The villas bring together considered design and natural elements, offering an experience that is both relaxed and elevated. Ideal for intimate gatherings and quiet escapes, it is a stay that feels effortless and complete.
                  </p>
                </div>

                <div data-anim-child="slide-up delay-9">
                  <a
                    className="button d-inline-flex -type-1 mx-auto mt-60 md:mt-30"
                    href={siteConfig.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="-icon">
                      <svg width="50" height="30" viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M35.8 28.0924C43.3451 28.0924 49.4616 21.9759 49.4616 14.4308C49.4616 6.88577 43.3451 0.769287 35.8 0.769287C28.255 0.769287 22.1385 6.88577 22.1385 14.4308C22.1385 21.9759 28.255 28.0924 35.8 28.0924Z"
                          stroke="#122223"
                        />
                        <path
                          d="M33.4808 10.2039L32.9985 10.8031L37.2931 14.2623H0.341553V15.0315H37.28L33.0008 18.4262L33.4785 19.0285L39 14.6492L33.4808 10.2039Z"
                          fill="#122223"
                        />
                      </svg>
                    </i>
                    BOOK YOUR STAY
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Our Story */}
      <section className="layout-pt-md layout-pb-md bg-light-1">
        <div data-anim-wrap className="container">
          <div className="row y-gap-50 items-center justify-between">
            <div className="col-lg-5 col-md-9">
              <div data-anim-child="slide-up delay-1" className="text-15 uppercase mb-30 sm:mb-10">
                OUR STORY
              </div>
              <h2 data-anim-child="slide-up delay-2" className="text-64 md:text-40 capitalize">
                An Idea Built Into a Place
              </h2>
              <p data-anim-child="slide-up delay-3" className="lh-18 pr-60 lg:pr-0 mt-40 md:mt-30">
                Woodland river villa was built around a simple idea to create a stay that feels seamless from the moment you arrive. Every detail is maintained with care, from the layout of the villas to the overall experience, ensuring a setting that feels composed, comfortable, and thoughtfully managed.
              </p>
              <div data-anim-child="slide-up delay-4" className="d-flex mt-50 md:mt-40">
                <a href={siteConfig.bookingUrl} target="_blank" rel="noopener noreferrer" className="button -type-1">
                  <i className="-icon">
                    <svg width="50" height="30" viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M35.8 28.0924C43.3451 28.0924 49.4616 21.9759 49.4616 14.4308C49.4616 6.88577 43.3451 0.769287 35.8 0.769287C28.255 0.769287 22.1385 6.88577 22.1385 14.4308C22.1385 21.9759 28.255 28.0924 35.8 28.0924Z"
                        stroke="#122223"
                      />
                      <path
                        d="M33.4808 10.2039L32.9985 10.8031L37.2931 14.2623H0.341553V15.0315H37.28L33.0008 18.4262L33.4785 19.0285L39 14.6492L33.4808 10.2039Z"
                        fill="#122223"
                      />
                    </svg>
                  </i>
                  READ MORE
                </a>
              </div>

              <div data-anim-child="slide-up delay-5" className="row y-gap-30 pt-40 md:pt-0">
                <div className="col-sm-4 col-auto">
                  <div className="text-92 sm:text-60 text-sec fw-500">04</div>
                  <div className="text-17 fw-500 uppercase">VILLAS</div>
                </div>

                <div className="col-sm-4 col-auto">
                  <div className="text-92 sm:text-60 text-sec fw-500">13</div>
                  <div className="text-17 fw-500 uppercase">ROOMS</div>
                </div>

                <div className="col-sm-4 col-auto">
                  <div className="text-92 sm:text-60 text-sec fw-500">02</div>
                  <div className="text-17 fw-500 uppercase">PARTY LAWNS</div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div data-anim-child="img-right cover-white delay-2">
                <div className="imageGrid -type-3">
                  <img src="/assets/img/about/3/2.png" alt="Woodland River Villa" loading="lazy" />
                  <img src="/assets/img/about/3/1.png" alt="Woodland River Villa" loading="lazy" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Quiet Luxury */}
      <section className="layout-pt-md layout-pb-md">
        <div className="container">
          <div data-anim-wrap className="row y-gap-40 justify-between items-center">
            <div data-anim="img-right cover-white delay-1" className="col-xl-6 col-lg-6">
              <img src="/assets/img/about/6/1.png" alt="Woodland River Villa" loading="lazy" />
            </div>

            <div data-split="lines" data-anim="split-lines delay-3" className="col-xl-5 col-lg-6">
              <h3 className="text-40 md:text-30 capitalize">
                Quiet Luxury, Thoughtfully Lived
              </h3>
              <p className="lh-17 pt-40">
                The philosophy behind woodland river villa is to offer understated comfort without excess. Spaces are designed to breathe, allowing natural light, openness, and calm to define the experience.
              </p>
              <p className="lh-17 pt-40">
                It is a place where privacy is preserved, and every element exists to support a sense of ease.
              </p>
            </div>
          </div>

          <div data-anim-wrap className="row y-gap-40 justify-between items-center pt-100 sm:pt-50">
            <div data-split="lines" data-anim="split-lines delay-3" className="col-xl-5 col-lg-6">
              <h3 className="text-40 md:text-30 capitalize">
                Moments That Unfold Naturally
              </h3>
              <p className="lh-17 pt-40">
                A stay at woodland river villa unfolds at your own pace. Whether spent indoors in comfort or outdoors in open surroundings, every moment feels unforced and natural.
              </p>
              <p className="lh-17 pt-40">
                With the right balance of space, amenities, and setting, the experience remains both refined and deeply relaxing.
              </p>
            </div>

            <div data-anim="img-right cover-white delay-1" className="col-xl-6 col-lg-6">
              <img src="/assets/img/about/6/2.png" alt="Woodland River Villa" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Reflections Testimonials */}
      <section className="layout-pt-md layout-pb-md bg-light-1">
        <div className="container">
          <div className="row justify-center text-center">
            <div className="col-auto">
              <div className="mb-40">
                <svg width="45" height="44" viewBox="0 0 45 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g filter="url(#filter0_d_428_953)">
                    <path
                      d="M9.67883 38C6.64234 38 4.27007 36.9524 2.56204 34.8571C0.854015 32.6667 0 29.4286 0 25.1429C0 20.6667 0.99635 16.381 2.98905 12.2857C5.07664 8.19048 8.01825 4.14286 11.8139 0.142864C11.9088 0.0476213 12.0511 0 12.2409 0C12.5255 0 12.7153 0.142858 12.8102 0.428574C13 0.619048 13.0474 0.857143 12.9526 1.14286C10.6752 4.19048 9.10949 7.14286 8.25548 10C7.49635 12.7619 7.11679 15.8571 7.11679 19.2857C7.11679 21.8571 7.44891 23.8571 8.11314 25.2857C8.77737 26.7143 9.67883 28 10.8175 29.1429L5.40876 30.1429C5.31387 28.5238 5.74088 27.2857 6.68978 26.4286C7.73358 25.5714 9.06205 25.1429 10.6752 25.1429C12.6679 25.1429 14.1861 25.7143 15.2299 26.8571C16.3686 28 16.938 29.5714 16.938 31.5714C16.938 33.6667 16.2737 35.2857 14.9453 36.4286C13.7117 37.4762 11.9562 38 9.67883 38ZM31.5985 38C28.562 38 26.1898 36.9524 24.4818 34.8571C22.8686 32.6667 22.062 29.4286 22.062 25.1429C22.062 20.5714 23.0584 16.2381 25.0511 12.1429C27.0438 8.04762 29.9854 4.04762 33.8759 0.142864C33.9708 0.0476213 34.1131 0 34.3029 0C34.5876 0 34.7774 0.142858 34.8723 0.428574C35.062 0.619048 35.1095 0.857143 35.0146 1.14286C32.7372 4.19048 31.1715 7.14286 30.3175 10C29.5584 12.7619 29.1788 15.8571 29.1788 19.2857C29.1788 21.8571 29.4635 23.9048 30.0328 25.4286C30.6971 26.8571 31.5985 28.0952 32.7372 29.1429L27.4708 30.1429C27.3759 28.5238 27.8029 27.2857 28.7518 26.4286C29.7007 25.5714 31.0292 25.1429 32.7372 25.1429C34.7299 25.1429 36.2482 25.7143 37.292 26.8571C38.4307 28 39 29.5714 39 31.5714C39 33.6667 38.3358 35.2857 37.0073 36.4286C35.7737 37.4762 33.9708 38 31.5985 38Z"
                      fill="#122223"
                    />
                  </g>
                </svg>
              </div>
              <div className="text-15 uppercase mb-30 sm:mb-15">REFLECTIONS FROM OUR GUESTS</div>
              <h2 className="text-64 md:text-40 lh-065">Testimonials</h2>
            </div>
          </div>
        </div>

        <div className="relative container">
          <div className="row justify-center pt-100 sm:pt-50">
            <div className="col-xl-9 col-lg-10 col-9">
              <div
                className="overflow-hidden js-section-slider"
                data-gap="30"
                data-slider-cols="xl-1 lg-1 md-1 sm-1 base-1"
                data-nav-prev="js-slider3-prev"
                data-nav-next="js-slider3-next"
              >
                <div className="swiper-wrapper">
                  {testimonials.map((t, idx) => (
                    <div key={idx} className="swiper-slide">
                      <div className="text-center">
                        <div className="text-sec text-40 md:text-24">{t.quote}</div>
                        <div className="mt-50">{t.author}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="navAbsolute">
                  <button className="size-80 flex-center rounded-full js-slider3-prev" aria-label="Previous Testimonial">
                    <i className="icon-arrow-left text-24"></i>
                  </button>

                  <button className="size-80 flex-center rounded-full js-slider3-next" aria-label="Next Testimonial">
                    <i className="icon-arrow-right text-24"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: See It Before You Book It */}
      <InstagramGrid />

      {/* Section 6: Step Into Your Own Space CTA */}
      <BookingCTA />
    </>
  );
};
