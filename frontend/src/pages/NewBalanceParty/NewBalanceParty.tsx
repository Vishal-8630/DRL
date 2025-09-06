import React from "react";
import styles from "./NewBalanceParty.module.scss";
import FormSection from "../../components/FormSection";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { selectBalancePartyLoading } from "../../features/balanceParty/balancePartySelectors";
import FormInput from "../../components/FormInput";
import type { BalancePartyType } from "../../types/vehicle";
import { balancePartyFailure, balancePartyStart, balancePartySuccess } from "../../features/balanceParty";
import Loading from "../../components/Loading";
import { addMessage } from "../../features/message";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";

const NewBalanceParty = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector(selectBalancePartyLoading);

  const [balanceParty, setBalanceParty] = React.useState<BalancePartyType>({
    _id: "",
    party_name: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setBalanceParty((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(balancePartyStart());
    try {
        const response = await api.post("/balance-party/new-balance-party", balanceParty);
        const data = response.data;
        dispatch(addMessage({ type: "success", text: data.message }));
        dispatch(balancePartySuccess());
        navigate('/vehicle-entry/all-balance-parties');
    } catch (error: any) {
        const errors = error.response?.data?.errors;
        if (errors) {
            console.log(errors);
            setErrors(error.response.data.errors);
        }
        dispatch(balancePartyFailure());
    }
  };

  if (loading) <Loading />

  return (
    <div className={styles.balancePartyFormContainer}>
      <form className={styles.balancePartyForm} onSubmit={handleSubmit}>
        <div className={styles.inputArea}>
          <FormSection title="New Balance Party">
            <FormInput
              type="text"
              id="party_name"
              name="party_name"
              label="Party Name"
              value={balanceParty.party_name}
              placeholder="Party Name"
              error={errors.party_name}
              onChange={handleChange}
            />
            
          <Button
            type="submit"
            text="Add Balance Party"
            variant="primary"
            loading={loading}
            disabled={loading}
            className={styles.submitBtn}
          />
          </FormSection>
        </div>
      </form>
    </div>
  );
};

export default NewBalanceParty;
