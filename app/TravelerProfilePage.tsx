"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

type FieldKey =
  | "t1fn"
  | "t1ln"
  | "t1dob"
  | "t1addr"
  | "t1city"
  | "t1state"
  | "t1zip"
  | "t2fn"
  | "t2ln"
  | "t2dob"
  | "t2addr"
  | "t2city"
  | "t2state"
  | "t2zip"
  | "relationship";

type FormValues = Record<FieldKey, string>;

const initialValues: FormValues = {
  t1fn: "",
  t1ln: "",
  t1dob: "",
  t1addr: "",
  t1city: "",
  t1state: "",
  t1zip: "",
  t2fn: "",
  t2ln: "",
  t2dob: "",
  t2addr: "",
  t2city: "",
  t2state: "",
  t2zip: "",
  relationship: "",
};

const relationshipOptions = [
  "Legally Married Spouse",
  "Cohabitating Partner",
  "Friend",
  "Family Member",
];

const usStates = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL",
  "GA","HI","ID","IL","IN","IA","KS","KY","LA","ME",
  "MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI",
  "SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

const gallerySlides = Array.from({ length: 10 }, (_, index) => ({
  src: `/images/gallery/thumb${index + 1}.png`,
  alt: `Destination gallery ${index + 1}`,
}));

const bgImages = Array.from(
  { length: 10 },
  (_, index) => `/images/gallery/${index + 1}.png`
);

const bgImagesMobile = Array.from(
  { length: 10 },
  (_, index) => `/images/gallery/mobile${index + 1}.png`
);

declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: Record<string, unknown>
          ) => {
            addListener: (event: string, cb: () => void) => void;
            getPlace: () => {
              address_components?: Array<{
                long_name: string;
                short_name: string;
                types: string[];
              }>;
            };
          };
        };
      };
    };
  }
}

export default function TravelerProfilePage() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorFields, setErrorFields] = useState<FieldKey[]>([]);
  const [activeBgIndex, setActiveBgIndex] = useState(0);
  const formPanelRef = useRef<HTMLDivElement>(null);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const t1addrRef = useRef<HTMLInputElement>(null);
  const t2addrRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initAutocomplete = (
      inputRef: React.RefObject<HTMLInputElement | null>,
      prefix: "t1" | "t2"
    ) => {
      if (!inputRef.current || !window.google?.maps?.places) return;
      const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "us" },
        fields: ["address_components"],
        types: ["address"],
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place.address_components) return;
        let street = "";
        let city = "";
        let state = "";
        let zip = "";
        for (const c of place.address_components) {
          const t = c.types[0];
          if (t === "street_number") street = c.long_name;
          else if (t === "route") street += (street ? " " : "") + c.long_name;
          else if (t === "locality") city = c.long_name;
          else if (t === "administrative_area_level_1") state = c.short_name;
          else if (t === "postal_code") zip = c.long_name;
        }
        setValues((cur) => ({
          ...cur,
          [`${prefix}addr`]: street,
          [`${prefix}city`]: city,
          [`${prefix}state`]: state,
          [`${prefix}zip`]: zip,
        } as FormValues));
      });
    };

    const timer = setInterval(() => {
      if (window.google?.maps?.places) {
        clearInterval(timer);
        initAutocomplete(t1addrRef, "t1");
        initAutocomplete(t2addrRef, "t2");
      }
    }, 500);

    return () => clearInterval(timer);
  }, []);

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

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [touched, setTouched] = useState<Set<FieldKey>>(new Set());

  const validateField = (key: FieldKey, val: string): string | null => {
    const v = val.trim();
    if (!v) return "Required";

    if (key === "t1dob" || key === "t2dob") {
      const d = new Date(`${v}T00:00:00`);
      if (Number.isNaN(d.getTime())) return "Invalid date";
      const now = new Date();
      if (d > now) return "Date cannot be in the future";
      const age = now.getFullYear() - d.getFullYear();
      if (age > 120) return "Please enter a valid date";
      if (age < 18) return "Must be 18 or older";
    }

    if (key === "t1zip" || key === "t2zip") {
      if (!/^\d{5}(-\d{4})?$/.test(v)) return "Enter a valid ZIP (e.g. 33301)";
    }

    if (key === "t1fn" || key === "t1ln" || key === "t2fn" || key === "t2ln") {
      if (v.length < 2) return "Must be at least 2 characters";
      if (/\d/.test(v)) return "Name cannot contain numbers";
    }

    if (key === "t1city" || key === "t2city") {
      if (v.length < 2) return "Must be at least 2 characters";
    }

    return null;
  };

  const handleBlur = (key: FieldKey) => {
    setTouched((prev) => new Set(prev).add(key));
    const error = validateField(key, values[key]);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (error) next[key] = error;
      else delete next[key];
      return next;
    });
  };

  const handleFieldChange = (key: FieldKey, val: string) => {
    setValues((cur) => ({ ...cur, [key]: val }));
    if (touched.has(key)) {
      const error = validateField(key, val);
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (error) next[key] = error;
        else delete next[key];
        return next;
      });
    }
  };

  const scrollPanelToTop = () => {
    formPanelRef.current?.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleSubmit = () => {
    const allRequired: FieldKey[] = [
      "t1fn", "t1ln", "t1dob", "t1addr", "t1city", "t1state", "t1zip",
      "t2fn", "t2ln", "t2dob", "t2addr", "t2city", "t2state", "t2zip",
      "relationship",
    ];

    const allTouched = new Set<FieldKey>(allRequired);
    setTouched(allTouched);

    const errors: Partial<Record<FieldKey, string>> = {};
    for (const key of allRequired) {
      const err = validateField(key, values[key]);
      if (err) errors[key] = err;
    }
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setErrorFields(Object.keys(errors) as FieldKey[]);
      window.setTimeout(() => setErrorFields([]), 2000);
      return;
    }

    setShowSuccess(true);
    scrollPanelToTop();
  };

  const getInputClassName = (field: FieldKey) =>
    `${styles.fieldInput} ${
      errorFields.includes(field) || fieldErrors[field] ? styles.fieldInputError : ""
    }`;

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
        <div className={`${styles.heroBg} ${styles.heroBgDesktop}`} aria-hidden="true">
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
        <div className={`${styles.heroBg} ${styles.heroBgMobile}`} aria-hidden="true">
          {bgImagesMobile.map((src, i) => (
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
              src="/images/brand/primary-logo-full-color.png"
              alt="Vacation Gurus"
              width={220}
              height={72}
              priority
            />
          </div>

          <h1 className={styles.heroHeadline}>Fill Out Your Traveler Profile Today</h1>
          <p className={styles.heroSubheadline}>
            And Claim Your Bonus 4-Day Cruise
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
                <h2 className={styles.formHeadline}>
                  Please fill in your Name, Address &amp; DOB exactly as it
                  appears on your drivers license.
                </h2>

                <p className={styles.formSubtext}>
                  To finalize your reservation, you must complete your Traveler
                  Profile as the next step. Reservations cannot be booked with
                  the resort until this step is complete. Complete today and you
                  will get a BONUS 4-day Caribbean cruise!
                </p>

                <div className={styles.travelerSection}>
                  <div className={styles.travelerLabel}>Traveler 1</div>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="t1fn">First Name</label>
                      <input id="t1fn" type="text" className={getInputClassName("t1fn")} placeholder="First name" required value={values.t1fn} onChange={(e) => handleFieldChange("t1fn", e.target.value)} onBlur={() => handleBlur("t1fn")} />
                      {fieldErrors.t1fn && <span className={styles.fieldErrorMsg}>{fieldErrors.t1fn}</span>}
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="t1ln">Last Name</label>
                      <input id="t1ln" type="text" className={getInputClassName("t1ln")} placeholder="Last name" required value={values.t1ln} onChange={(e) => handleFieldChange("t1ln", e.target.value)} onBlur={() => handleBlur("t1ln")} />
                      {fieldErrors.t1ln && <span className={styles.fieldErrorMsg}>{fieldErrors.t1ln}</span>}
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <div className={styles.fieldLabelRow}>
                        <label className={styles.fieldLabel} htmlFor="t1dob">Date of Birth</label>
                        <span className={styles.tooltip} onClick={(e) => e.preventDefault()} onMouseDown={(e) => e.preventDefault()}>
                          <span className={styles.tooltipIcon}>?</span>
                          <span className={styles.tooltipContent}>Cruise lines require this information to help with your bookings. This allows them to distribute your cruise certificate faster and more efficiently.</span>
                        </span>
                      </div>
                      <input id="t1dob" type="date" className={getInputClassName("t1dob")} required value={values.t1dob} onChange={(e) => handleFieldChange("t1dob", e.target.value)} onBlur={() => handleBlur("t1dob")} />
                      {fieldErrors.t1dob && <span className={styles.fieldErrorMsg}>{fieldErrors.t1dob}</span>}
                    </div>
                  </div>
                  <div className={styles.fieldFullRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="t1addr">Street Address</label>
                      <input ref={t1addrRef} id="t1addr" type="text" className={getInputClassName("t1addr")} placeholder="Street address" required autoComplete="off" value={values.t1addr} onChange={(e) => handleFieldChange("t1addr", e.target.value)} onBlur={() => handleBlur("t1addr")} />
                      <p className={styles.fieldHint}>Must match your Drivers License — used to verify your reservation at check-in.</p>
                      {fieldErrors.t1addr && <span className={styles.fieldErrorMsg}>{fieldErrors.t1addr}</span>}
                    </div>
                  </div>
                  <div className={styles.fieldRowThree}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="t1city">City</label>
                      <input id="t1city" type="text" className={getInputClassName("t1city")} placeholder="City" required value={values.t1city} onChange={(e) => handleFieldChange("t1city", e.target.value)} onBlur={() => handleBlur("t1city")} />
                      {fieldErrors.t1city && <span className={styles.fieldErrorMsg}>{fieldErrors.t1city}</span>}
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="t1state">State</label>
                      <select id="t1state" className={getInputClassName("t1state")} required value={values.t1state} onChange={(e) => handleFieldChange("t1state", e.target.value)} onBlur={() => handleBlur("t1state")}>
                        <option value="">State</option>
                        {usStates.map((s) => (<option key={s} value={s}>{s}</option>))}
                      </select>
                      {fieldErrors.t1state && <span className={styles.fieldErrorMsg}>{fieldErrors.t1state}</span>}
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="t1zip">ZIP Code</label>
                      <input id="t1zip" type="text" className={getInputClassName("t1zip")} placeholder="ZIP" required inputMode="numeric" maxLength={10} value={values.t1zip} onChange={(e) => handleFieldChange("t1zip", e.target.value)} onBlur={() => handleBlur("t1zip")} />
                      {fieldErrors.t1zip && <span className={styles.fieldErrorMsg}>{fieldErrors.t1zip}</span>}
                    </div>
                  </div>
                </div>

                <div className={styles.travelerSection}>
                  <div className={styles.travelerLabel}>Traveler 2</div>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="relationship">Relationship to Your Second Traveler</label>
                      <select id="relationship" className={getInputClassName("relationship")} required value={values.relationship} onChange={(e) => handleFieldChange("relationship", e.target.value)} onBlur={() => handleBlur("relationship")}>
                        <option value="">Select relationship</option>
                        {relationshipOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                      </select>
                      {fieldErrors.relationship && <span className={styles.fieldErrorMsg}>{fieldErrors.relationship}</span>}
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="t2fn">First Name</label>
                      <input id="t2fn" type="text" className={getInputClassName("t2fn")} placeholder="First name" required value={values.t2fn} onChange={(e) => handleFieldChange("t2fn", e.target.value)} onBlur={() => handleBlur("t2fn")} />
                      {fieldErrors.t2fn && <span className={styles.fieldErrorMsg}>{fieldErrors.t2fn}</span>}
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="t2ln">Last Name</label>
                      <input id="t2ln" type="text" className={getInputClassName("t2ln")} placeholder="Last name" required value={values.t2ln} onChange={(e) => handleFieldChange("t2ln", e.target.value)} onBlur={() => handleBlur("t2ln")} />
                      {fieldErrors.t2ln && <span className={styles.fieldErrorMsg}>{fieldErrors.t2ln}</span>}
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <div className={styles.fieldLabelRow}>
                        <label className={styles.fieldLabel} htmlFor="t2dob">Date of Birth</label>
                        <span className={styles.tooltip} onClick={(e) => e.preventDefault()} onMouseDown={(e) => e.preventDefault()}>
                          <span className={styles.tooltipIcon}>?</span>
                          <span className={styles.tooltipContent}>Cruise lines require this information to help with your bookings. This allows them to distribute your cruise certificate faster and more efficiently.</span>
                        </span>
                      </div>
                      <input id="t2dob" type="date" className={getInputClassName("t2dob")} required value={values.t2dob} onChange={(e) => handleFieldChange("t2dob", e.target.value)} onBlur={() => handleBlur("t2dob")} />
                      {fieldErrors.t2dob && <span className={styles.fieldErrorMsg}>{fieldErrors.t2dob}</span>}
                    </div>
                  </div>
                  <div className={styles.fieldFullRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="t2addr">Street Address</label>
                      <input ref={t2addrRef} id="t2addr" type="text" className={getInputClassName("t2addr")} placeholder="Street address" required autoComplete="off" value={values.t2addr} onChange={(e) => handleFieldChange("t2addr", e.target.value)} onBlur={() => handleBlur("t2addr")} />
                      <p className={styles.fieldHint}>Must match your Drivers License — used to verify your reservation at check-in.</p>
                      {fieldErrors.t2addr && <span className={styles.fieldErrorMsg}>{fieldErrors.t2addr}</span>}
                    </div>
                  </div>
                  <div className={styles.fieldRowThree}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="t2city">City</label>
                      <input id="t2city" type="text" className={getInputClassName("t2city")} placeholder="City" required value={values.t2city} onChange={(e) => handleFieldChange("t2city", e.target.value)} onBlur={() => handleBlur("t2city")} />
                      {fieldErrors.t2city && <span className={styles.fieldErrorMsg}>{fieldErrors.t2city}</span>}
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="t2state">State</label>
                      <select id="t2state" className={getInputClassName("t2state")} required value={values.t2state} onChange={(e) => handleFieldChange("t2state", e.target.value)} onBlur={() => handleBlur("t2state")}>
                        <option value="">State</option>
                        {usStates.map((s) => (<option key={s} value={s}>{s}</option>))}
                      </select>
                      {fieldErrors.t2state && <span className={styles.fieldErrorMsg}>{fieldErrors.t2state}</span>}
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="t2zip">ZIP Code</label>
                      <input id="t2zip" type="text" className={getInputClassName("t2zip")} placeholder="ZIP" required inputMode="numeric" maxLength={10} value={values.t2zip} onChange={(e) => handleFieldChange("t2zip", e.target.value)} onBlur={() => handleBlur("t2zip")} />
                      {fieldErrors.t2zip && <span className={styles.fieldErrorMsg}>{fieldErrors.t2zip}</span>}
                    </div>
                  </div>
                </div>


                <button
                  type="button"
                  className={styles.submitBtn}
                  onClick={handleSubmit}
                >
                  Submit &amp; Continue
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>

                <div className={styles.reassurance}>
                  Your cruise certificate will be delivered to you after you
                  complete your travel.
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
                  Your traveler profile has been submitted.
                </p>

                <div className={styles.confirmationGrid}>
                  <div className={styles.confirmationCard}>
                    <div className={styles.confirmationEyebrow}>Traveler 1</div>
                    <div className={styles.confirmationFields}>
                      <div className={styles.confirmationFieldItem}>
                        <span className={styles.confirmationFieldLabel}>Name</span>
                        <span className={styles.confirmationFieldValue}>
                          {values.t1fn} {values.t1ln}
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
                      <div className={styles.confirmationFieldItem}>
                        <span className={styles.confirmationFieldLabel}>Address</span>
                        <span className={styles.confirmationFieldValue}>
                          {values.t1addr}, {values.t1city}, {values.t1state}{" "}
                          {values.t1zip}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.confirmationCard}>
                    <div className={styles.confirmationEyebrow}>Traveler 2</div>
                    <div className={styles.confirmationFields}>
                      <div className={styles.confirmationFieldItem}>
                        <span className={styles.confirmationFieldLabel}>Name</span>
                        <span className={styles.confirmationFieldValue}>
                          {values.t2fn} {values.t2ln}
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
                      <div className={styles.confirmationFieldItem}>
                        <span className={styles.confirmationFieldLabel}>Address</span>
                        <span className={styles.confirmationFieldValue}>
                          {values.t2addr}, {values.t2city}, {values.t2state}{" "}
                          {values.t2zip}
                        </span>
                      </div>
                      <div className={styles.confirmationFieldItem}>
                        <span className={styles.confirmationFieldLabel}>
                          Relationship
                        </span>
                        <span className={styles.confirmationFieldValue}>
                          {values.relationship}
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
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
      <footer className={styles.siteFooter}>
        <div className={styles.siteFooterInner}>
          <div className={styles.siteFooterBrand}>
            <Image
              src="/images/brand/primary-logo-full-color.png"
              alt="Vacation Gurus"
              width={160}
              height={52}
              className={styles.footerLogoImg}
            />
          </div>

          <p className={styles.siteFooterDisclaimer}>
            Price does not include hotel taxes which vary and are payable upon
            check-in.
          </p>

          <div className={styles.siteFooterBbb}>
            <Image
              src="/images/brand/bbb-badge.png"
              alt="BBB Accredited Business – BBB Rating A-"
              width={180}
              height={40}
              className={styles.bbbBadgeImg}
            />
          </div>

          <p className={styles.siteFooterEntity}>
            Vacation Packages are promoted by Vacation VIP and fulfilled by
            Sunstate Client Services DBA: Vacation Gurus, LLC.
          </p>

          <p className={styles.siteFooterSot}>SOT: Florida: ST44476</p>

          <div className={styles.siteFooterLinks}>
            <a href="#">Terms and Conditions</a>
            <span className={styles.siteFooterDivider}>|</span>
            <a href="#">Privacy Policy</a>
          </div>

          <p className={styles.siteFooterCopy}>
            <a href="https://vacationvip.com">Vacationvip.com</a>
            {"  |  "}Copyright © 2026{"  |  "}All Rights Reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
