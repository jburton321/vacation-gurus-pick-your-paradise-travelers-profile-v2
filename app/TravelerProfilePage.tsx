"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

type FieldKey = "t1fn" | "t1ln" | "t1dob" | "t2fn" | "t2ln" | "t2dob";

type FormValues = Record<FieldKey, string>;

const initialValues: FormValues = {
  t1fn: "",
  t1ln: "",
  t1dob: "",
  t2fn: "",
  t2ln: "",
  t2dob: "",
};

const gallerySlides = Array.from({ length: 10 }, (_, index) => ({
  src: `/images/gallery/thumb${index + 1}.png`,
  alt: `Destination gallery ${index + 1}`,
}));

const bgImages = Array.from(
  { length: 10 },
  (_, index) => `/images/gallery/${index + 1}.png`
);

export default function TravelerProfilePage() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorFields, setErrorFields] = useState<FieldKey[]>([]);
  const [hasTcpaConsent, setHasTcpaConsent] = useState(false);
  const [showTcpaError, setShowTcpaError] = useState(false);
  const [activeBgIndex, setActiveBgIndex] = useState(0);
  const formPanelRef = useRef<HTMLDivElement>(null);
  const galleryTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = galleryTrackRef.current;

    if (!track) {
      return;
    }

    const resetPoint = track.scrollWidth / 3;
    track.scrollLeft = resetPoint;

    const handleScroll = () => {
      const sectionWidth = track.scrollWidth / 3;

      if (track.scrollLeft < sectionWidth * 0.5) {
        track.scrollLeft += sectionWidth;
      } else if (track.scrollLeft > sectionWidth * 1.5) {
        track.scrollLeft -= sectionWidth;
      }

      const slideWidth = getSlideWidth();
      const centerOffset = track.scrollLeft + track.clientWidth / 2;
      const rawIndex = Math.round(centerOffset / slideWidth);
      const normalized =
        ((rawIndex % gallerySlides.length) + gallerySlides.length) %
        gallerySlides.length;
      setActiveBgIndex(normalized);
    };

    track.addEventListener("scroll", handleScroll, { passive: true });

    let autoScrollTimer: ReturnType<typeof setInterval> | null = null;
    let userScrollTimeout: ReturnType<typeof setTimeout> | null = null;
    let isUserScrolling = false;

    const getSlideWidth = () => {
      const firstSlide = track.querySelector(`.${styles.heroGallerySlide}`) as HTMLElement | null;
      if (!firstSlide) return 192;
      return firstSlide.offsetWidth + 12;
    };

    const startAutoScroll = () => {
      stopAutoScroll();
      autoScrollTimer = setInterval(() => {
        if (isUserScrolling) return;
        track.scrollBy({ left: getSlideWidth(), behavior: "smooth" });
      }, 5000);
    };

    const stopAutoScroll = () => {
      if (autoScrollTimer) {
        clearInterval(autoScrollTimer);
        autoScrollTimer = null;
      }
    };

    const handleUserInteraction = () => {
      isUserScrolling = true;
      stopAutoScroll();
      if (userScrollTimeout) clearTimeout(userScrollTimeout);
      userScrollTimeout = setTimeout(() => {
        isUserScrolling = false;
        startAutoScroll();
      }, 5000);
    };

    track.addEventListener("pointerdown", handleUserInteraction);
    track.addEventListener("touchstart", handleUserInteraction, { passive: true });

    startAutoScroll();

    return () => {
      track.removeEventListener("scroll", handleScroll);
      track.removeEventListener("pointerdown", handleUserInteraction);
      track.removeEventListener("touchstart", handleUserInteraction);
      stopAutoScroll();
      if (userScrollTimeout) clearTimeout(userScrollTimeout);
    };
  }, []);

  const validateFields = (ids: FieldKey[]) => {
    const invalid = ids.filter((id) => !values[id].trim());

    if (!invalid.length) {
      return true;
    }

    setErrorFields((current) => [...new Set([...current, ...invalid])]);

    window.setTimeout(() => {
      setErrorFields((current) => current.filter((id) => !invalid.includes(id)));
    }, 2000);

    return false;
  };

  const scrollPanelToTop = () => {
    formPanelRef.current?.scrollTo({ top: 0, behavior: "auto" });
  };

  const goToStep2 = () => {
    if (!validateFields(["t1fn", "t1ln", "t1dob"])) {
      return;
    }

    setCurrentStep(2);
    scrollPanelToTop();
  };

  const goToStep1 = () => {
    setCurrentStep(1);
    scrollPanelToTop();
  };

  const handleSubmit = () => {
    if (!validateFields(["t2fn", "t2ln", "t2dob"])) {
      return;
    }

    if (!hasTcpaConsent) {
      setShowTcpaError(true);
      window.setTimeout(() => setShowTcpaError(false), 2000);
      return;
    }

    setShowSuccess(true);
    scrollPanelToTop();
  };

  const getInputClassName = (field: FieldKey) =>
    `${styles.fieldInput} ${errorFields.includes(field) ? styles.fieldInputError : ""}`;

  const formatDate = (value: string) => {
    if (!value) {
      return "-";
    }

    const parsed = new Date(`${value}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main className={styles.page}>
      <div className={styles.pageWrapper}>
        <div className={styles.heroBg} aria-hidden="true">
          {bgImages.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt=""
              fill
              sizes="100vw"
              priority={i === 0}
              className={`${styles.heroBgImage} ${
                i === activeBgIndex ? styles.heroBgImageActive : ""
              }`}
            />
          ))}
        </div>
        <div className={styles.heroPanel}>
          <div className={styles.heroLogo}>
            <Image
              src="/images/brand/primary-logo-full-color.svg"
              alt="Vacation Gurus"
              width={220}
              height={72}
              priority
            />
          </div>

          <h1 className={styles.heroHeadline}>Pick Your Paradise</h1>
          <p className={styles.heroSubheadline}>
            You&apos;re In. Now Claim Your Bonus Cruise.
          </p>
          <p className={styles.heroSub}>
            Complete your traveler profile below and we&apos;ll add a
            complimentary cruise certificate to your package — on us.
          </p>
          <div className={styles.heroGallery} aria-label="Destination gallery">
            <div className={styles.heroGalleryTrack} ref={galleryTrackRef}>
              {[...gallerySlides, ...gallerySlides, ...gallerySlides].map(
                (slide, index) => (
                  <div
                    className={`${styles.heroGallerySlide} ${
                      index % gallerySlides.length === activeBgIndex
                        ? styles.heroGallerySlideActive
                        : ""
                    }`}
                    key={`${slide.alt}-${index}`}
                  >
                    <Image
                      src={slide.src}
                      alt={
                        index >= gallerySlides.length &&
                        index < gallerySlides.length * 2
                          ? slide.alt
                          : ""
                      }
                      fill
                      sizes="(max-width: 500px) 46vw, (max-width: 900px) 32vw, 16vw"
                      className={styles.heroGalleryImage}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div className={styles.formPanel} ref={formPanelRef}>
          <div className={styles.formContainer}>
            {!showSuccess ? (
              <div>
                <h2 className={styles.formTitle}>Tell Us About Your Travelers</h2>
                <p className={styles.formSubtitle}>
                  Your paradise is waiting. Before we get you there, we need a
                  few details to personalize your experience and lock in your
                  bonus cruise.
                </p>

                <div
                  className={`${styles.stepIndicator} ${
                    currentStep === 2 ? styles.stepIndicatorStep2 : ""
                  }`}
                >
                  <button
                    type="button"
                    className={`${styles.stepToggleOption} ${
                      currentStep === 1 ? styles.stepToggleOptionActive : ""
                    }`}
                    onClick={goToStep1}
                  >
                    Traveler 1
                  </button>
                  <button
                    type="button"
                    className={`${styles.stepToggleOption} ${
                      currentStep === 2 ? styles.stepToggleOptionActive : ""
                    }`}
                    onClick={goToStep2}
                  >
                    Traveler 2
                  </button>
                </div>

                {currentStep === 1 ? (
                  <div>
                    <div className={styles.travelerSection}>
                      <div className={styles.travelerLabel}>Traveler 1</div>
                      <div className={styles.fieldRow}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel} htmlFor="t1fn">
                            First Name
                          </label>
                          <input
                            id="t1fn"
                            type="text"
                            className={getInputClassName("t1fn")}
                            placeholder="First name"
                            required
                            value={values.t1fn}
                            onChange={(event) =>
                              setValues((current) => ({
                                ...current,
                                t1fn: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel} htmlFor="t1ln">
                            Last Name
                          </label>
                          <input
                            id="t1ln"
                            type="text"
                            className={getInputClassName("t1ln")}
                            placeholder="Last name"
                            required
                            value={values.t1ln}
                            onChange={(event) =>
                              setValues((current) => ({
                                ...current,
                                t1ln: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className={styles.dobRow}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel} htmlFor="t1dob">
                            Date of Birth
                          </label>
                          <input
                            id="t1dob"
                            type="date"
                            className={getInputClassName("t1dob")}
                            required
                            value={values.t1dob}
                            onChange={(event) =>
                              setValues((current) => ({
                                ...current,
                                t1dob: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={styles.submitBtn}
                      onClick={goToStep2}
                    >
                      Continue to Traveler 2
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className={styles.travelerSection}>
                      <div className={styles.travelerLabel}>Traveler 2</div>
                      <div className={styles.fieldRow}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel} htmlFor="t2fn">
                            First Name
                          </label>
                          <input
                            id="t2fn"
                            type="text"
                            className={getInputClassName("t2fn")}
                            placeholder="First name"
                            required
                            value={values.t2fn}
                            onChange={(event) =>
                              setValues((current) => ({
                                ...current,
                                t2fn: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel} htmlFor="t2ln">
                            Last Name
                          </label>
                          <input
                            id="t2ln"
                            type="text"
                            className={getInputClassName("t2ln")}
                            placeholder="Last name"
                            required
                            value={values.t2ln}
                            onChange={(event) =>
                              setValues((current) => ({
                                ...current,
                                t2ln: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className={styles.dobRow}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel} htmlFor="t2dob">
                            Date of Birth
                          </label>
                          <input
                            id="t2dob"
                            type="date"
                            className={getInputClassName("t2dob")}
                            required
                            value={values.t2dob}
                            onChange={(event) =>
                              setValues((current) => ({
                                ...current,
                                t2dob: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className={`${styles.tcpaConsent} ${
                        showTcpaError ? styles.tcpaConsentError : ""
                      }`}
                    >
                      <label className={styles.tcpaConsentLabel} htmlFor="tcpaConsent">
                        <input
                          id="tcpaConsent"
                          type="checkbox"
                          className={styles.tcpaCheckbox}
                          checked={hasTcpaConsent}
                          onChange={(event) => {
                            setHasTcpaConsent(event.target.checked);
                            if (event.target.checked) {
                              setShowTcpaError(false);
                            }
                          }}
                        />
                        <span className={styles.tcpaConsentCopy}>
                          <strong>CONDITIONS:</strong> By clicking
                          {" "}
                          &ldquo;Accept &amp; Continue&rdquo;
                          {" "}
                          below, I consent and agree to the
                          {" "}
                          <a href="#">Terms &amp; Conditions</a>,
                          {" "}
                          <a href="#">Privacy Policy</a>,
                          {" "}
                          <a href="#">Mandatory Arbitration and Class Action Waiver</a>,
                          {" "}
                          all of which I have read and understand. I further give
                          my express written consent to receive promotional emails,
                          SMS/MMS/RCS texts and calls made from an automatic
                          telephone dialing system (for selection or dialing) and
                          those using prerecorded, artificial, or AI-generated
                          voice, whether delivered by live call or text message or
                          directly to voicemail from or on behalf of Sunstate Client
                          Services Inc. dba VacationGurus or Club Exploria, LLC dba
                          Exploria Resorts, Express Consent, LLC. at the
                          address/numbers provided regardless of that number being
                          on any Do not Call Registry. I understand text/data and
                          other charges may apply. My consent is not a condition of
                          any purchase. As an alternative to the consent above you
                          may enter the Promotion
                          {" "}
                          <a href="#">here</a>.
                        </span>
                      </label>
                    </div>

                    <button
                      type="button"
                      className={styles.submitBtn}
                      onClick={handleSubmit}
                    >
                      Accept &amp; Continue
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}

                <div className={styles.reassurance}>
                  Your cruise certificate will be delivered to your email and
                  phone upon submission. Redemption through GOCRV at
                  954-525-1777, Mon–Fri 9:30am–5pm ET. Same land and sea
                  redemption terms apply.
                </div>

                <div className={styles.legal}>
                  Cruise certificate is a complimentary 3 or 4-night Caribbean
                  Cruise for two adults. Certificate is issued via email and
                  text upon completion of your stay and attendance at the
                  required sales presentation in its entirety. Valid for 12
                  months from original purchase date. Reservations must be made
                  through GOCRV at 954-525-1777 (Mon–Fri 9:30am–5pm ET) once a
                  certificate has been received and registered. One certificate
                  per confirmed booking. See certificate for complete terms and
                  conditions.
                </div>
              </div>
            ) : (
              <div className={styles.successState}>
                <div className={styles.successIcon}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h2 className={styles.successTitle}>You&apos;re All Set!</h2>
                <p className={styles.successSub}>
                  Your traveler profile has been submitted. Here&apos;s your
                  bonus cruise certificate.
                </p>

                <div className={styles.confirmationGrid}>
                  <div className={styles.confirmationCard}>
                    <div className={styles.confirmationEyebrow}>Traveler 1</div>
                    <div className={styles.confirmationFields}>
                      <div className={styles.confirmationFieldItem}>
                        <span className={styles.confirmationFieldLabel}>
                          First Name
                        </span>
                        <span className={styles.confirmationFieldValue}>
                          {values.t1fn || "-"}
                        </span>
                      </div>
                      <div className={styles.confirmationFieldItem}>
                        <span className={styles.confirmationFieldLabel}>
                          Last Name
                        </span>
                        <span className={styles.confirmationFieldValue}>
                          {values.t1ln || "-"}
                        </span>
                      </div>
                      <div className={styles.confirmationFieldItem}>
                        <span className={styles.confirmationFieldLabel}>
                          Date of Birth
                        </span>
                        <span className={styles.confirmationFieldValue}>
                          {formatDate(values.t1dob)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.confirmationCard}>
                    <div className={styles.confirmationEyebrow}>Traveler 2</div>
                    <div className={styles.confirmationFields}>
                      <div className={styles.confirmationFieldItem}>
                        <span className={styles.confirmationFieldLabel}>
                          First Name
                        </span>
                        <span className={styles.confirmationFieldValue}>
                          {values.t2fn || "-"}
                        </span>
                      </div>
                      <div className={styles.confirmationFieldItem}>
                        <span className={styles.confirmationFieldLabel}>
                          Last Name
                        </span>
                        <span className={styles.confirmationFieldValue}>
                          {values.t2ln || "-"}
                        </span>
                      </div>
                      <div className={styles.confirmationFieldItem}>
                        <span className={styles.confirmationFieldLabel}>
                          Date of Birth
                        </span>
                        <span className={styles.confirmationFieldValue}>
                          {formatDate(values.t2dob)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${styles.confirmationCard} ${styles.confirmationCardWide}`}
                  >
                    <div className={styles.confirmationEyebrow}>
                      Bonus Certificate
                    </div>
                    <div className={styles.confirmationCardTitle}>
                      Complimentary Caribbean Cruise
                    </div>
                    <div className={styles.confirmationFields}>
                      <div className={styles.confirmationFieldItem}>
                        <span className={styles.confirmationFieldLabel}>
                          Duration
                        </span>
                        <span className={styles.confirmationFieldValue}>
                          3-4 Nights
                        </span>
                      </div>
                      <div className={styles.confirmationFieldItem}>
                        <span className={styles.confirmationFieldLabel}>Guests</span>
                        <span className={styles.confirmationFieldValue}>
                          2 Adults
                        </span>
                      </div>
                      <div className={styles.confirmationFieldItem}>
                        <span className={styles.confirmationFieldLabel}>
                          Destination
                        </span>
                        <span className={styles.confirmationFieldValue}>
                          Caribbean
                        </span>
                      </div>
                      <div className={styles.confirmationFieldItem}>
                        <span className={styles.confirmationFieldLabel}>
                          Validity
                        </span>
                        <span className={styles.confirmationFieldValue}>
                          12 Months
                        </span>
                      </div>
                    </div>
                    <p className={styles.confirmationNote}>
                      To redeem, call GOCRV at 954-525-1777, Mon-Fri 9:30am-5pm
                      ET. Your certificate will also be delivered to your email
                      and phone.
                    </p>
                  </div>
                </div>

                <div className={styles.successLegal}>
                  Cruise certificate is a complimentary 3 or 4-night Caribbean
                  Cruise for two adults. Certificate is issued via email and
                  text upon completion of your stay and attendance at the
                  required sales presentation in its entirety. Valid for 12
                  months from original purchase date. Reservations must be made
                  through GOCRV at 954-525-1777 (Mon–Fri 9:30am–5pm ET) once a
                  certificate has been received and registered. One certificate
                  per confirmed booking. See certificate for complete terms and
                  conditions.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <footer className={styles.siteFooter}>
        <div className={styles.siteFooterBrand}>
          <Image
            src="/images/brand/primary-logo-full-color.svg"
            alt="Vacation Gurus"
            width={132}
            height={44}
          />
        </div>
        <span className={styles.siteFooterCopy}>
          2025 © Vacation Gurus · FL SOT 44476
        </span>
        <span className={styles.siteFooterLinks}>
          <a href="#">Terms of Service</a> &nbsp;·&nbsp;{" "}
          <a href="#">Privacy Policy</a>
        </span>
      </footer>
    </main>
  );
}
