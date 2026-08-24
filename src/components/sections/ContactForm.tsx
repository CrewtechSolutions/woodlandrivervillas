import React, { useState } from 'react';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="layout-pt-md layout-pb-md">
      <div className="container">
        <div className="row justify-center text-center">
          <div className="col-xl-8 col-lg-10">
            <div className="mb-30">
              <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_632_5288)">
                  <path
                    d="M47.9511 0.57683C45.9935 -0.55357 43.4816 0.119689 42.3516 2.07726L36.7643 11.7548H24.7149C24.1755 11.7548 23.7383 12.1921 23.7383 12.7313C23.7383 13.2706 24.1755 13.7079 24.7149 13.7079H35.6366L31.5821 20.7308H8.78948C8.25011 20.7308 7.81289 21.1681 7.81289 21.7073C7.81289 22.2467 8.25011 22.6839 8.78948 22.6839H30.4543L28.199 26.5903H8.78948C8.25011 26.5903 7.81289 27.0276 7.81289 27.5669C7.81289 28.1061 8.25011 28.5435 8.78948 28.5435H27.795L27.3742 32.4498H8.78948C8.25011 32.4498 7.81289 32.8871 7.81289 33.4264C7.81289 33.9657 8.25011 34.403 8.78948 34.403H27.1638L27.1118 34.8853C27.0704 35.2697 27.2597 35.6424 27.5944 35.8356C27.7461 35.9232 27.9146 35.9665 28.0826 35.9665C28.2857 35.9665 28.488 35.9033 28.6588 35.7785L34.8944 31.2232C35.0043 31.1429 35.0961 31.0407 35.1641 30.9229L42.7745 17.7414V36.6703C42.7745 38.8585 40.9943 40.6388 38.8061 40.6388H16.1736C15.8246 40.6388 15.5022 40.8249 15.3278 41.1271L11.913 47.0418L8.49817 41.1271C8.32375 40.8249 8.00138 40.6388 7.65244 40.6388H5.92164C3.7334 40.6388 1.95317 38.8585 1.95317 36.6703V17.6764C1.95317 15.4882 3.7334 13.7079 5.92164 13.7079H15.9257C16.4651 13.7079 16.9023 13.2706 16.9023 12.7313C16.9023 12.192 16.4651 11.7548 15.9257 11.7548H5.92164C2.65642 11.7548 0 14.4112 0 17.6764V36.6703C0 39.9355 2.65642 42.592 5.92164 42.592H7.08856L11.0673 49.4832C11.2417 49.7854 11.5641 49.9715 11.913 49.9715C12.2619 49.9715 12.5843 49.7854 12.7587 49.4832L16.7374 42.592H38.8062C42.0714 42.592 44.7278 39.9355 44.7278 36.6703V17.6764C44.7278 16.8393 44.5503 16.0123 44.2107 15.2541L49.4516 6.17648C50.5818 4.21901 49.9087 1.70703 47.9511 0.57683ZM46.9745 2.26828C47.9994 2.85999 48.3517 4.17507 47.76 5.1999L47.202 6.16643L43.485 4.02037L44.043 3.05385C44.6347 2.02911 45.9497 1.67686 46.9745 2.26828ZM29.7203 28.9075L32.5315 30.5306L29.2904 32.8984L29.7203 28.9075ZM33.9609 29.1006L30.2439 26.9545L42.5084 5.71182L46.2254 7.85787L33.9609 29.1006Z"
                    fill="#122223"
                  />
                  <path
                    d="M20.3203 13.708C20.5771 13.708 20.8291 13.6035 21.0117 13.4219C21.1934 13.2402 21.2979 12.9883 21.2979 12.7314C21.2979 12.4746 21.1934 12.2227 21.0117 12.041C20.8291 11.8595 20.5781 11.7549 20.3203 11.7549C20.0635 11.7549 19.8115 11.8594 19.6299 12.041C19.4482 12.2227 19.3447 12.4746 19.3447 12.7314C19.3447 12.9883 19.4481 13.2402 19.6299 13.4219C19.8125 13.6035 20.0635 13.708 20.3203 13.708Z"
                    fill="#122223"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_632_5288">
                    <rect width="50" height="50" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>

            <div className="text-15 uppercase mb-20">Get In touch</div>
            <h2 className="text-64 md:text-40 capitalize">
              Tell Us What <br className="lg:d-none" />You’re Looking For
            </h2>
            <p className="lh-17 mt-30">
              Drop your details and a quick note. We’ll get back with clear answers and next steps to plan your villa experience.
            </p>

            {submitted ? (
              <div className="bg-light-1 p-40 rounded-16 mt-60">
                <h3 className="text-30 fw-500">Thank You!</h3>
                <p className="text-18 mt-15">Your message has been received. We will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contactForm row y-gap-30 pt-60 text-left">
                <div className="col-md-6">
                  <div className="form-input">
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="First Name *"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-input">
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Last Name *"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-input">
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email *"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-input">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone Number"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="form-input">
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Subject *"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="form-input">
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Message *"
                      className="form-control"
                    ></textarea>
                  </div>
                </div>

                <div className="col-12">
                  <button type="submit" className="button -md -type-2 w-1/1 bg-accent-2 -accent-1">
                    <span>SEND YOUR MESSAGE</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
