import styles from "./BillingPartyForm.module.scss";
import type { BillingPartyType } from "../../types/party";

interface BillingPartyFormProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  party: BillingPartyType;
  errors: Record<string, string>;
}

const BillingPartyForm: React.FC<BillingPartyFormProps> = ({ handleInputChange, handleSubmit, party, errors }) => {
  return (
    <div className={styles.partyFormContainer}>
      <form className={styles.partyForm} onSubmit={handleSubmit}>
        <h2>Add Billing Party</h2>
        <div className={styles.formGroup}>
          <label>Billing Party Name</label>
          <input
            name="name"
            value={party.name}
            onChange={handleInputChange}
            placeholder="Billing Party Name"
          />
          {errors.name && <p className={styles.errorText}>{errors.name}</p>}
        </div>
        <div className={styles.formGroup}>
          <label>Billing Party Address</label>
          <input
            name="address"
            value={party.address}
            onChange={handleInputChange}
            placeholder="Billing Party Address"
          />
          {errors.address && (
            <p className={styles.errorText}>{errors.address}</p>
          )}
        </div>
        <div className={styles.formGroup}>
          <label>Billing Party GST Number</label>
          <input
            name="gst_no"
            value={party.gst_no}
            onChange={handleInputChange}
            placeholder="Billing Party GST Number"
          />
          {errors.gst_no && <p className={styles.errorText}>{errors.gst_no}</p>}
        </div>
        <div className={styles.formControl}>
          <button className={styles.addBtn} type="submit">
            Add Party
          </button>
        </div>
      </form>
    </div>
  );
};

export default BillingPartyForm;
