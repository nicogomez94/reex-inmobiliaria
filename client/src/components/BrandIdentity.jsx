import { BRAND } from "../config/brand";

export default function BrandIdentity({ footer = false }) {
  return (
    <span className={`brand-identity${footer ? " brand-identity-footer" : ""}`}>
      <span className="brand-wordmark" aria-label={BRAND.fullName}>
        <strong>REEX</strong>
        <small>INMOBILIARIA</small>
      </span>

      <span className="brand-registration" aria-label={`CUCICBA, matrícula número ${BRAND.registrationNumber}`}>
        <img src="/cucicba-logo.svg" alt="" aria-hidden="true" />
        <span>
          <small>CUCICBA</small>
          <strong>Matrícula N.º {BRAND.registrationNumber}</strong>
        </span>
      </span>
    </span>
  );
}
