import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const AboutSection: React.FC = () => {
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const playVideos = () => {
      [videoRef1, videoRef2].forEach((ref) => {
        if (ref.current) {
          ref.current.muted = true;
          ref.current.play().catch(() => {
            const handleInteraction = () => {
              if (ref.current) {
                ref.current.muted = true;
                ref.current.play().catch(() => {});
              }
              window.removeEventListener('click', handleInteraction);
              window.removeEventListener('touchstart', handleInteraction);
              window.removeEventListener('scroll', handleInteraction);
            };
            window.addEventListener('click', handleInteraction);
            window.addEventListener('touchstart', handleInteraction);
            window.addEventListener('scroll', handleInteraction);
          });
        }
      });
    };

    playVideos();
  }, []);

  return (
    <section className="layout-pt-md layout-pb-md">
      <div data-anim-wrap className="container">
        <div className="row justify-center text-center">
          <div data-split="lines" data-anim-child="split-lines delay-2" className="col-auto">
            <div className="text-15 uppercase mb-30 sm:mb-10">ABOUT US</div>
            <h2 className="text-64 md:text-40">
              Not a Hotel. Not an Airbnb. <br className="lg:d-none" />
              Something Better.
            </h2>
          </div>
        </div>

        <div className="row justify-center pt-60 md:pt-30 text-center">
          <div data-anim-child="slide-up delay-3" className="col-xl-8 col-lg-10">
            <p className="text-20 md:text-16">
              Woodland river villa gives you a private space where you don’t have to adjust around strangers or rigid timings.
              It’s simple you check in, and the place is yours.
            </p>

            <div className="d-flex justify-center mt-40">
              <Link className="button d-inline-flex -type-1" to="/about">
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
                Know More
              </Link>
            </div>
          </div>
        </div>

        <div className="row x-gap-50 y-gap-30 pt-100 sm:pt-50">
          <div className="col-lg-4 col-sm-6">
            <div data-anim-child="img-right cover-light-1 delay-2" className="video-wrapper">
              <video
                ref={videoRef1}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                src="/assets/videos/video-1.mp4"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
              >
                <source src="/assets/videos/video-1.mp4" type="video/mp4" />
              </video>
            </div>
            <div data-anim-child="fade delay-5" className="text-17 mt-30">
              Silent Horizon Catch
            </div>
          </div>

          <div className="col-lg-4 col-sm-6">
            <div className="pt-100 md:pt-0">
              <div data-anim-child="img-right cover-light-1 delay-3" className="rounded-16">
                <img src="/assets/img/about/8/2.png" alt="Woodland River Villa" className="img-ratio rounded-16" loading="lazy" />
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-sm-6">
            <div data-anim-child="img-right cover-light-1 delay-4" className="video-wrapper">
              <video
                ref={videoRef2}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                src="/assets/videos/video-2.mp4"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
              >
                <source src="/assets/videos/video-2.mp4" type="video/mp4" />
              </video>
            </div>
            <div data-anim-child="fade delay-5" className="text-17 mt-30">
              Serene Stream Glance
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
